import React, { useRef } from "react";
import { useResponsive } from "@/components/use-responsive";
import { useTheme } from "@/contexts/theme-context";
import clsx from "clsx";
import Image from "next/image";

const DefaultIllustration = (
  <svg
    fill="none"
    height="56"
    viewBox="0 0 36 56"
    width="36"
    xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M3.03113 28.0005C6.26017 23.1765 11.7592 20.0005 18 20.0005C24.2409 20.0005 29.7399 23.1765 32.9689 28.0005C29.7399 32.8244 24.2409 36.0005 18 36.0005C11.7592 36.0005 6.26017 32.8244 3.03113 28.0005Z"
      fill="#0070F3"
      fillRule="evenodd" />
    <path
      clipRule="evenodd"
      d="M32.9691 28.0012C34.8835 25.1411 36 21.7017 36 18.0015C36 8.06034 27.9411 0.00146484 18 0.00146484C8.05887 0.00146484 0 8.06034 0 18.0015C0 21.7017 1.11648 25.1411 3.03094 28.0012C6.25996 23.1771 11.7591 20.001 18 20.001C24.2409 20.001 29.74 23.1771 32.9691 28.0012Z"
      fill="#45DEC4"
      fillRule="evenodd" />
    <path
      clipRule="evenodd"
      d="M32.9692 28.0005C29.7402 32.8247 24.241 36.001 18 36.001C11.759 36.001 6.25977 32.8247 3.03077 28.0005C1.11642 30.8606 0 34.2999 0 38C0 47.9411 8.05887 56 18 56C27.9411 56 36 47.9411 36 38C36 34.2999 34.8836 30.8606 32.9692 28.0005Z"
      fill="#E5484D"
      fillRule="evenodd" />
  </svg>
);

