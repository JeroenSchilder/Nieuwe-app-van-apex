import { useEffect, useRef } from "react";

export function vimeoEmbedUrl(id, hash) {
  const params = new URLSearchParams({ title: "0", byline: "0", portrait: "0", dnt: "1" });
  if (hash) params.set("h", hash);
  return `https://player.vimeo.com/video/${id}?${params.toString()}`;
}

// Haalt id + hash uit elke Vimeo-link (vimeo.com/123/abc, player.vimeo.com/video/123?h=abc, manage/videos/123/abc).
export function parseVimeoUrl(url) {
  const m = String(url || "").match(/vimeo\.com\/(?:video\/|manage\/videos\/)?(\d+)(?:\/([0-9a-f]{6,}))?/i);
  if (!m) return null;
  const h = String(url).match(/[?&]h=([0-9a-f]+)/i);
  return { id: m[1], hash: m[2] || (h ? h[1] : "") };
}

// Vimeo-iframe. onEnded wordt aangeroepen als de video is afgekeken (via de Vimeo postMessage API).
export default function VimeoPlayer({ id, hash, title, onEnded, seek }) {
  const ref = useRef(null);

  // seek = { t: seconden, n: teller } — springt naar dat moment en speelt af.
  useEffect(() => {
    if (!seek) return;
    const post = (method, value) => ref.current?.contentWindow?.postMessage(JSON.stringify({ method, value }), "*");
    post("setCurrentTime", seek.t);
    post("play");
  }, [seek]);

  useEffect(() => {
    if (!onEnded) return undefined;
    const handler = (e) => {
      if (!String(e.origin).includes("vimeo.com")) return;
      let msg = e.data;
      if (typeof msg === "string") {
        try { msg = JSON.parse(msg); } catch { return; }
      }
      if (msg?.event === "ready") {
        ref.current?.contentWindow?.postMessage(JSON.stringify({ method: "addEventListener", value: "ended" }), "*");
      }
      if (msg?.event === "ended") onEnded();
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onEnded]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black" style={{ paddingTop: "56.25%" }}>
      <iframe
        ref={ref}
        src={vimeoEmbedUrl(id, hash)}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
