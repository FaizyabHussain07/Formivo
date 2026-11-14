import { ImageResponse } from "next/og";

/**
 * Social share card generator.
 *
 * Every page can request its own card through query parameters, so a shared
 * article link is recognisable instead of showing the same generic banner
 * everywhere. Input is length-capped and rendered as text only. Nothing here
 * is interpreted as markup.
 */
const MAX_TITLE = 120;
const MAX_SUBTITLE = 160;
const KINDS = ["product", "blog", "guide", "comparison", "docs"] as const;
type Kind = (typeof KINDS)[number];

const KIND_LABEL: Record<Kind, string> = {
  product: "Form backend for developers",
  blog: "Formivo blog",
  guide: "Integration guide",
  comparison: "Comparison",
  docs: "Documentation",
};

function clean(value: string | null, max: number): string {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function sizeFor(title: string): number {
  if (title.length > 90) return 52;
  if (title.length > 60) return 60;
  return 68;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title =
    clean(url.searchParams.get("title"), MAX_TITLE) || "Forms to leads, without a backend";
  const subtitle = clean(url.searchParams.get("subtitle"), MAX_SUBTITLE);
  const rawKind = url.searchParams.get("kind");
  const kind: Kind = KINDS.includes(rawKind as Kind) ? (rawKind as Kind) : "product";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "linear-gradient(135deg, #05100e 0%, #0a2420 55%, #0f3b34 100%)",
        color: "#f2fbf8",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 82% 12%, rgba(45,212,191,0.22), transparent 46%), radial-gradient(circle at 8% 92%, rgba(45,212,191,0.12), transparent 42%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -140,
          top: -140,
          width: 480,
          height: 480,
          borderRadius: 999,
          border: "1px solid rgba(45,212,191,0.22)",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "linear-gradient(160deg, #2dd4bf 0%, #0f766e 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 700,
            color: "#04120f",
          }}
        >
          F
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>formivo</span>
          <span style={{ fontSize: 17, color: "#8fb3ab", letterSpacing: "0.08em" }}>
            {KIND_LABEL[kind].toUpperCase()}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          gap: 24,
          flex: 1,
          justifyContent: "center",
          paddingTop: 24,
        }}
      >
        <span
          style={{
            fontSize: sizeFor(title),
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            maxWidth: 940,
          }}
        >
          {title}
        </span>
        {subtitle ? (
          <span style={{ fontSize: 26, color: "#a8c4bd", maxWidth: 880, lineHeight: 1.35 }}>
            {subtitle}
          </span>
        ) : null}
        <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
          {["POST /api/f/{id}", "201 Created", "row-level security"].map((label) => (
            <span
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid rgba(45,212,191,0.3)",
                background: "rgba(45,212,191,0.1)",
                color: "#a5f3e6",
                borderRadius: 999,
                padding: "8px 18px",
                fontSize: 20,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          borderTop: "1px solid rgba(45,212,191,0.22)",
          paddingTop: 26,
          fontSize: 21,
          color: "#8fb3ab",
        }}
      >
        <span>formivo.faizyab.me</span>
        <span style={{ display: "flex", alignItems: "center", gap: 10, color: "#5eead4" }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#5eead4",
            }}
          />
          One endpoint per form
        </span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
