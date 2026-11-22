import { describe, expect, it } from "vitest";
import commands from "./commands.json";
import { formatOutput, runCommand } from "./terminal.ts";

describe("runCommand", () => {
  it("handles every command listed in commands.json", () => {
    for (const name of Object.keys(commands)) {
      const result = runCommand(name);
      if (result.action === "print" && name !== "echo") {
        expect(result.output, name).not.toMatch(/^Command not found/);
        expect(result.output.trim().length, name).toBeGreaterThan(0);
      }
    }
  });

  it("returns special actions for clear and dino", () => {
    expect(runCommand("clear")).toEqual({ action: "clear" });
    expect(runCommand("dino")).toEqual({ action: "dino" });
  });

  it("echoes arguments, collapsing whitespace", () => {
    expect(runCommand("echo   hello    world ")).toEqual({ action: "print", output: "hello world" });
    expect(runCommand("echo")).toEqual({ action: "print", output: "" });
  });

  it("ignores surrounding whitespace and empty input", () => {
    expect(runCommand("   help  ")).toEqual(runCommand("help"));
    expect(runCommand("")).toEqual({ action: "print", output: "" });
    expect(runCommand("    ")).toEqual({ action: "print", output: "" });
  });

  it("matches command names case-insensitively, keeping echo text as typed", () => {
    expect(runCommand("Help")).toEqual(runCommand("help"));
    expect(runCommand("DINO")).toEqual({ action: "dino" });
    expect(runCommand("Echo Hello World")).toEqual({ action: "print", output: "Hello World" });
  });

  it("reports unknown commands", () => {
    expect(runCommand("sudo rm -rf /")).toEqual({ action: "print", output: "Command not found: sudo" });
  });

  it("does not treat Object.prototype keys as commands", () => {
    expect(runCommand("constructor")).toEqual({ action: "print", output: "Command not found: constructor" });
    expect(runCommand("toString")).toEqual({ action: "print", output: "Command not found: toString" });
  });
});

describe("help", () => {
  it("lists every command with its usage", () => {
    const result = runCommand("help");
    expect(result.action).toBe("print");
    const output = result.action === "print" ? result.output : "";
    for (const [name, { usage }] of Object.entries(commands)) {
      expect(output).toContain(`${name}:`);
      expect(output).toContain(`Usage: ${usage}`);
    }
  });
});

describe("formatOutput", () => {
  it("turns URLs into links that open in a new tab", () => {
    expect(formatOutput("see https://example.com now")).toBe(
      'see <a href="https://example.com" target="_blank" rel="noopener noreferrer">https://example.com</a> now',
    );
  });

  it("leaves text without URLs alone", () => {
    expect(formatOutput("no links here")).toBe("no links here");
  });
});

describe("formatOutput (regressions)", () => {
  it("escapes HTML so echoed input can't inject markup", () => {
    const html = formatOutput('<img src=x onerror="alert(1)">');
    expect(html).not.toContain("<img");
    expect(html).toBe("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  });

  it("does not swallow a closing paren after a URL", () => {
    expect(formatOutput("(https://example.com/a)")).toBe(
      '(<a href="https://example.com/a" target="_blank" rel="noopener noreferrer">https://example.com/a</a>)',
    );
  });

  it("does not swallow trailing sentence punctuation", () => {
    expect(formatOutput("Go to https://example.com.")).toContain('href="https://example.com"');
  });

  it("keeps query strings intact and escaped in the href", () => {
    expect(formatOutput("https://e.com/?a=1&b=2")).toBe(
      '<a href="https://e.com/?a=1&amp;b=2" target="_blank" rel="noopener noreferrer">https://e.com/?a=1&amp;b=2</a>',
    );
  });
});
