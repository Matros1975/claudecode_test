"use client";

import type { ToolInvocation } from "@ai-sdk/ui-utils";
import {
  Loader2,
  FilePlus,
  FileEdit,
  FileSearch,
  Undo2,
  FileInput,
  Trash2,
  Terminal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

// ── pure helpers ─────────────────────────────────────────────────────────────

function basename(filePath: string): string {
  const parts = filePath.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? filePath;
}

type DisplayInfo = { label: string; Icon: LucideIcon };

function getDisplayInfo(toolName: string, args: any): DisplayInfo {
  if (toolName === "str_replace_editor") {
    const command: string | undefined = args?.command;
    const path: string | undefined = args?.path;
    const file = path ? basename(path) : undefined;

    switch (command) {
      case "create":
        return { label: file ? `Creating ${file}` : "Creating…", Icon: FilePlus };
      case "str_replace":
        return { label: file ? `Editing ${file}` : "Editing…", Icon: FileEdit };
      case "insert":
        return { label: file ? `Editing ${file}` : "Editing…", Icon: FileEdit };
      case "view":
        return { label: file ? `Reading ${file}` : "Reading…", Icon: FileSearch };
      case "undo_edit":
        return { label: file ? `Undoing edit in ${file}` : "Undoing edit…", Icon: Undo2 };
      default:
        return { label: file ? `Editing ${file}` : "Working…", Icon: FileEdit };
    }
  }

  if (toolName === "file_manager") {
    const command: string | undefined = args?.command;
    const path: string | undefined = args?.path;
    const newPath: string | undefined = args?.new_path;
    const file = path ? basename(path) : undefined;

    switch (command) {
      case "rename": {
        const newFile = newPath ? basename(newPath) : undefined;
        const label = file && newFile
          ? `Renaming ${file} → ${newFile}`
          : file
          ? `Renaming ${file}…`
          : "Renaming…";
        return { label, Icon: FileInput };
      }
      case "delete":
        return { label: file ? `Deleting ${file}` : "Deleting…", Icon: Trash2 };
      default:
        return { label: file ? `Managing ${file}` : "Managing files…", Icon: Terminal };
    }
  }

  // Unknown / future tool — show raw tool name (preserves current behaviour)
  return { label: toolName, Icon: Terminal };
}

// ── component ─────────────────────────────────────────────────────────────────

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const { toolName, args, state } = toolInvocation;
  const isDone = state === "result";
  const { label, Icon } = getDisplayInfo(toolName, args);

  // Split at the first space so the filename portion can be styled distinctly.
  // "Creating App.jsx"  → actionWord="Creating"   filePortion="App.jsx"
  // "Undoing edit in …" → actionWord="Undoing"    filePortion="edit in …"
  // "Working…"          → actionWord="Working…"   filePortion=""
  const spaceIndex = label.indexOf(" ");
  const actionWord = spaceIndex === -1 ? label : label.slice(0, spaceIndex);
  const filePortion = spaceIndex === -1 ? "" : label.slice(spaceIndex + 1);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
      )}
      <Icon className="w-3 h-3 text-neutral-400 flex-shrink-0" />
      <span className="text-neutral-500">{actionWord}</span>
      {filePortion && (
        <span className="text-neutral-800 font-semibold">{filePortion}</span>
      )}
    </div>
  );
}
