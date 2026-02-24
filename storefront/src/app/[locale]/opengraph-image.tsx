import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "BrightSign.cz — Digital Signage Solutions"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#1a2b4a",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            Bright
          </span>
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#00c389",
            }}
          >
            Sign
          </span>
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#ffffff",
              opacity: 0.6,
            }}
          >
            .cz
          </span>
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#ffffff",
            opacity: 0.8,
            textAlign: "center",
          }}
        >
          Profesionální digital signage řešení pro střední Evropu
        </div>
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "40px",
          }}
        >
          {["CZ", "SK", "PL", "AT", "DE"].map((c) => (
            <div
              key={c}
              style={{
                fontSize: 18,
                color: "#00c389",
                border: "2px solid #00c389",
                borderRadius: "8px",
                padding: "8px 16px",
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
