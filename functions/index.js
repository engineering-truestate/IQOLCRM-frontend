import { https, logger } from 'firebase-functions'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { google } from 'googleapis'
import { onRequest } from 'firebase-functions/v2/https'
import axios from 'axios'
import mime from 'mime-types'
import cors from 'cors'

initializeApp()
const db = getFirestore()

// Configure CORS to allow all origins and methods
const corsHandler = cors({
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
})

export const getCollectionDocumentCount = https.onRequest(async (req, res) => {
    return corsHandler(req, res, async () => {
        try {
            // Handle preflight OPTIONS request
            if (req.method === 'OPTIONS') {
                return res.status(200).end()
            }

            if (req.method !== 'POST') {
                return res.status(405).json({
                    error: 'Method not allowed. Use POST request.',
                    timestamp: new Date().toISOString(),
                })
            }

            const { collectionName } = req.body

            if (!collectionName || typeof collectionName !== 'string' || collectionName.trim() === '') {
                return res.status(400).json({
                    error: 'Invalid request. Please provide a valid collection name.',
                    example: {
                        collectionName: 'acn-admin',
                    },
                    timestamp: new Date().toISOString(),
                })
            }

            const trimmedCollectionName = collectionName.trim()

            try {
                // Try aggregation method first
                const snapshot = await db.collection(trimmedCollectionName).count().get()
                const count = snapshot.data().count

                return res.status(200).json({
                    success: true,
                    collectionName: trimmedCollectionName,
                    documentCount: count,
                    method: 'aggregation',
                    timestamp: new Date().toISOString(),
                })
            } catch (aggregationError) {
                console.log(
                    `Aggregation failed for ${trimmedCollectionName}, trying fallback method:`,
                    aggregationError.message,
                )

                try {
                    // Fallback to getting all documents and counting
                    const snapshot = await db.collection(trimmedCollectionName).get()
                    const count = snapshot.size

                    return res.status(200).json({
                        success: true,
                        collectionName: trimmedCollectionName,
                        documentCount: count,
                        method: 'fallback',
                        timestamp: new Date().toISOString(),
                    })
                } catch (fallbackError) {
                    console.error(`Both aggregation and fallback failed for ${trimmedCollectionName}:`, fallbackError)

                    return res.status(500).json({
                        success: false,
                        collectionName: trimmedCollectionName,
                        error: 'Failed to count documents',
                        details: fallbackError.message,
                        timestamp: new Date().toISOString(),
                    })
                }
            }
        } catch (error) {
            console.error('Error in getCollectionDocumentCount function:', error)

            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                details: error.message,
                timestamp: new Date().toISOString(),
            })
        }
    })
})

export const setCustomClaims = https.onRequest(async (req, res) => {
    return corsHandler(req, res, async () => {
        try {
            // Handle preflight OPTIONS request
            if (req.method === 'OPTIONS') {
                return res.status(200).end()
            }

            if (req.method !== 'POST') {
                return res.status(405).json({
                    error: 'Method not allowed. Use POST request.',
                    timestamp: new Date().toISOString(),
                })
            }

            const uid = req.body.uid
            const role = req.body.role

            if (!uid || !role) {
                return res.status(400).json({
                    error: 'Missing UID or role',
                    timestamp: new Date().toISOString(),
                })
            }

            await getAuth().setCustomUserClaims(uid, { role })

            return res.status(200).json({
                success: true,
                message: `Success! User ${uid} has been assigned role ${role}`,
                timestamp: new Date().toISOString(),
            })
        } catch (error) {
            console.error('Error in setCustomClaims function:', error)

            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                details: error.message,
                timestamp: new Date().toISOString(),
            })
        }
    })
})

// ACN Upload to Google Drive

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })

export const drive = google.drive({ version: 'v3', auth: oauth2Client })

export const uploadToDrive = onRequest(async (req, res) => {
    return corsHandler(req, res, async () => {
        try {
            const { propId, uploadedFileUrls } = req.body

            if (!propId || !uploadedFileUrls) {
                return res.status(400).json({ error: 'Missing propId or uploadedFiles' })
            }

            const parentFolderId = '1sfUWHYjBvi_6LTjdyAh8LqX4Bay3neMi'
            const folderId = await findOrCreateFolder(parentFolderId, propId)

            await emptyGoogleDriveFolder(folderId)

            const uploadedFiles = [...uploadedFileUrls.photo, ...uploadedFileUrls.video, ...uploadedFileUrls.document]
            for (const file of uploadedFiles) {
                await uploadFileToDrive(file, folderId)
            }

            const sharableFolderUrl = await getSharableFolderUrl(folderId)

            res.status(200).json({
                success: true,
                sharableFolderUrl,
            })
        } catch (error) {
            console.error('Error uploading to Google Drive:', error)
            res.status(500).json({ error: error.message })
        }
    })
})

/**
 * Deletes all files inside a Google Drive folder.
 */
export async function emptyGoogleDriveFolder(folderId) {
    try {
        // List all files in the folder
        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            fields: 'files(id, name)',
        })

        const files = response.data.files
        if (files.length === 0) {
            console.log(`Folder (${folderId}) is already empty.`)
            return
        }

        // Delete each file in the folder
        for (const file of files) {
            await drive.files.delete({ fileId: file.id })
            console.log(`Deleted file: ${file.name} (ID: ${file.id})`)
        }

        console.log(`Successfully emptied folder: ${folderId}`)
    } catch (error) {
        console.error(`Error emptying folder: ${error.message}`)
        throw new Error(`Error emptying folder: ${error.message}`)
    }
}

// ✅ Helper function to find or create a folder
export async function findOrCreateFolder(parentFolderId, folderName) {
    const response = await drive.files.list({
        q: `'${parentFolderId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
    })

    if (response.data.files.length > 0) {
        return response.data.files[0].id
    }

    const folder = await drive.files.create({
        requestBody: {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentFolderId],
        },
        fields: 'id',
    })

    return folder.data.id
}

const extractFilenameFromUrl = (fileUrl) => {
    const urlParts = fileUrl.split('%2F')
    const lastPart = urlParts[urlParts.length - 1]
    return decodeURIComponent(lastPart.split('?')[0])
}

// ✅ Helper function to upload a file from Firebase Storage to Google Drive
export async function uploadFileToDrive(fileUrl, folderId) {
    try {
        const response = await axios.get(fileUrl, { responseType: 'stream' })

        const originalName = extractFilenameFromUrl(fileUrl)
        const mimeType = mime.lookup(originalName) || 'application/octet-stream'

        const fileMetadata = {
            name: originalName, // ✅ Use the same filename from Firebase Storage
            parents: [folderId],
        }
        const media = {
            mimeType: mimeType,
            body: response.data,
        }

        const file = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id',
        })

        console.log(`Uploaded ${originalName} to Google Drive (ID: ${file.data.id})`)
    } catch (error) {
        console.error(`Error uploading ${fileUrl} to Google Drive:`, error)
        throw new Error(`Error uploading file to Google Drive: ${error.message}`)
    }
}

// ✅ Helper function to make the folder sharable
async function getSharableFolderUrl(folderId) {
    try {
        await drive.permissions.create({
            fileId: folderId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        })

        return `https://drive.google.com/drive/folders/${folderId}`
    } catch (error) {
        console.error('Error setting sharing permissions:', error)
        throw new Error(`Error setting folder sharing permissions: ${error.message}`)
    }
}
