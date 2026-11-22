import { handleHelp } from "./help.ts";
import { handleAbout } from "./about.ts";
import { handleExperience } from "./experience.ts";
import { handleSkills } from "./skills.ts";
import { handleEducation } from "./education.ts";
import { handleProjects } from "./projects.ts";
import { handleBlogs } from "./blogs.ts";
import { handleContact } from "./contact.ts";

/**
 * What the UI should do after a command runs.
 * - `print`: append `output` to the history
 * - `clear`: wipe the history
 * - `dino`: start the dino game (nothing is printed)
 */
export type CommandResult =
  | { action: "print"; output: string }
  | { action: "clear" }
  | { action: "dino" };

const textCommands: Record<string, () => string> = {
  help: handleHelp,
  about: handleAbout,
  experience: handleExperience,
  skills: handleSkills,
  education: handleEducation,
  projects: handleProjects,
  blogs: handleBlogs,
  contact: handleContact,
};

export function runCommand(input: string): CommandResult {
  const [rawName, ...args] = input.trim().split(/\s+/);
  // Phone keyboards often capitalise the first letter ("Help"), so match case-insensitively
  const name = rawName.toLowerCase();

  if (name === "clear") return { action: "clear" };
  if (name === "dino") return { action: "dino" };
  if (name === "") return { action: "print", output: "" };
  if (name === "echo") return { action: "print", output: args.join(" ") };

  const handler = Object.hasOwn(textCommands, name) ? textCommands[name] : undefined;
  if (handler) return { action: "print", output: handler() };

  return { action: "print", output: `Command not found: ${rawName}` };
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

// A URL runs until whitespace, but must not end in punctuation that usually
// belongs to the surrounding sentence: "(https://x.com)" or "see https://x.com."
const URL_REGEX = /https?:\/\/[^\s<>"']*[^\s<>"'.,;:!?)\]}]/g;

/**
 * Turn plain-text output into safe HTML with clickable http(s) links.
 * Everything is escaped first, since output can contain user input (`echo`)
 * and is rendered with `{@html}`.
 */
export function formatOutput(text: string): string {
  let html = "";
  let last = 0;
  for (const match of text.matchAll(URL_REGEX)) {
    const url = escapeHtml(match[0]);
    html += escapeHtml(text.slice(last, match.index));
    html += `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    last = match.index + match[0].length;
  }
  return html + escapeHtml(text.slice(last));
}
