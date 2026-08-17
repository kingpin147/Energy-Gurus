"use client";

import React from "react";

interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

export function FormattedMarkdown({ content, className = "" }: FormattedMarkdownProps) {
  if (!content) return null;

  const renderFormattedInline = (text: string) => {
    // Split text by bold (**text**), italic (*text*), code (`code`), and links ([text](url))
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Bold match: **text**
      const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
      // Italic match: *text*
      const italicMatch = remaining.match(/\*(.*?)\*/);
      // Code match: `code`
      const codeMatch = remaining.match(/`(.*?)`/);
      // Link match: [text](url)
      const linkMatch = remaining.match(/\[(.*?)\]\((.*?)\)/);

      // Find which match comes earliest
      const matches = [
        boldMatch ? { type: "bold", index: boldMatch.index!, match: boldMatch } : null,
        italicMatch ? { type: "italic", index: italicMatch.index!, match: italicMatch } : null,
        codeMatch ? { type: "code", index: codeMatch.index!, match: codeMatch } : null,
        linkMatch ? { type: "link", index: linkMatch.index!, match: linkMatch } : null,
      ].filter(Boolean).sort((a, b) => a!.index - b!.index);

      if (matches.length === 0) {
        parts.push(<React.Fragment key={key++}>{remaining}</React.Fragment>);
        break;
      }

      const earliest = matches[0]!;
      if (earliest.index > 0) {
        parts.push(<React.Fragment key={key++}>{remaining.substring(0, earliest.index)}</React.Fragment>);
      }

      if (earliest.type === "bold") {
        parts.push(<strong key={key++} className="font-bold text-ink">{earliest.match[1]}</strong>);
        remaining = remaining.substring(earliest.index + earliest.match[0].length);
      } else if (earliest.type === "italic") {
        parts.push(<em key={key++} className="italic">{earliest.match[1]}</em>);
        remaining = remaining.substring(earliest.index + earliest.match[0].length);
      } else if (earliest.type === "code") {
        parts.push(<code key={key++} className="bg-slate-100 text-amber-800 px-1.5 py-0.5 rounded font-mono text-xs">{earliest.match[1]}</code>);
        remaining = remaining.substring(earliest.index + earliest.match[0].length);
      } else if (earliest.type === "link") {
        parts.push(
          <a key={key++} href={earliest.match[2]} target="_blank" rel="noreferrer" className="text-teal font-semibold underline hover:text-teal/80">
            {earliest.match[1]}
          </a>
        );
        remaining = remaining.substring(earliest.index + earliest.match[0].length);
      }
    }

    return parts;
  };

  // Split into paragraphs / blocks
  const blocks = content.split(/\n\n+/);

  return (
    <div className={`space-y-4 text-slate-800 leading-relaxed font-sans ${className}`}>
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Heading 1
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={bIdx} className="font-space-grotesk text-2xl md:text-3xl font-bold text-ink mt-6 mb-3">
              {renderFormattedInline(trimmed.substring(2))}
            </h1>
          );
        }

        // Heading 2
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={bIdx} className="font-space-grotesk text-xl md:text-2xl font-bold text-ink mt-6 mb-3 border-b border-line pb-2">
              {renderFormattedInline(trimmed.substring(3))}
            </h2>
          );
        }

        // Heading 3
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={bIdx} className="font-space-grotesk text-lg font-bold text-ink mt-4 mb-2">
              {renderFormattedInline(trimmed.substring(4))}
            </h3>
          );
        }

        // Blockquote
        if (trimmed.startsWith("> ")) {
          const quoteLines = trimmed.split("\n").map(l => l.replace(/^>\s?/, ""));
          return (
            <blockquote key={bIdx} className="border-l-4 border-amber bg-amber/5 p-4 rounded-r-2xl italic text-slate-700 my-4">
              {quoteLines.map((line, lIdx) => (
                <p key={lIdx}>{renderFormattedInline(line)}</p>
              ))}
            </blockquote>
          );
        }

        // Horizontal Rule
        if (trimmed === "---" || trimmed === "***") {
          return <hr key={bIdx} className="my-6 border-line" />;
        }

        // Code Block
        if (trimmed.startsWith("```")) {
          const codeContent = trimmed.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "");
          return (
            <pre key={bIdx} className="bg-slate-900 text-amber p-4 rounded-2xl font-mono text-xs overflow-x-auto my-4 shadow-sm">
              <code>{codeContent}</code>
            </pre>
          );
        }

        // Bullet list
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const items = trimmed.split("\n").filter(l => l.startsWith("- ") || l.startsWith("* "));
          return (
            <ul key={bIdx} className="list-disc list-inside space-y-2 my-3 pl-2 text-slate-800">
              {items.map((item, iIdx) => (
                <li key={iIdx}>{renderFormattedInline(item.substring(2))}</li>
              ))}
            </ul>
          );
        }

        // Numbered list
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split("\n").filter(l => /^\d+\.\s/.test(l));
          return (
            <ol key={bIdx} className="list-decimal list-inside space-y-2 my-3 pl-2 text-slate-800">
              {items.map((item, iIdx) => (
                <li key={iIdx}>{renderFormattedInline(item.replace(/^\d+\.\s/, ""))}</li>
              ))}
            </ol>
          );
        }

        // Regular paragraph (multi-line)
        const lines = trimmed.split("\n");
        return (
          <p key={bIdx} className="leading-relaxed">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderFormattedInline(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
