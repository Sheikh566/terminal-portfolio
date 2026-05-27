<script lang="ts">
  import { onMount } from "svelte";
  import { intro } from "$lib/intro";
  import { handleHelp } from "$lib/help";
  import { handleAbout } from "$lib/about";
  import { handleExperience } from "$lib/experience";
  import { handleSkills } from "$lib/skills";
  import { handleEducation } from "$lib/education";
  import { handleProjects } from "$lib/projects";
  import { handleBlogs } from "$lib/blogs";
  import { handleContact } from "$lib/contact";
  import { DinoGame } from "$lib/games/dino-logic";

  let commandHistory: Array<{ id: string, command: string | null, output: string }> = $state([
    { id: crypto.randomUUID(), command: null, output: intro() },
  ]);
  
  // Game state
  let isPlaying = $state(false);
  let gameOutput = $state("");
  let game: DinoGame | null = null;
  let animationFrameId: number;

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
      case "experience":
        output = handleExperience();
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
      case "dino":
        startDinoGame();
        return; // Don't add to history immediately
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

    commandHistory = [...commandHistory, { id: crypto.randomUUID(), command, output }];
  }

  function startDinoGame() {
    isPlaying = true;
    game = new DinoGame();
    gameLoop();
  }

  function stopDinoGame() {
    isPlaying = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    game = null;
    // Add a small delay to focus back on terminal input
    setTimeout(() => {
        document.getElementById("terminal")?.focus();
    }, 10);
  }

  function gameLoop() {
    if (!game || !isPlaying) return;

    game.tick();
    gameOutput = game.getFrame();

    if (!game.isGameOver()) {
        // Slow down the game loop slightly for better visibility if needed
        // For now, requestAnimationFrame runs at ~60fps which might be fast for this tick logic
        // We can throttle in tick() or here. DinoGame has some throttle via frameCount % 30 for obstacles.
        // Let's trust tick logic.
        animationFrameId = requestAnimationFrame(gameLoop);
    } else {
        // Game Over state - still render one last frame (done above)
        // We keep isPlaying true so user sees Game Over screen
        // They can press Q or R
        animationFrameId = requestAnimationFrame(gameLoop);
    }
  }

  function handleGameKey(event: KeyboardEvent) {
    if (!isPlaying || !game) return;

    // Prevent default scrolling for game keys
    if (["ArrowUp", " ", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
    }

    if (event.key === "q" || event.key === "Q" || event.key === "Escape") {
        stopDinoGame();
    } else if (event.key === "r" || event.key === "R") {
        if (game.isGameOver()) {
            game.reset();
        }
    } else if (event.key === " " || event.key === "ArrowUp") {
        game.jump();
    }
  }


  onMount(() => {
    document.getElementById("terminal")?.focus();
  });

  // Format output to make URLs clickable
  function formatOutput(text: string): string {
    // Regular expression to match URLs (http/https)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  // $inspect(commandHistory);
</script>

<svelte:window onkeydown={isPlaying ? handleGameKey : undefined} />

<!-- Main Container -->
<div 
  role="textbox" 
  tabindex="0"
  onclick={() => !isPlaying && document.getElementById("terminal")?.focus()}
  onkeydown={(e) => !isPlaying && e.key === 'Enter' && document.getElementById("terminal")?.focus()}
>
  {#if isPlaying}
    <div class="game-container">
        <pre>{gameOutput}</pre>
    </div>
  {:else}
    {#each commandHistory as { id, command, output } (id)}
        {#if command !== null}
        <div class="command">
            <span>$ {command}</span>
        </div>
        {/if}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
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
  {/if}
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

  .game-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80vh;
    font-family: monospace;
    white-space: pre;
    color: #2eff51;
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