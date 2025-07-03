import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../../firebase'

export interface UploadedFileUrls {
    photo: string[]
    video: string[]
    document: string[]
}

export interface FileToUpload {
    name: string
    file: File
    firebaseUri?: string
}

const API_URL = 'https://uploadtodrive-wi5onpxm7q-uc.a.run.app'

// Upload files to Firebase Storage
export const handleUploadToStorage = async (
    propId: string,
    docsToUpload: { [key: string]: FileToUpload[] },
): Promise<UploadedFileUrls> => {
    const uploadedFileUrls: UploadedFileUrls = {
        photo: [],
        video: [],
        document: [],
    }

    for (const [type, files] of Object.entries(docsToUpload)) {
        for (const fileObj of files) {
            if (fileObj.firebaseUri) {
                uploadedFileUrls[type as keyof UploadedFileUrls].push(fileObj.firebaseUri)
                continue
            }

            try {
                const uniqueFileName = `${Date.now()}-${fileObj.name}`
                const storagePath = `media-files/${propId}/${type}/${uniqueFileName}`

                const storageRef = ref(storage, storagePath)
                const snapshot = await uploadBytes(storageRef, fileObj.file)
                const downloadURL = await getDownloadURL(snapshot.ref)

                uploadedFileUrls[type as keyof UploadedFileUrls].push(downloadURL)
                fileObj.firebaseUri = downloadURL
            } catch (error: any) {
                console.error(`Failed to upload ${type} file (${fileObj.name}):`, error)
                throw new Error(`Error uploading ${type} file (${fileObj.name}): ${error.message}`)
            }
        }
    }

    return uploadedFileUrls
}

// Upload files to Google Drive
export const handleUploadToDrive = async (propId: string, uploadedFileUrls: UploadedFileUrls): Promise<string> => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ propId, uploadedFileUrls }),
        })

        const data = await response.json()
        console.log('Google Drive Response:', data)
        return data.sharableFolderUrl
    } catch (error: any) {
        console.error('Error sending to Google Drive:', error)
        throw new Error(`Error sending files to Google Drive: ${error.message}`)
    }
}
