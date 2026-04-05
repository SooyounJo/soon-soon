import React, {
  Children,
  cloneElement,
  createRef,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import gsap from 'gsap';

export const Card = forwardRef(({ customClass, ...rest }, ref) => (
  <div ref={ref} {...rest} className={`card ${customClass ?? ''} ${rest.className ?? ''}`.trim()} />
));
Card.displayName = 'Card';

const makeSlot = (i, distX, distY, total) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
});

const placeNow = (el, slot, skew) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true,
  });

const CardSwap = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 3000,
  pauseOnHover = false,
  enableWheel = true,
  onCardClick,
  skewAmount = 6,
  easing = 'elastic',
  containerClassName = '',
  children,
}) => {
  const config =
    easing === 'elastic'
      ? {
          ease: 'elastic.out(0.6,0.9)',
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05,
        }
      : {
          ease: 'power1.inOut',
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2,
        };

  const childArr = useMemo(() => Children.toArray(children), [children]);
  // 카드 개수만 바뀔 때 ref 줄 재생성 (내용 교체는 부모가 key로 처리)
  const refs = useMemo(
    () => childArr.map(() => createRef()),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ref 수는 length로 충분
    [childArr.length]
  );

  const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));

  const tlRef = useRef(null);
  const intervalRef = useRef(null);
  const container = useRef(null);
  const swapRef = useRef(null);
  const lastWheelAtRef = useRef(0);

  useEffect(() => {
    // children 개수 변경 시에도 스왑 순서가 동기화되게 리셋
    order.current = Array.from({ length: refs.length }, (_, i) => i);

    const total = refs.length;
    refs.forEach((r, i) => {
      if (!r.current) return;
      placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount);
    });

    // 뒤로 간 카드는 이벤트를 먹지 않게: "맨 앞 카드만" 인터랙션
    refs.forEach((r) => {
      const el = r.current;
      if (!el) return;
      el.dataset.flowriumOrigTabindex = el.getAttribute('tabindex') ?? '';
    });
    const setInteractivity = (frontIndex) => {
      for (let i = 0; i < refs.length; i++) {
        const el = refs[i].current;
        if (!el) continue;
        const isFront = i === frontIndex;
        el.style.pointerEvents = isFront ? 'auto' : 'none';
        if (isFront) {
          const orig = el.dataset.flowriumOrigTabindex ?? '';
          if (orig === '') el.removeAttribute('tabindex');
          else el.setAttribute('tabindex', orig);
          el.removeAttribute('aria-hidden');
        } else {
          el.setAttribute('tabindex', '-1');
          el.setAttribute('aria-hidden', 'true');
        }
      }
    };
    setInteractivity(order.current[0]);

    const swap = () => {
      if (order.current.length < 2) return;
      if (tlRef.current && typeof tlRef.current.isActive === 'function' && tlRef.current.isActive()) {
        return;
      }

      const [front, ...rest] = order.current;
      const elFront = refs[front].current;
      if (!elFront) return;
      const tl = gsap.timeline();
      tlRef.current = tl;
      setInteractivity(-1);

      const dropY = Math.max(500, Math.round(height * 1.15));
      tl.to(elFront, {
        y: `+=${dropY}`,
        duration: config.durDrop,
        ease: config.ease,
      });

      tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, 'promote');
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease,
          },
          `promote+=${i * 0.15}`
        );
      });

      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
      tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
      tl.call(
        () => {
          gsap.set(elFront, { zIndex: backSlot.zIndex });
        },
        undefined,
        'return'
      );
      tl.to(
        elFront,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          duration: config.durReturn,
          ease: config.ease,
        },
        'return'
      );

      tl.call(() => {
        order.current = [...rest, front];
        setInteractivity(order.current[0]);
      });
    };

    swapRef.current = swap;
    swap();
    intervalRef.current = window.setInterval(swap, delay);

    const onWheel = (e) => {
      if (!enableWheel) return;
      // SubPageShell: 문서 스크롤 대신 카드 넘김
      const root = document.documentElement;
      const enabled = root.classList.contains('flowrium-page-sub-no-scroll');
      if (!enabled) return;

      const dy = e.deltaY;
      if (Math.abs(dy) < 4) return;

      const now = Date.now();
      if (now - lastWheelAtRef.current < 420) return;
      lastWheelAtRef.current = now;

      e.preventDefault();
      swapRef.current?.();
      clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(swapRef.current, delay);
    };

    if (pauseOnHover) {
      const node = container.current;
      const pause = () => {
        tlRef.current?.pause();
        clearInterval(intervalRef.current);
      };
      const resume = () => {
        tlRef.current?.play();
        intervalRef.current = window.setInterval(swapRef.current, delay);
      };
      node.addEventListener('mouseenter', pause);
      node.addEventListener('mouseleave', resume);
      if (enableWheel) window.addEventListener('wheel', onWheel, { passive: false });
      return () => {
        node.removeEventListener('mouseenter', pause);
        node.removeEventListener('mouseleave', resume);
        if (enableWheel) window.removeEventListener('wheel', onWheel);
        clearInterval(intervalRef.current);
      };
    }
    if (enableWheel) window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      if (enableWheel) window.removeEventListener('wheel', onWheel);
      clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- GSAP 타임라인은 마운트 시 시퀀스로 묶임
  }, [cardDistance, verticalDistance, delay, pauseOnHover, enableWheel, skewAmount, easing, childArr.length]);

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: (e) => {
            child.props.onClick?.(e);
            onCardClick?.(i);
          },
        })
      : child
  );

  return (
    <div
      ref={container}
      className={`card-swap-container ${containerClassName}`.trim()}
      style={{ width, height }}
    >
      {rendered}
    </div>
  );
};

export default CardSwap;
