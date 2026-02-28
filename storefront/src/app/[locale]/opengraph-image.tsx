import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "eBrightSign.eu — Digital Signage Solutions"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const OG_SUBTITLES: Record<string, string> = {
  cs: "Profesionální digital signage řešení pro střední Evropu",
  sk: "Profesionálne digital signage riešenia pre strednú Európu",
  pl: "Profesjonalne rozwiązania digital signage dla Europy Środkowej",
  en: "Professional digital signage solutions for Central Europe",
  de: "Professionelle Digital-Signage-Lösungen für Mitteleuropa",
}

export default function Image({ params }: { params: { locale: string } }) {
  const subtitle = OG_SUBTITLES[params.locale] || OG_SUBTITLES.en

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
              opacity: 0.6,
            }}
          >
            e
          </span>
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
            .eu
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
          {subtitle}
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
