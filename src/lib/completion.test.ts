import { describe, expect, it } from "vitest";
import commands from "./commands.json";
import { acceptSuggestion, COMMAND_NAMES, ghostSuggestion, matchCommands, tabComplete } from "./completion.ts";

describe("matchCommands", () => {
  it("knows every command in commands.json", () => {
    expect(COMMAND_NAMES).toEqual(Object.keys(commands));
  });

  it("matches by prefix, ignoring case", () => {
    expect(matchCommands("ex")).toEqual(["experience"]);
    expect(matchCommands("E")).toEqual(["echo", "experience", "education"]);
    expect(matchCommands("PRO")).toEqual(["projects"]);
  });

  it("matches nothing for empty input, unknown prefixes, or once arguments start", () => {
    expect(matchCommands("")).toEqual([]);
    expect(matchCommands("   ")).toEqual([]);
    expect(matchCommands("xyz")).toEqual([]);
    expect(matchCommands("echo hi")).toEqual([]);
    expect(matchCommands("help ")).toEqual([]);
  });
});

describe("ghostSuggestion", () => {
  it("shows the rest of the first match", () => {
    expect(ghostSuggestion("he")).toBe("lp");
    expect(ghostSuggestion("e")).toBe("cho");
    expect(ghostSuggestion("Pro")).toBe("jects");
  });

  it("shows nothing for a complete command, no match, or empty input", () => {
    expect(ghostSuggestion("help")).toBe("");
    expect(ghostSuggestion("HELP")).toBe("");
    expect(ghostSuggestion("zz")).toBe("");
    expect(ghostSuggestion("")).toBe("");
  });
});

describe("acceptSuggestion", () => {
  it("completes to the first match in lowercase", () => {
    expect(acceptSuggestion("He")).toBe("help");
    expect(acceptSuggestion("sk")).toBe("skills");
  });

  it("adds a space after commands that take arguments", () => {
    expect(acceptSuggestion("ec")).toBe("echo ");
  });

  it("leaves non-matching input alone", () => {
    expect(acceptSuggestion("zz")).toBe("zz");
    expect(acceptSuggestion("echo hi")).toBe("echo hi");
  });
});

describe("tabComplete", () => {
  it("completes a unique match", () => {
    expect(tabComplete("con")).toEqual({ value: "contact", options: [] });
    expect(tabComplete("ech")).toEqual({ value: "echo ", options: [] });
  });

  it("extends an ambiguous prefix to the common part", () => {
    // No real commands share more than one letter, so use made-up names
    expect(tabComplete("pr", ["projects", "profile", "help"])).toEqual({ value: "pro", options: [] });
    expect(tabComplete("PR", ["projects", "profile"])).toEqual({ value: "pro", options: [] });
  });

  it("lists candidates when it can't narrow further", () => {
    expect(tabComplete("e")).toEqual({ value: "e", options: ["echo", "experience", "education"] });
    expect(tabComplete("pro", ["projects", "profile"])).toEqual({ value: "pro", options: ["projects", "profile"] });
  });

  it("does nothing without a match", () => {
    expect(tabComplete("zz")).toEqual({ value: "zz", options: [] });
    expect(tabComplete("")).toEqual({ value: "", options: [] });
  });
});
