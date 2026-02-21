import { defineMiddlewares } from "@medusajs/medusa"
import * as fs from "fs"
import * as path from "path"
import { NextFunction, Request, Response } from "express"

const UPLOAD_DIR = process.env.FILE_UPLOAD_DIR || path.join(process.cwd(), "uploads")

// Mime types for common image formats
const MIME_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
}

/**
 * Serve uploaded files statically at /uploads/*
 * Required because @medusajs/file-local does not register static serving automatically.
 */
const serveUploads = (req: Request, res: Response, next: NextFunction) => {
  // Extract filename from the full URL path
  // req.path may be "/filename.webp" (stripped) or "/uploads/filename.webp" (full)
  const urlPath = req.path || req.url || ""
  const filename = path.basename(urlPath)

  if (!filename || filename.startsWith(".")) {
    return next()
  }

  const filePath = path.join(UPLOAD_DIR, filename)

  // Security: ensure resolved path is within UPLOAD_DIR
  if (!filePath.startsWith(UPLOAD_DIR)) {
    return next()
  }

  if (!fs.existsSync(filePath)) {
    return next()
  }

  const ext = path.extname(filename).toLowerCase()
  const mimeType = MIME_TYPES[ext] || "application/octet-stream"

  res.setHeader("Content-Type", mimeType)
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable")
  res.sendFile(filePath)
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/uploads/*",
      middlewares: [serveUploads],
    },
  ],
})
