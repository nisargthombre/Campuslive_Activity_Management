/**
 * Utility helper to crop images client-side using HTML5 Canvas.
 * Generates an optimized WebP blob (with JPEG fallback) and an Object URL without uploading to server.
 *
 * @param {string} imageSrc - Source image URL or Object URL
 * @param {object} pixelCrop - { x, y, width, height }
 * @returns {Promise<{ blob: Blob, previewUrl: string }>}
 */
export async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', (err) => reject(err))
    img.setAttribute('crossOrigin', 'anonymous')
    img.src = imageSrc
  })

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Canvas 2D context is not available.')
  }

  // Set square canvas dimensions to exact cropped dimensions
  canvas.width = Math.round(pixelCrop.width)
  canvas.height = Math.round(pixelCrop.height)

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const previewUrl = URL.createObjectURL(blob)
          resolve({ blob, previewUrl })
        } else {
          // Fallback to image/jpeg if WebP format is unsupported
          canvas.toBlob(
            (jpegBlob) => {
              if (!jpegBlob) {
                reject(new Error('Canvas image conversion failed.'))
                return
              }
              const previewUrl = URL.createObjectURL(jpegBlob)
              resolve({ blob: jpegBlob, previewUrl })
            },
            'image/jpeg',
            0.9
          )
        }
      },
      'image/webp',
      0.9
    )
  })
}
