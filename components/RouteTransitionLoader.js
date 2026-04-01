import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import CircularText from './CircularText';

const MIN_SHOW_MS = 520;
const LEAVE_MS = 560;
const MAX_IMAGE_WAIT_MS = 2600;

function sleep(ms) {
  return new Promise((r) => window.setTimeout(r, ms));
}

function waitForImages(maxMs) {
  return new Promise((resolve) => {
    const root = document.getElementById('__next');
    if (!root) return resolve();

    const imgs = Array.from(root.querySelectorAll('img')).filter((img) => !img.complete);
    if (!imgs.length) return resolve();

    let finished = false;
    let remaining = imgs.length;

    const finish = () => {
      if (finished) return;
      finished = true;
      resolve();
    };

    const timer = window.setTimeout(finish, maxMs);

    imgs.forEach((img) => {
      const onDone = () => {
        remaining -= 1;
        if (remaining <= 0) {
          window.clearTimeout(timer);
          finish();
        }
      };
      img.addEventListener('load', onDone, { once: true });
      img.addEventListener('error', onDone, { once: true });
    });
  });
}

export default function RouteTransitionLoader() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const startAtRef = useRef(0);
  const navTokenRef = useRef(0);

  useEffect(() => {
    const root = document.documentElement;

    const show = () => {
      navTokenRef.current += 1;
      startAtRef.current = Date.now();
      setVisible(true);
      setLeaving(false);
      root.classList.add('flowrium-route-loading');
    };

    const hide = async () => {
      const token = navTokenRef.current;
      const elapsed = Date.now() - startAtRef.current;
      const remain = Math.max(0, MIN_SHOW_MS - elapsed);
      if (remain) await sleep(remain);
      if (token !== navTokenRef.current) return;

      await waitForImages(MAX_IMAGE_WAIT_MS);
      if (token !== navTokenRef.current) return;

      setLeaving(true);
      window.setTimeout(() => {
        if (token !== navTokenRef.current) return;
        setVisible(false);
        setLeaving(false);
        root.classList.remove('flowrium-route-loading');
      }, LEAVE_MS);
    };

    const onStart = () => show();
    const onDone = () => hide();
    const onErr = () => hide();

    router.events.on('routeChangeStart', onStart);
    router.events.on('routeChangeComplete', onDone);
    router.events.on('routeChangeError', onErr);
    return () => {
      router.events.off('routeChangeStart', onStart);
      router.events.off('routeChangeComplete', onDone);
      router.events.off('routeChangeError', onErr);
      root.classList.remove('flowrium-route-loading');
    };
  }, [router.events]);

  if (!visible) return null;

  return (
    <div
      className={`flowrium-entry-loader flowrium-entry-loader--route${
        leaving ? ' flowrium-entry-loader--leave' : ''
      }`}
      aria-hidden
    >
      <div className="flowrium-entry-loader-inner">
        <CircularText
          text="soon-soon-soon-soon-"
          spinDuration={12}
          className="flowrium-entry-loader-circular"
        />
      </div>
    </div>
  );
}

