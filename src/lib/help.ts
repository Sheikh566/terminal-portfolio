import commands from './commands.json';

export function handleHelp() {
  let output = 'Welcome to SheikhOS v1.2.0\n\n';
  output += 'Available commands:\n';
  for (const [command, { description, usage }] of Object.entries(commands)) {
    // padEnd never throws, unlike ' '.repeat(n) with a negative n for long entries
    output += `${`${command}:`.padEnd(12)}${description.padEnd(35)}Usage: ${usage}\n`;
  }

  return output;
}
