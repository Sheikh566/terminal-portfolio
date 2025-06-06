import commands from './commands.json';

export function handleHelp() {
  let output = 'Welcome to SheikhOS v1.0.0\n\n';
  output += 'Available commands:\n';
  Object.keys(commands).forEach((command: string) => {
    const { description, usage } = commands[command];
    const commadSpace = ' '.repeat(10 - command.length);
    const descriptionSpace = ' '.repeat(35 - description.length);
    output += `${command}:${commadSpace}${description}${descriptionSpace}Usage: ${usage}\n`;
  });

  return output;
}