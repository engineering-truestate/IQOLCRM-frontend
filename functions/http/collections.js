import { https } from 'firebase-functions'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import cors from 'cors'

initializeApp()
const db = getFirestore()
const corsHandler = cors({ origin: true })

export const getCollectionDocumentCount = https.onRequest(async (req, res) => {
    return corsHandler(req, res, async () => {
        res.set('Access-Control-Allow-Origin', '*')
        try {
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
