// react-bits CardSwap (JS/CSS variant) — pulled from
// https://reactbits.dev/r/CardSwap-JS-CSS.json, animation logic kept exactly
// as upstream-tested. Site-specific theming lives in index.css (.route-card
// ...) layered on top of the base .cardswap-card/.card-swap-container classes
// below — don't restyle position/transform here, that breaks the stack.
//
// Deviations from upstream:
//  1. The base card class is `cardswap-card`, not the registry's plain
//     `card`. CardSwap.css is a global stylesheet (no CSS modules/scoping
//     here), and this site already had its own widely-used `.card` class
//     (padding/border/hover-lift, see index.css) — importing the registry
//     version verbatim silently gave every `.card` on the site (e.g.
//     Certifications' cert cards) `position:absolute;top:50%;left:50%` too,
//     collapsing them to ~0 height. Renamed to avoid ever colliding again.
//  2. Exposes an imperative handle ({ next, prev }) so a consumer can drive
//     the stack from outside (e.g. RouteCardSwap's wheel-to-cycle), reusing
//     the exact same tweened swap the auto-timer uses. `prev` is the mirror
//     of the upstream `swap` — promotes the back card straight to the front
//     instead of dropping the front card to the back.

import React, {
  Children, cloneElement, forwardRef, isValidElement,
  useEffect, useMemo, useRef,
} from 'react';
import gsap from 'gsap';
import './CardSwap.css';

export const Card = forwardRef(({ customClass, ...rest }, ref) => (
  <div ref={ref} {...rest} className={`cardswap-card ${customClass ?? ''} ${rest.className ?? ''}`.trim()} />
));
Card.displayName = 'Card';

const makeSlot = (i, distX, distY, total) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i
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
    force3D: true
  });

const CardSwap = forwardRef(({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 6,
  easing = 'elastic',
  children
}, apiRef) => {
  const config =
    easing === 'elastic'
      ? {
          ease: 'elastic.out(0.6,0.9)',
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05
        }
      : {
          ease: 'power1.inOut',
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2
        };

  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(
    () => childArr.map(() => React.createRef()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [childArr.length]
  );

  const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));

  const tlRef = useRef(null);
  const intervalRef = useRef();
  const container = useRef(null);

  // Restart the auto-cycle timer from now — called after every swap
  // (auto or manual) so a manual trigger doesn't get immediately followed
  // by an auto one landing on top of it.
  const rearm = useRef(() => {});

  useEffect(() => {
    const total = refs.length;
    refs.forEach((r, i) => placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount));

    const swap = () => {
      if (order.current.length < 2) return;

      const [front, ...rest] = order.current;
      const elFront = refs[front].current;
      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.to(elFront, {
        y: '+=500',
        duration: config.durDrop,
        ease: config.ease
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
            ease: config.ease
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
          ease: config.ease
        },
        'return'
      );

      tl.call(() => {
        order.current = [...rest, front];
      });
    };

    // Mirror of swap(): promotes the back-most card straight to the front
    // slot and shifts everyone else back by one, instead of dropping the
    // front card behind the stack. Drives "scroll up = previous card".
    const reverse = () => {
      if (order.current.length < 2) return;

      const back = order.current[order.current.length - 1];
      const rest = order.current.slice(0, -1);
      const elBack = refs[back].current;
      const tl = gsap.timeline();
      tlRef.current = tl;

      const frontSlot = makeSlot(0, cardDistance, verticalDistance, refs.length);
      tl.set(elBack, { zIndex: refs.length }, 0);
      tl.to(elBack, {
        x: frontSlot.x, y: frontSlot.y, z: frontSlot.z,
        duration: config.durMove, ease: config.ease,
      }, 0);

      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        const slot = makeSlot(i + 1, cardDistance, verticalDistance, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, 0);
        tl.to(el, {
          x: slot.x, y: slot.y, z: slot.z,
          duration: config.durMove, ease: config.ease,
        }, i * 0.05);
      });

      tl.call(() => {
        order.current = [back, ...rest];
      });
    };

    rearm.current = () => {
      clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(swap, delay);
    };

    swap();
    intervalRef.current = window.setInterval(swap, delay);

    if (apiRef) {
      apiRef.current = {
        next: () => { swap(); rearm.current(); },
        prev: () => { reverse(); rearm.current(); },
      };
    }

    if (pauseOnHover) {
      const node = container.current;
      const pause = () => {
        tlRef.current?.pause();
        clearInterval(intervalRef.current);
      };
      const resume = () => {
        tlRef.current?.play();
        rearm.current();
      };
      node.addEventListener('mouseenter', pause);
      node.addEventListener('mouseleave', resume);
      return () => {
        node.removeEventListener('mouseenter', pause);
        node.removeEventListener('mouseleave', resume);
        clearInterval(intervalRef.current);
      };
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing]);

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: e => {
            child.props.onClick?.(e);
            onCardClick?.(i);
          }
        })
      : child
  );

  return (
    <div ref={container} className="card-swap-container" style={{ width, height }}>
      {rendered}
    </div>
  );
});

CardSwap.displayName = 'CardSwap';

export default CardSwap;
