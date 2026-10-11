"use client";

import React, { useMemo } from "react";
import { marked } from "marked";

interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Preprocesses and converts article text/markdown into structured, responsive HTML.
 * Handles:
 * - Markdown bold (**text**), italics (*text*)
 * - Inline bullets (• **Title**) converted to true structured lists (<ul><li>...)
 * - Embedded section headings (**The Present: ...**) converted to clean <h3> headings
 * - Raw URLs autolinked with target="_blank"
 * - TipTap HTML mixed with raw markdown
 */
export function formatArticleHtml(raw: string): string {
  if (!raw) return "";

  let text = raw.trim();

  // 1. If wrapped in outer <p> tag containing unparsed markdown tokens, unwrap it
  if (text.includes("**") || text.includes("•") || text.includes("###")) {
    if (/^<p>[\s\S]*<\/p>$/i.test(text) && !text.slice(3, -4).includes("<p>")) {
      text = text.replace(/^<p>/i, "").replace(/<\/p>$/i, "");
    }
    // Convert <br> or <br/> tags to newlines for markdown parsing
    text = text.replace(/<br\s*\/?>/gi, "\n");
  }

  // 2. Break inline bullet characters (•, ●, ■, ▪) into proper markdown list items
  text = text.replace(/(?:\s+|(?<=[.!?:]))\s*[•●■▪]\s*/g, "\n\n- ");

  // 3. Separate standalone bold headings that are glued to the end of a previous sentence
  // e.g. "investment. **The Present: From Lab Curiosity to Real Deployment** Sodium-ion"
  text = text.replace(/([.!?])\s*\*\*([A-Z0-9][^*]{3,80}?)\*\*\s*/g, (_match, p1, p2) => {
    return `${p1}\n\n### ${p2.trim()}\n\n`;
  });

  // 4. Configure marked with GitHub Flavored Markdown and line breaks
  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  try {
    let parsed = marked.parse(text);
    if (typeof parsed !== "string") {
      parsed = "";
    }

    // 5. Ensure all <a> tags open in new tab with security attributes
    parsed = parsed.replace(/<a\s+(?!.*?target=)([^>]+)>/gi, '<a target="_blank" rel="noopener noreferrer" $1>');

    return parsed;
  } catch (err) {
    console.error("Failed to parse article markdown:", err);
    return text;
  }
}

export function FormattedMarkdown({ content, className = "" }: FormattedMarkdownProps) {
  const html = useMemo(() => formatArticleHtml(content), [content]);

  if (!html) return null;

  return (
    <div
      className={`article-content-rendered ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function cleanArticleExcerpt(content?: string | null, maxLen = 160): string {
  if (!content) return "";
  const plainText = content
    .replace(/<[^>]*>/g, " ")
    .replace(/#+\s+/g, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/[•●■▪]/g, "")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/[\r\n\s]+/g, " ")
    .trim();
  if (plainText.length <= maxLen) return plainText;
  return plainText.slice(0, maxLen).trim() + "...";
}

