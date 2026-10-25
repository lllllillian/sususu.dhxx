import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ScrollFloat.css";

gsap.registerPlugin(ScrollTrigger);

type ScrollFloatProps = {
  children: string;
  containerClassName?: string;
  textClassName?: string;
  animationDuration?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
};

export default function ScrollFloat({
  children,
  containerClassName = "",
  textClassName = "",
  animationDuration = 1,
  ease = "back.inOut(2)",
  scrollStart = "top 88%",
  scrollEnd = "bottom 55%",
  stagger = 0.03,
}: ScrollFloatProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const characters = useMemo(() => children.split(""), [children]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        container.querySelectorAll(".scroll-float__char"),
        { opacity: 0, yPercent: 120, scaleY: 2.3, scaleX: 0.7, transformOrigin: "50% 0%" },
        {
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          duration: animationDuration,
          ease,
          stagger,
          scrollTrigger: { trigger: container, start: scrollStart, end: scrollEnd, scrub: true },
        },
      );
    }, container);

    return () => context.revert();
  }, [animationDuration, ease, scrollEnd, scrollStart, stagger]);

  return <h1 ref={containerRef} className={`scroll-float ${containerClassName}`}><span className={`scroll-float__text ${textClassName}`}>{characters.map((character, index) => <span className="scroll-float__char" key={`${character}-${index}`}>{character === " " ? "\u00a0" : character}</span>)}</span></h1>;
}
