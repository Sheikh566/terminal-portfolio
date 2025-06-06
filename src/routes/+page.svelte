<script lang="ts">
  import { intro } from "$lib/intro";
  import { handleHelp } from "$lib/help";
  import { handleAbout } from "$lib/about";
  import { handleSkills } from "$lib/skills";
  import { handleEducation } from "$lib/education";
  import { handleProjects } from "$lib/projects";
  import { handleBlogs } from "$lib/blogs";
  import { handleContact } from "$lib/contact";

  let commandHistory: Array<{ command: string | null, output: string }> = $state([
    { command: null, output: intro() },
  ]);

  function handleEnter(event: KeyboardEvent) {
    if (event.key === "Enter") {
      const input = event.target as HTMLInputElement;
      processCommand(input.value);
      input.value = "";
    }
  }

  function processCommand(command: string) {
    let output = "";
    let keywords = command.trim().split(/\s+/);

    switch (keywords[0]) {
      case "help":
        output = handleHelp();
        break;
      case "about":
        output = handleAbout();
        break;
      case "skills":
        output = handleSkills();
        break;
      case "education":
        output = handleEducation();
        break;
      case "projects":
        output = handleProjects();
        break;
      case "blogs":
        output = handleBlogs();
        break;
      case "contact":
        output = handleContact();
        break
      case "clear":
        commandHistory = [];
        return;
      case "":
        break;
      case "echo":
        output = keywords.slice(1).join(" ");
        break;
      default:
        output = `Command not found: ${keywords[0]}`;
        break;
    }

    commandHistory = [...commandHistory, { command, output }];
  }

  // Format output to make URLs clickable
  function formatOutput(text: string): string {
    // Regular expression to match URLs (http/https)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  // $inspect(commandHistory);
</script>

<div 
  role="textbox" 
  tabindex="0"
  onclick={() => document.getElementById("terminal")?.focus()}
  onkeydown={(e) => e.key === 'Enter' && document.getElementById("terminal")?.focus()}
>
  {#each commandHistory as { command, output }}
    {#if command !== null}
      <div class="command">
        <span>$ {command}</span>
      </div>
    {/if}
    <div class="output">
      {@html formatOutput(output)}
    </div>
  {/each}

  <div>
    <span>$</span>
    <input
      type="text"
      id="terminal"
      placeholder=""
      autocomplete="off"
      onkeydown={handleEnter}
      onblur={(e) => (e.target as HTMLInputElement)?.focus()}
    />
  </div>
</div>

<style>
  #terminal {
    background-color: transparent;
    border: none;
    outline: none;
    width: 97%;
  }

  .command, .output {
    white-space: pre;
  }

  /* Style for links */
  :global(.output a) {
    color: #2eff51;
    text-decoration: none;
  }

  :global(.output a:hover) {
    text-decoration: underline;
  }
</style>
