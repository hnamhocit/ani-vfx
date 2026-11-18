"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ExpandableSynopsisProps {
  text: string;
  textClassName?: string;
  buttonClassName?: string;
  expandLabel?: string;
  collapseLabel?: string;
}

export function ExpandableSynopsis({
  text,
  textClassName = "text-xs sm:text-sm text-zinc-300 leading-relaxed",
  buttonClassName = "text-purple-400 hover:text-purple-300 text-xs font-bold",
  expandLabel = "Xem thêm",
  collapseLabel = "Thu gọn",
}: ExpandableSynopsisProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el || !text) return;
    if (!isExpanded) {
      setCanExpand(
        el.scrollHeight > el.clientHeight + 4 && text.length > 320,
      );
    }
  }, [text, isExpanded]);

  return (
    <div className="space-y-1.5">
      <p
        ref={textRef}
        className={`${textClassName} ${!isExpanded && canExpand ? "line-clamp-3 overflow-hidden" : ""
          }`}
      >
        {text}
      </p>
      {canExpand && (
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className={`inline-flex items-center gap-1 transition-colors cursor-pointer ${buttonClassName}`}
        >
          <span>{isExpanded ? collapseLabel : expandLabel}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
}
