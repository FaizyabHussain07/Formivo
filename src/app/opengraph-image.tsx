import { ImageResponse } from "next/og";

export const alt = "Formivo — the form backend for developers who ship for clients";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social preview (1200×630) generated in the brand's dark teal palette. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        backgroundColor: "#0b1f1c",
        backgroundImage:
          "radial-gradient(circle at 12% 0%, rgba(15,118,110,0.55), transparent 55%), radial-gradient(circle at 88% 90%, rgba(45,212,191,0.25), transparent 50%)",
        color: "#ecf5f2",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            backgroundColor: "#2dd4bf",
            color: "#04120f",
            fontSize: "34px",
            fontWeight: 700,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          F
        </div>
        <div style={{ display: "flex", fontSize: "34px", fontWeight: 700, letterSpacing: "-1px" }}>
          Formivo
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            display: "flex",
            fontSize: "76px",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-2.5px",
            maxWidth: "900px",
          }}
        >
          The form backend for developers.
        </div>
        <div style={{ display: "flex", fontSize: "30px", color: "#a8bdb7", lineHeight: 1.4 }}>
          Connect your website forms. Manage submissions. Share with clients.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            display: "flex",
            padding: "10px 22px",
            borderRadius: "999px",
            border: "1px solid rgba(45,212,191,0.5)",
            backgroundColor: "rgba(45,212,191,0.12)",
            color: "#2dd4bf",
            fontSize: "22px",
          }}
        >
          No API keys, ever
        </div>
        <div
          style={{
            display: "flex",
            padding: "10px 22px",
            borderRadius: "999px",
            border: "1px solid rgba(236,245,242,0.18)",
            color: "#ecf5f2",
            fontSize: "22px",
          }}
        >
          formivo.faizyab.me
        </div>
      </div>
    </div>,
    { ...size },
  );
}
