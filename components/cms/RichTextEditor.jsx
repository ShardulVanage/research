"use client"

import { useEffect, useState } from "react"
import { useEditor, EditorContent, useEditorState } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import "./cms.css"
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading2, Heading3, Heading4,
  List, ListOrdered, Quote, Link as LinkIcon, Unlink, ImagePlus, Minus, Undo2, Redo2, Code2, Pilcrow,
} from "lucide-react"

function ToolbarButton({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800 ${
        active ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300" : ""
      }`}
    >
      {children}
    </button>
  )
}

const Divider = () => <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />

export default function RichTextEditor({ value, onChange, invalid }) {
  const [mode, setMode] = useState("visual")
  const [source, setSource] = useState(value || "")

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } },
      }),
      // allowBase64 keeps images already embedded in old posts from being dropped on save.
      Image.configure({ allowBase64: true }),
    ],
    content: value || "",
    editorProps: {
      attributes: { class: "cms-prose min-h-[320px] px-4 py-3 outline-none" },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            strike: e.isActive("strike"),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            h4: e.isActive("heading", { level: 4 }),
            paragraph: e.isActive("paragraph"),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            link: e.isActive("link"),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : {},
  })

  // Keep the editor in sync if the value is replaced from outside (e.g. record finished loading).
  useEffect(() => {
    if (editor && mode === "visual" && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false })
    }
  }, [value, editor, mode])

  function switchMode(next) {
    if (next === mode) return
    if (next === "html") setSource(editor?.getHTML() ?? value ?? "")
    else editor?.commands.setContent(source, { emitUpdate: false })
    setMode(next)
  }

  function setLink() {
    const prev = editor.getAttributes("link").href || ""
    const url = window.prompt("Link URL", prev || "https://")
    if (url === null) return
    if (url === "") editor.chain().focus().extendMarkRange("link").unsetLink().run()
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  function addImage() {
    const url = window.prompt("Image URL (https://...)")
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const c = () => editor.chain().focus()

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-white dark:bg-slate-900 ${
        invalid ? "border-red-400" : "border-slate-200 dark:border-slate-700"
      }`}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800/60">
        {mode === "visual" && editor && (
          <>
            <ToolbarButton title="Paragraph" active={state.paragraph} onClick={() => c().setParagraph().run()}><Pilcrow size={15} /></ToolbarButton>
            <ToolbarButton title="Heading 2" active={state.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></ToolbarButton>
            <ToolbarButton title="Heading 3" active={state.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}><Heading3 size={16} /></ToolbarButton>
            <ToolbarButton title="Heading 4" active={state.h4} onClick={() => c().toggleHeading({ level: 4 }).run()}><Heading4 size={16} /></ToolbarButton>
            <Divider />
            <ToolbarButton title="Bold" active={state.bold} onClick={() => c().toggleBold().run()}><Bold size={15} /></ToolbarButton>
            <ToolbarButton title="Italic" active={state.italic} onClick={() => c().toggleItalic().run()}><Italic size={15} /></ToolbarButton>
            <ToolbarButton title="Underline" active={state.underline} onClick={() => c().toggleUnderline().run()}><UnderlineIcon size={15} /></ToolbarButton>
            <ToolbarButton title="Strikethrough" active={state.strike} onClick={() => c().toggleStrike().run()}><Strikethrough size={15} /></ToolbarButton>
            <Divider />
            <ToolbarButton title="Bullet list" active={state.bullet} onClick={() => c().toggleBulletList().run()}><List size={16} /></ToolbarButton>
            <ToolbarButton title="Numbered list" active={state.ordered} onClick={() => c().toggleOrderedList().run()}><ListOrdered size={16} /></ToolbarButton>
            <ToolbarButton title="Quote" active={state.quote} onClick={() => c().toggleBlockquote().run()}><Quote size={15} /></ToolbarButton>
            <ToolbarButton title="Divider line" onClick={() => c().setHorizontalRule().run()}><Minus size={16} /></ToolbarButton>
            <Divider />
            <ToolbarButton title="Add or edit link" active={state.link} onClick={setLink}><LinkIcon size={15} /></ToolbarButton>
            <ToolbarButton title="Remove link" disabled={!state.link} onClick={() => c().unsetLink().run()}><Unlink size={15} /></ToolbarButton>
            <ToolbarButton title="Insert image from URL" onClick={addImage}><ImagePlus size={15} /></ToolbarButton>
            <Divider />
            <ToolbarButton title="Undo" disabled={!state.canUndo} onClick={() => c().undo().run()}><Undo2 size={15} /></ToolbarButton>
            <ToolbarButton title="Redo" disabled={!state.canRedo} onClick={() => c().redo().run()}><Redo2 size={15} /></ToolbarButton>
          </>
        )}
        <div className="ml-auto flex rounded-md border border-slate-200 bg-white p-0.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-900">
          {["visual", "html"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`inline-flex items-center gap-1 rounded px-2 py-1 transition ${
                mode === m ? "bg-cyan-600 text-white" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {m === "html" && <Code2 size={12} />}
              {m === "visual" ? "Visual" : "HTML"}
            </button>
          ))}
        </div>
      </div>

      {mode === "visual" ? (
        <EditorContent editor={editor} />
      ) : (
        <textarea
          value={source}
          onChange={(e) => {
            setSource(e.target.value)
            onChange(e.target.value)
          }}
          spellCheck={false}
          className="block min-h-[320px] w-full resize-y bg-slate-950 px-4 py-3 font-mono text-xs leading-relaxed text-slate-100 outline-none"
        />
      )}
    </div>
  )
}
