import { defineMiddlewares } from "@medusajs/medusa"
import express from "express"
import * as path from "path"

const UPLOAD_DIR = process.env.FILE_UPLOAD_DIR || path.join(process.cwd(), "uploads")

/**
 * Serve uploaded files statically at /uploads/*
 * Required because @medusajs/file-local does not register static serving automatically.
 */
export default defineMiddlewares({
  routes: [
    {
      matcher: "/uploads/*",
      middlewares: [express.static(UPLOAD_DIR, { maxAge: "1y", immutable: true })],
    },
  ],
})
