const MAX_FILE_BYTES = 15 * 1024 * 1024 // 15MB, before compression

/**
 * Resizes and re-encodes an image File client-side via canvas, so we never
 * upload a multi-megabyte camera photo to Gemini. Returns
 * `{ base64, mimeType, previewUrl }` - `base64` has no `data:` prefix (that's
 * what Firebase AI Logic's inlineData.data expects), `previewUrl` is a data
 * URL suitable for an <img src>.
 */
export function compressImage(file, { maxDimension = 1024, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file.'))
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      reject(new Error('That image is too large (max 15MB).'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read that image file.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not load that image.'))
      img.onload = () => {
        let { width, height } = img
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        const base64 = dataUrl.split(',')[1]
        if (!base64) {
          reject(new Error('Could not process that image.'))
          return
        }
        resolve({ base64, mimeType: 'image/jpeg', previewUrl: dataUrl })
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
