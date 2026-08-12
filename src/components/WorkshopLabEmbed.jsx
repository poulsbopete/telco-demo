/** In-app Workshop hub under the sticky Telco NOC bar.
 *  Instruqt cannot be iframed (frame-ancestors limited to *.instruqt.com),
 *  so we keep navigation here and open the lab in a new tab.
 */
export function WorkshopLabEmbed({ instruqtUrl }) {
  return (
    <div
      className="w-full bg-[#06080c] text-[#f4f6f9] flex flex-col"
      style={{ minHeight: 'calc(100vh - 2.75rem)' }}
    >
      <div className="flex-1 max-w-[720px] mx-auto px-6 py-16 md:py-24">
        <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-[#00bfb3] mb-4">
          Hands-on lab
        </p>
        <h1 className="text-[36px] md:text-[44px] font-semibold tracking-tight leading-[1.1] mb-4">
          Telco Metrics + ML on Elastic Serverless
        </h1>
        <p className="text-[17px] text-[#8b95a8] leading-relaxed mb-10 max-w-[540px]">
          Walk OpenTelemetry metrics, AIOps signals, and workflow remediation in a live
          Serverless Observability project. Your Telco NOC bar stays here — the lab opens
          in a new tab (Instruqt does not allow embedding).
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-12">
          <a
            href={instruqtUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-[#00bfb3] text-[#06080c] text-[15px] font-semibold hover:bg-[#22d3ee] transition-colors"
          >
            Start workshop
          </a>
          <a
            href={instruqtUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] text-[#8b95a8] hover:text-[#f4f6f9] underline underline-offset-4"
          >
            Open invite link
          </a>
        </div>

        <ol className="space-y-4 text-[15px] text-[#8b95a8]">
          <li className="flex gap-3">
            <span className="text-[#00bfb3] font-mono text-[13px] pt-0.5">01</span>
            <span>Connect & confirm Telco NOC telemetry in Serverless Observability</span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#00bfb3] font-mono text-[13px] pt-0.5">02</span>
            <span>Explore metrics with ES|QL</span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#00bfb3] font-mono text-[13px] pt-0.5">03</span>
            <span>Investigate ML / AIOps (Log rate analysis)</span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#00bfb3] font-mono text-[13px] pt-0.5">04</span>
            <span>Close the loop with Workflows</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
