import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a2b4a",
          borderRadius: 36,
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="6" y="18" width="5" height="8" rx="1" fill="#00c389" />
          <rect x="13.5" y="12" width="5" height="14" rx="1" fill="#00c389" />
          <rect x="21" y="6" width="5" height="20" rx="1" fill="#00c389" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
