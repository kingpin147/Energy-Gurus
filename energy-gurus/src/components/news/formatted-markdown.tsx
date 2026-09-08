"use client";

import React from "react";

interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

export function FormattedMarkdown({ content, className = "" }: FormattedMarkdownProps) {
  if (!content) return null;

  return (
    <div
      className={`tiptap-content space-y-4 text-slate-800 leading-relaxed font-sans ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

