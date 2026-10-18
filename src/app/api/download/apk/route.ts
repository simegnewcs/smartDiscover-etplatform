import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const apkPath = join(process.cwd(), 'public', 'downloads', 'HelloET.apk')
    
    if (!existsSync(apkPath)) {
      return NextResponse.json(
        { success: false, message: 'APK build is currently being updated. Please install via PWA in the meantime.' },
        { status: 404 }
      )
    }

    const fileBuffer = await readFile(apkPath)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="HelloET-v1.0.0.apk"',
        'Content-Length': fileBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
      },
    })
  } catch (error) {
    console.error('Error serving APK:', error)
    return NextResponse.json(
      { success: false, message: 'Error initiating APK download' },
      { status: 500 }
    )
  }
}
