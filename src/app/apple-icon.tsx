import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon: the Formivo mark on the brand's dark teal. */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0b1f1c",
        backgroundImage:
          "radial-gradient(circle at 30% 20%, rgba(15,118,110,0.6), transparent 60%)",
        color: "#ecf5f2",
        fontSize: "104px",
        fontWeight: 700,
      }}
    >
      F
    </div>,
    { ...size },
  );
}
