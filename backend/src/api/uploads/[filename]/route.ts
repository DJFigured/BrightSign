import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import * as fs from "fs"
import * as path from "path"

const UPLOAD_DIR = process.env.FILE_UPLOAD_DIR || path.join(process.cwd(), "uploads")

const MIME_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const filename = req.params.filename

  if (!filename || filename.includes("..") || filename.includes("/")) {
    res.status(400).json({ error: "Invalid filename" })
    return
  }

  const filePath = path.join(UPLOAD_DIR, filename)

  if (!filePath.startsWith(UPLOAD_DIR) || !fs.existsSync(filePath)) {
    res.status(404).json({ error: "File not found" })
    return
  }

  const ext = path.extname(filename).toLowerCase()
  const mimeType = MIME_TYPES[ext] || "application/octet-stream"

  res.setHeader("Content-Type", mimeType)
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable")
  res.sendFile(filePath)
}

// Allow unauthenticated access to uploaded files
export const AUTHENTICATE = false
