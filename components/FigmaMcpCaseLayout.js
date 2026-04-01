import Head from 'next/head';
import Link from 'next/link';
import { useFlowriumMcpDetailClass } from '../hooks/useFlowriumDetailPageClass';

export default function FigmaMcpCaseLayout({ headTitle, backHref, backLabel, nodeId, children }) {
  useFlowriumMcpDetailClass();

  return (
    <>
      <Head>
        <title>{headTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="mcp-case" data-node-id={nodeId}>
        <header className="mcp-case__bar">
          <Link href={backHref}>{backLabel}</Link>
        </header>
        <div className="mcp-case__glow" aria-hidden />
        <div className="mcp-case__inner">{children}</div>
      </main>
    </>
  );
}
