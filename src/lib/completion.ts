import commands from "./commands.json";

/** Command names in the order `help` lists them. */
export const COMMAND_NAMES = Object.keys(commands) as Array<keyof typeof commands>;

/** Commands whose usage takes arguments get a trailing space when completed, ready for typing. */
function completedText(name: string): string {
  const usage = (commands as Record<string, { usage: string }>)[name]?.usage ?? "";
  return usage.includes("[") ? `${name} ` : name;
}

/**
 * Commands that start with what's typed. Completion only applies to the command name:
 * once there's a space (arguments), nothing matches. Matching ignores case.
 */
export function matchCommands<T extends string = keyof typeof commands>(
  input: string,
  names: readonly T[] = COMMAND_NAMES as unknown as T[],
): T[] {
  const typed = input.trimStart();
  if (typed === "" || /\s/.test(typed)) return [];
  const prefix = typed.toLowerCase();
  return names.filter((name) => name.startsWith(prefix));
}

/**
 * The dimmed "ghost" text to show after the cursor: the rest of the first matching
 * command. Empty when nothing matches or the input is already a full command name.
 */
export function ghostSuggestion(input: string): string {
  const typed = input.trimStart();
  const [first] = matchCommands(input);
  if (!first || first === typed.toLowerCase()) return "";
  return first.slice(typed.length);
}

/** Accept the ghost suggestion (→ key or tap). Returns the input unchanged if there's none. */
export function acceptSuggestion(input: string): string {
  const [first] = matchCommands(input);
  return first ? completedText(first) : input;
}

export type TabResult = {
  /** The new input value. */
  value: string;
  /** Candidates to list, when Tab can't narrow things down any further. */
  options: string[];
};

/**
 * Bash-style Tab completion: complete a unique match, otherwise extend to the longest
 * common prefix, and if that adds nothing, return the candidates to list.
 */
export function tabComplete(input: string, names: readonly string[] = COMMAND_NAMES): TabResult {
  const matches = matchCommands(input, names);
  if (matches.length === 0) return { value: input, options: [] };
  if (matches.length === 1) return { value: completedText(matches[0]), options: [] };

  const typed = input.trimStart().toLowerCase();
  const common = longestCommonPrefix(matches);
  if (common.length > typed.length) return { value: common, options: [] };
  return { value: input, options: matches };
}

function longestCommonPrefix(words: string[]): string {
  let prefix = words[0];
  for (const word of words.slice(1)) {
    while (!word.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}
