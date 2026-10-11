import { NextRequest, NextResponse } from 'next/server'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

async function processSingleFile(file: File): Promise<{ url: string; fileUrl: string; filename: string }> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type "${file.type}". Only JPEG, PNG, WebP, GIF, and SVG are allowed.`)
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File "${file.name}" is too large. Maximum size is 10MB.`)
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Try Cloudinary if configured
  const hasCloudinary = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )

  if (hasCloudinary) {
    try {
      const result = await uploadToCloudinary(buffer, 'helloet/businesses')
      return {
        url: result.secure_url,
        fileUrl: result.secure_url,
        filename: result.public_id
      }
    } catch (cloudErr) {
      console.warn('Cloudinary upload failed, falling back to local storage:', cloudErr)
    }
  }

  // Local filesystem fallback
  const uploadsDir = join(process.cwd(), 'public', 'uploads', 'businesses')
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true })
  }

  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = file.name?.includes('.') 
    ? file.name.split('.').pop()?.toLowerCase() || 'jpg'
    : (file.type.split('/')[1] || 'jpg')
  const filename = `${timestamp}-${randomString}.${extension}`
  const filepath = join(uploadsDir, filename)

  await writeFile(filepath, buffer)

  const localUrl = `/uploads/businesses/${filename}`
  return {
    url: localUrl,
    fileUrl: localUrl,
    filename
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Support both multiple files ('files' or multiple 'file') and single 'file'
    const rawFiles: FormDataEntryValue[] = []
    const filesList = formData.getAll('files')
    const fileList = formData.getAll('file')

    if (filesList.length > 0) {
      rawFiles.push(...filesList)
    } else if (fileList.length > 0) {
      rawFiles.push(...fileList)
    }

    const files = rawFiles.filter((item): item is File => item instanceof File && item.size > 0)

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid files provided' },
        { status: 400 }
      )
    }

    const uploadedResults: Array<{ url: string; fileUrl: string; filename: string }> = []

    for (const file of files) {
      const saved = await processSingleFile(file)
      uploadedResults.push(saved)
    }

    const urls = uploadedResults.map(r => r.url)
    const primary = uploadedResults[0]

    return NextResponse.json({
      success: true,
      message: `${uploadedResults.length} image(s) uploaded successfully`,
      url: primary.url,
      fileUrl: primary.fileUrl,
      filename: primary.filename,
      urls,
      fileUrls: urls,
      files: uploadedResults
    })

  } catch (error: any) {
    console.error('Upload route error:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to upload image(s)' },
      { status: 500 }
    )
  }
}
