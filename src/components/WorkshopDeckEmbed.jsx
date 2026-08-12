/** Embeds the neon workshop slide deck hosted at /slides/workshop/ */
export function WorkshopDeckEmbed() {
  return (
    <div className="-mx-6 -my-10 md:-my-14">
      <iframe
        title="Telco Metrics + ML workshop deck"
        src="/slides/workshop/#1"
        className="w-full border-0 bg-[#06080c]"
        style={{ height: 'calc(100vh - 2.75rem)', minHeight: '640px' }}
        allow="fullscreen"
      />
    </div>
  );
}
