import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

// ── A. str_replace_editor — result state ─────────────────────────────────────

test("A1: create command shows 'Creating' and filename", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "result",
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        result: "ok",
      }}
    />
  );
  expect(screen.getByText("Creating")).toBeDefined();
  expect(screen.getByText("App.jsx")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("A2: str_replace command shows 'Editing' and filename", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "result",
        toolCallId: "2",
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/Card.tsx" },
        result: "ok",
      }}
    />
  );
  expect(screen.getByText("Editing")).toBeDefined();
  expect(screen.getByText("Card.tsx")).toBeDefined();
});

test("A3: insert command shows 'Editing' and filename", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "result",
        toolCallId: "3",
        toolName: "str_replace_editor",
        args: { command: "insert", path: "/utils.ts" },
        result: "ok",
      }}
    />
  );
  expect(screen.getByText("Editing")).toBeDefined();
  expect(screen.getByText("utils.ts")).toBeDefined();
});

test("A4: view command shows 'Reading' and filename", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "result",
        toolCallId: "4",
        toolName: "str_replace_editor",
        args: { command: "view", path: "/index.tsx" },
        result: "ok",
      }}
    />
  );
  expect(screen.getByText("Reading")).toBeDefined();
  expect(screen.getByText("index.tsx")).toBeDefined();
});

test("A5: undo_edit command shows 'Undoing' and 'edit in filename'", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "result",
        toolCallId: "5",
        toolName: "str_replace_editor",
        args: { command: "undo_edit", path: "/App.jsx" },
        result: "ok",
      }}
    />
  );
  expect(screen.getByText("Undoing")).toBeDefined();
  expect(screen.getByText("edit in App.jsx")).toBeDefined();
});

test("A6: deep path shows only the filename basename", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "result",
        toolCallId: "6",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/src/components/Button.tsx" },
        result: "ok",
      }}
    />
  );
  expect(screen.getByText("Button.tsx")).toBeDefined();
  expect(screen.queryByText("/src/components/Button.tsx")).toBeNull();
});

// ── B. file_manager — result state ───────────────────────────────────────────

test("B1: rename with both paths shows 'Renaming Foo.tsx → Bar.tsx'", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "result",
        toolCallId: "7",
        toolName: "file_manager",
        args: { command: "rename", path: "/Foo.tsx", new_path: "/Bar.tsx" },
        result: { success: true },
      }}
    />
  );
  expect(screen.getByText("Renaming")).toBeDefined();
  expect(screen.getByText("Foo.tsx → Bar.tsx")).toBeDefined();
});

test("B2: rename with only path (new_path not yet streamed) shows trailing ellipsis", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "result",
        toolCallId: "8",
        toolName: "file_manager",
        args: { command: "rename", path: "/Foo.tsx" },
        result: { success: true },
      }}
    />
  );
  expect(screen.getByText("Renaming")).toBeDefined();
  expect(screen.getByText("Foo.tsx…")).toBeDefined();
});

test("B3: delete command shows 'Deleting' and filename", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "result",
        toolCallId: "9",
        toolName: "file_manager",
        args: { command: "delete", path: "/Button.jsx" },
        result: { success: true },
      }}
    />
  );
  expect(screen.getByText("Deleting")).toBeDefined();
  expect(screen.getByText("Button.jsx")).toBeDefined();
});

// ── C. partial-call / call states ────────────────────────────────────────────

test("C1: partial-call with empty args renders without crashing and shows spinner", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "partial-call",
        toolCallId: "10",
        toolName: "str_replace_editor",
        args: {},
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
  // Should render the badge wrapper
  expect(container.querySelector(".inline-flex")).toBeDefined();
});

test("C2: partial-call with command but no path shows fallback label with spinner", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "partial-call",
        toolCallId: "11",
        toolName: "str_replace_editor",
        args: { command: "create" },
      }}
    />
  );
  expect(screen.getByText("Creating…")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("C3: call state shows spinner and no green dot", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "call",
        toolCallId: "12",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

// ── D. result state visual ───────────────────────────────────────────────────

test("D1: result state shows green dot and no spinner", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "result",
        toolCallId: "13",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        result: "ok",
      }}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

// ── E. Fallback for unknown tools ────────────────────────────────────────────

test("E1: unknown tool name renders raw tool name without crashing", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "result",
        toolCallId: "14",
        toolName: "unknown_future_tool",
        args: {},
        result: null,
      }}
    />
  );
  expect(screen.getByText("unknown_future_tool")).toBeDefined();
});
