import commands from './commands.json';

export function handleHelp() {
  let output = 'Welcome to SheikhOS v1.4.0\n\n';
  output += 'Available commands:\n';
  for (const [command, { description, usage }] of Object.entries(commands)) {
    // padEnd never throws, unlike ' '.repeat(n) with a negative n for long entries
    output += `${`${command}:`.padEnd(12)}${description.padEnd(35)}Usage: ${usage}\n`;
  }
  output += '\nTip: Tab completes a command; → (or tapping the dimmed suggestion) accepts it.\n';

  return output;
}
