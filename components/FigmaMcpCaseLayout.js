import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useFlowriumMcpDetailClass } from '../hooks/useFlowriumDetailPageClass';

function getDefaultBackForPath(pathname) {
  if (!pathname) return { href: '/', label: '< Home' };
  if (pathname.startsWith('/lab/')) return { href: '/lab', label: '< Lab' };
  if (pathname.startsWith('/obj/')) return { href: '/obj', label: '< Multi' };
  if (pathname.startsWith('/2d/')) return { href: '/2d', label: '< Mobile' };
  return { href: '/', label: '< Home' };
}

export default function FigmaMcpCaseLayout({
  headTitle,
  nodeId,
  children,
  className = '',
  backHref,
  backLabel,
}) {
  useFlowriumMcpDetailClass();
  const router = useRouter();
  const fallback = getDefaultBackForPath(router?.pathname);
  const href = backHref || fallback.href;
  const label = backLabel || fallback.label;

  return (
    <>
      <Head>
        <title>{headTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={`mcp-case${className ? ` ${className}` : ''}`} data-node-id={nodeId}>
        <div className="mcp-case__glow" aria-hidden />
        <Link className="mcp-case__back" href={href}>
          {label}
        </Link>
        <div className="mcp-case__inner">{children}</div>
      </main>
    </>
  );
}