export const Book = ({
  title,
  issn,
  variant = "stripe",
  width = 196,
  color,
  textColor,
  illustration,
  textured = false,
  img
}) => {
  const _width = useResponsive(width);
  const { theme } = useTheme();
  const bookRef = useRef(null);
  const animFrameRef = useRef(null);
  const currentAngleRef = useRef(0);
  const directionRef = useRef("idle"); // "open" | "close" | "idle"

  const _color = color ? color : variant === "simple" ? "var(--ds-background-200)" : "var(--ds-amber-600)";
  const _illustration = illustration ? illustration : DefaultIllustration;
  const _textColor = textColor || (theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "#ffffff" : "#000000");

  const TARGET_OPEN = -15;
  const TARGET_CLOSED = 0;
  const TILT_OPEN = 0.5;
  const TILT_CLOSED = 0;
  // Speed: degrees per frame (at ~60fps)
  const SPEED = 0.6;

  const animate = () => {
    const target = directionRef.current === "open" ? TARGET_OPEN : TARGET_CLOSED;
    const tiltTarget = directionRef.current === "open" ? TILT_OPEN : TILT_CLOSED;
    const diff = target - currentAngleRef.current;

    if (Math.abs(diff) < 0.05) {
      currentAngleRef.current = target;
      if (bookRef.current) {
        bookRef.current.style.transform = `rotateY(${target}deg) rotateZ(${tiltTarget}deg)`;
      }
      directionRef.current = "idle";
      return;
    }

    // Ease: slow down as we approach target
    const step = diff * 0.06;
    currentAngleRef.current += step;

    const progress = Math.abs(currentAngleRef.current / TARGET_OPEN);
    const tilt = directionRef.current === "open"
      ? progress * TILT_OPEN
      : (1 - Math.abs(currentAngleRef.current / TARGET_OPEN)) * TILT_OPEN;

    if (bookRef.current) {
      bookRef.current.style.transform = `rotateY(${currentAngleRef.current}deg) rotateZ(${tilt}deg)`;
    }

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const handleMouseEnter = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    directionRef.current = "open";
    animFrameRef.current = requestAnimationFrame(animate);
  };

  const handleMouseLeave = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    directionRef.current = "close";
    animFrameRef.current = requestAnimationFrame(animate);
  };

  const bookInner = img ? (
    // Full cover image layout
    <div
      className="h-full rounded-l-md rounded-r overflow-hidden shadow-book relative after:absolute after:border after:border-gray-alpha-400 after:w-full after:h-full after:shadow-book-border after:rounded-l-md after:rounded-r"
      style={{ width: _width }}>
      <div className="absolute inset-0">
        <Image
          src={img}
          fill
          className="object-cover"
          alt={title || "Journal Cover"}
        />
      </div>
      <div
        className="absolute inset-y-0 left-0 w-[8.2%] mix-blend-overlay z-10"
        style={{ background: "var(--ds-book-bind)" }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 z-20 flex flex-col justify-center"
        style={{
          height: "30%",
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(4px)",
          padding: "4% 6% 4% 14%",
          containerType: "inline-size",
        }}>
        <span
          className="leading-[1.25em] tracking-[-.02em] font-semibold text-[9cqw] text-balance line-clamp-2"
          style={{ color: "#111111" }}>
          {title}
        </span>
        {issn && (
          <span
            className="text-[7cqw] leading-[1.3em] tracking-[-.01em] font-medium opacity-70 mt-1"
            style={{ color: "#111111" }}>
            ISSN: {issn}
          </span>
        )}
      </div>
      {textured && (
        <div className="absolute inset-0 z-30 rotate-180 rounded-l-md rounded-r mix-blend-hard-light pointer-events-none bg-cover bg-no-repeat opacity-50 brightness-110 bg-[url('https://assets.vercel.com/image/upload/v1720554484/front/design/book-texture.avif')]" />
      )}
    </div>
  ) : (
    // Default stripe layout
    <div
      className="flex flex-col h-full rounded-l-md rounded-r overflow-hidden bg-background-200 shadow-book translate-x-0 relative after:absolute after:border after:border-gray-alpha-400 after:w-full after:h-full after:shadow-book-border after:rounded-l-md after:rounded-r"
      style={{ width: _width }}>
      <div
        className={clsx("w-full relative overflow-hidden", variant === "stripe" && "flex-1")}
        style={{ background: _color }}>
        {variant === "stripe" && illustration && (
          <div className="absolute h-full w-full">{_illustration}</div>
        )}
        <div
          className="absolute h-full w-[8.2%] mix-blend-overlay"
          style={{ background: "var(--ds-book-bind)" }} />
      </div>
      <div
        className={clsx(
          "relative flex-1",
          (variant === "stripe" || (variant === "simple" && color === undefined)) && "bg-book-gradient"
        )}
        style={{ background: variant === "simple" && color !== undefined ? _color : undefined }}>
        <div
          className="absolute h-full w-[8.2%] opacity-20"
          style={{ background: "var(--ds-book-bind)" }} />
        <div
          className={clsx(
            "flex flex-col w-full p-[6.1%] pl-[14.3%]",
            variant === "simple" ? "gap-4" : "justify-between"
          )}
          style={{ containerType: "inline-size", gap: `calc((24px / 196) * ${_width})` }}>
          <div className="flex flex-col gap-2">
            <span
              className={clsx(
                "leading-[1.25em] tracking-[-.02em] text-balance font-semibold",
                variant === "simple" ? "text-[12cqw]" : "text-[7.5cqw]"
              )}
              style={{ color: _textColor }}>
              {title}
            </span>
            {issn && (
              <span
                className="text-[8cqw] leading-[1.2em] tracking-[-.01em] text-balance font-medium opacity-80"
                style={{ color: _textColor }}>
                ISSN: {issn}
              </span>
            )}
          </div>
          {variant === "stripe" ? (
            <Image src={'/favicon.png'} width={30} height={10} alt="Book Illustration" />
          ) : _illustration}
        </div>
      </div>
      {textured && (
        <div className="absolute top-0 left-0 inset-0 rotate-180 rounded-l-md rounded-r mix-blend-hard-light pointer-events-none bg-cover bg-no-repeat opacity-50 brightness-110 bg-[url('https://assets.vercel.com/image/upload/v1720554484/front/design/book-texture.avif')]" />
      )}
    </div>
  );

  return (
    <div
      className="inline-block w-fit"
      style={{ perspective: 1200 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="aspect-[49/60] w-fit relative"
        style={{
          transformStyle: "preserve-3d",
          minWidth: _width,
          containerType: "inline-size",
        }}>
        {/* This is the animated inner wrapper */}
        <div
          ref={bookRef}
          className="w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {bookInner}

          {/* Book spine side */}
          <div
            className="h-[calc(100%_-_2_*_3px)] w-[calc(29cqw_-_2px)] absolute top-[3px]"
            style={{
              background: "linear-gradient(90deg, #eaeaea, transparent 70%), linear-gradient(#fff, #fafafa)",
              transform: `translateX(calc(${_width} * 1px - 29cqw / 2 - 3px)) rotateY(90deg) translateX(calc(29cqw / 2))`
            }} />
          <div
            className="bg-gray-200 absolute left-0 top-0 rounded-l-md rounded-r h-full"
            style={{ width: _width, transform: "translateZ(calc(-1 * 29cqw))" }} />
        </div>
      </div>
    </div>
  );
};