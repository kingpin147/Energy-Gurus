"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, Minus } from 'lucide-react';
import React from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-teal font-semibold underline hover:text-teal/80 cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-4 shadow-sm border border-line',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] p-4 text-slate-800 leading-relaxed font-sans tiptap-content',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty — remove link
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Normalize URL: add https:// if no protocol is present
    const normalizedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;

    // Check if there is selected text
    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;

    if (hasSelection) {
      // Wrap selected text with link
      editor.chain().focus().extendMarkRange('link').setLink({ href: normalizedUrl }).run();
    } else {
      // No text selected — insert the URL as clickable link text
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${normalizedUrl}">${url}</a>`)
        .run();
    }
  };

  const addImage = () => {
    const url = window.prompt('URL');

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="flex flex-col border border-line rounded-2xl bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-amber/50">
      <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-2 border-b border-line">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`h-8 px-2.5 rounded-lg text-xs font-bold transition-colors ${editor.isActive('bold') ? 'bg-white text-ink shadow-sm' : 'text-slate-700 hover:bg-white hover:text-ink'}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`h-8 px-2.5 rounded-lg text-xs font-bold transition-colors ${editor.isActive('italic') ? 'bg-white text-ink shadow-sm' : 'text-slate-700 hover:bg-white hover:text-ink'}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`h-8 px-2.5 rounded-lg text-xs font-bold transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-white text-ink shadow-sm' : 'text-slate-700 hover:bg-white hover:text-ink'}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`h-8 px-2.5 rounded-lg text-xs font-bold transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-white text-ink shadow-sm' : 'text-slate-700 hover:bg-white hover:text-ink'}`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-8 px-2.5 rounded-lg text-xs font-bold transition-colors ${editor.isActive('bulletList') ? 'bg-white text-ink shadow-sm' : 'text-slate-700 hover:bg-white hover:text-ink'}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-8 px-2.5 rounded-lg text-xs font-bold transition-colors ${editor.isActive('orderedList') ? 'bg-white text-ink shadow-sm' : 'text-slate-700 hover:bg-white hover:text-ink'}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`h-8 px-2.5 rounded-lg text-xs font-bold transition-colors ${editor.isActive('blockquote') ? 'bg-white text-ink shadow-sm' : 'text-slate-700 hover:bg-white hover:text-ink'}`}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={setLink}
          className={`h-8 px-2.5 rounded-lg text-xs font-bold transition-colors ${editor.isActive('link') ? 'bg-white text-ink shadow-sm' : 'text-slate-700 hover:bg-white hover:text-ink'}`}
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={addImage}
          className="h-8 px-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-white hover:text-ink transition-colors"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="h-8 px-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-white hover:text-ink transition-colors"
          title="Horizontal Divider"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
