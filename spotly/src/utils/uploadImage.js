/**
 * Uploads an image file to Cloudinary using an unsigned upload preset.
 * Requires VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env.local
 *
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} The secure URL of the uploaded image
 * @throws {Error} On network failure or non-2xx response
 */
export async function uploadImage (file) {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  if (!cloud || !preset) {
    throw new Error('Cloudinary credentials missing — check .env.local')
  }

  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', preset)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: 'POST',
    body: fd,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Upload failed (${res.status}): ${body}`)
  }
  const data = await res.json()
  return data.secure_url
}
