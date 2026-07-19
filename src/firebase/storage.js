import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './config'

/** Uploads a File/Blob to `path` (e.g. `users/${uid}/avatar.png`). Returns the storage path. */
export async function uploadFile(path, file) {
  try {
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    return path
  } catch (error) {
    throw new Error(`Failed to upload file to "${path}": ${error.message}`)
  }
}

/** Gets a public download URL for a file already in Storage at `path`. */
export async function getFileURL(path) {
  try {
    return await getDownloadURL(ref(storage, path))
  } catch (error) {
    throw new Error(`Failed to get download URL for "${path}": ${error.message}`)
  }
}
