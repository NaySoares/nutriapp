"use client";

import {
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type TooltipPosition = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = "top",
  className = "",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [coordinates, setCoordinates] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!visible || !triggerRef.current || !tooltipRef.current) return;

    const updatePosition = () => {
      const trigger = triggerRef.current?.getBoundingClientRect();
      const tooltip = tooltipRef.current?.getBoundingClientRect();

      if (!trigger || !tooltip) return;

      const gap = 8;
      let top = 0;
      let left = 0;

      switch (position) {
        case "top":
          top = trigger.top - tooltip.height - gap;
          left = trigger.left + trigger.width / 2 - tooltip.width / 2;
          break;
        case "bottom":
          top = trigger.bottom + gap;
          left = trigger.left + trigger.width / 2 - tooltip.width / 2;
          break;
        case "left":
          top = trigger.top + trigger.height / 2 - tooltip.height / 2;
          left = trigger.left - tooltip.width - gap;
          break;
        case "right":
          top = trigger.top + trigger.height / 2 - tooltip.height / 2;
          left = trigger.right + gap;
          break;
      }

      // Mantém o tooltip dentro da viewport.
      left = Math.max(8, Math.min(left, window.innerWidth - tooltip.width - 8));
      top = Math.max(8, Math.min(top, window.innerHeight - tooltip.height - 8));

      setCoordinates({ top, left });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [visible, position, content]);

  return (
    <>
      <span
        ref={triggerRef}
        className={`inline-flex ${className}`}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        {children}
      </span>

      {mounted &&
        visible &&
        createPortal(
          <span
            ref={tooltipRef}
            role="tooltip"
            style={{
              position: "fixed",
              top: coordinates.top,
              left: coordinates.left,
              visibility:
                coordinates.top === 0 && coordinates.left === 0
                  ? "hidden"
                  : "visible",
            }}
            className="z-[9999] w-max max-w-64 rounded-md bg-gray-900 px-2 py-2 text-center text-xs font-medium text-white shadow-lg"
          >
            {content}
          </span>,
          document.body
        )}
    </>
  );
}