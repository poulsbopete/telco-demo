/** Full-height iframe under the sticky Telco NOC bar. */
export function FrameEmbed({ title, src, bg = '#fbfbfd' }) {
  return (
    <iframe
      title={title}
      src={src}
      className="w-full border-0 block"
      style={{ height: 'calc(100vh - 2.75rem)', minHeight: '640px', background: bg }}
      allow="fullscreen"
    />
  );
}

export function SlidesEmbed() {
  return (
    <FrameEmbed
      title="Elastic Observability — launch slides"
      src="/slides/"
      bg="#000"
    />
  );
}

export function PresenterEmbed() {
  return (
    <FrameEmbed
      title="Presenter guides"
      src="/presenter/"
      bg="#fbfbfd"
    />
  );
}

export function WorkshopDeckEmbed() {
  return (
    <FrameEmbed
      title="Telco Metrics + ML workshop deck"
      src="/slides/workshop/#1"
      bg="#06080c"
    />
  );
}
