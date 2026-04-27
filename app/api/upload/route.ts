import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import fs from "fs"

export async function POST(req: Request) {
  try {
    const data = await req.formData()
    const file: File | null = data.get('file') as unknown as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    
    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const filepath = path.join(uploadDir, uniqueName)
    await writeFile(filepath, buffer)

    // Return the public URL for the file
    return NextResponse.json({ url: `/uploads/${uniqueName}` })
  } catch (error) {
    console.error('Upload Error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
