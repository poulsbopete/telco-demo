/** Embeds the neon workshop slide deck hosted at /slides/workshop/ */
export function WorkshopDeckEmbed() {
  return (
    <iframe
      title="Telco Metrics + ML workshop deck"
      src="/slides/workshop/#1"
      className="w-full border-0 bg-[#06080c] block"
      style={{ height: 'calc(100vh - 2.75rem)', minHeight: '640px' }}
      allow="fullscreen"
    />
  );
}
