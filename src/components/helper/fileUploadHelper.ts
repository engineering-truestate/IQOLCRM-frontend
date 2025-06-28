// Helper to upload a file to Firebase Storage with progress callback
// Usage: await uploadFileToFirebase(file, 'media-files/propertyId/document', (progress) => { ... })
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

/**
 * Upload a file to Firebase Storage with progress callback
 * @param file File to upload
 * @param path Storage path (e.g., 'media-files/propertyId/document')
 * @param onProgress Callback for upload progress (0-100)
 * @returns Promise<string> download URL
 */
export async function uploadFileToFirebase(
    file: File,
    path: string,
    onProgress: (progress: number) => void,
): Promise<string> {
    const storage = getStorage()
    const storageRef = ref(storage, `${path}/${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                onProgress(progress)
            },
            (error) => reject(error),
            async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref)
                resolve(url)
            },
        )
    })
}
