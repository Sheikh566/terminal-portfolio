<script lang="ts">
  import { onMount } from "svelte";
  import { intro } from "#lib/intro.ts";
  import { runCommand, formatOutput } from "#lib/terminal.ts";
  import { DinoGame } from "#lib/games/dino-logic.ts";

  let commandHistory: Array<{ id: string, command: string | null, output: string }> = $state([
    { id: crypto.randomUUID(), command: null, output: intro() },
  ]);
  
  // Game state
  let isPlaying = $state(false);
  let gameOutput = $state("");
  let game: DinoGame | null = null;
  let animationFrameId = 0;
  let lastTime = 0;
  let accumulator = 0;
  const STEP_MS = 50; // 20 game steps per second
  const MAX_FRAME_MS = 250;

  function handleEnter(event: KeyboardEvent) {
    if (event.key === "Enter") {
      const input = event.target as HTMLInputElement;
      processCommand(input.value);
      input.value = "";
    }
  }

  function processCommand(command: string) {
    const result = runCommand(command);

    if (result.action === "clear") {
      commandHistory = [];
    } else if (result.action === "dino") {
      startDinoGame(); // the game takes over the screen; nothing is printed
    } else {
      commandHistory = [...commandHistory, { id: crypto.randomUUID(), command, output: result.output }];
    }
  }

  function startDinoGame() {
    isPlaying = true;
    game = new DinoGame();
    gameOutput = game.getFrame();
    startLoop();
  }

  function stopDinoGame() {
    game?.commitHighScore(); // keep a record set before quitting mid-run
    isPlaying = false;
    stopLoop();
    game = null;
    // Add a small delay to focus back on terminal input
    setTimeout(() => {
        document.getElementById("terminal")?.focus();
    }, 10);
  }

  function startLoop() {
    stopLoop();
    lastTime = performance.now();
    accumulator = 0;
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function stopLoop() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = 0;
  }

  // Fixed time step: game speed is the same on 60Hz, 120Hz, or throttled displays,
  // and the frame string is only rebuilt when the game state actually advanced.
  function gameLoop(now: number) {
    if (!game || !isPlaying) return;

    // Clamp so a backgrounded tab doesn't fast-forward the game on return
    accumulator += Math.min(now - lastTime, MAX_FRAME_MS);
    lastTime = now;

    let stepped = false;
    while (accumulator >= STEP_MS && !game.isGameOver()) {
        game.tick();
        accumulator -= STEP_MS;
        stepped = true;
    }

    if (stepped) gameOutput = game.getFrame();

    // On game over, the final frame stays on screen; R restarts the loop
    animationFrameId = game.isGameOver() ? 0 : requestAnimationFrame(gameLoop);
  }

  function retryDinoGame() {
    if (!game?.isGameOver()) return;
    game.reset();
    gameOutput = game.getFrame();
    startLoop();
  }

  function handleGameKey(event: KeyboardEvent) {
    if (!isPlaying || !game) return;
    // Leave browser shortcuts like Cmd/Ctrl+R alone
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    // Let a focused [ quit ] button handle its own Enter/Space
    if ((event.target as Element).closest?.("button")) return;

    // Prevent default scrolling for game keys
    if (["ArrowUp", " ", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
    }

    if (event.key === "q" || event.key === "Q" || event.key === "Escape") {
        stopDinoGame();
    } else if (event.key === "r" || event.key === "R") {
        retryDinoGame();
    } else if (event.key === " " || event.key === "ArrowUp") {
        game.jump();
    }
  }

  // Touch/mouse: tap to jump, or to retry after game over
  function handleGamePointer(event: PointerEvent) {
    if (!game || event.button !== 0) return;
    event.preventDefault();
    if (game.isGameOver()) retryDinoGame();
    else game.jump();
  }

  // Don't steal focus when the user clicks a link, the input itself, or is selecting text to copy
  function focusTerminalFromClick(event: MouseEvent) {
    if (isPlaying) return;
    if ((event.target as Element).closest("a, button, input")) return;
    if (window.getSelection()?.toString()) return;
    document.getElementById("terminal")?.focus();
  }

  onMount(() => {
    document.getElementById("terminal")?.focus();
  });

</script>

<svelte:window onkeydown={isPlaying ? handleGameKey : undefined} />

<!-- Main Container: clicking empty space focuses the input. Keyboard users reach
     the input directly, so no key handler is needed here. -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div onclick={focusTerminalFromClick}>
  {#if isPlaying}
    <div class="game-container" role="application" aria-label="Dino game: tap or press space to jump" onpointerdown={handleGamePointer}>
        <pre>{gameOutput}</pre>
        <button
          type="button"
          class="quit"
          onpointerdown={(e) => e.stopPropagation()}
          onclick={stopDinoGame}
        >[ quit ]</button>
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
        aria-label="Terminal command"
        autocomplete="off"
        autocapitalize="none"
        autocorrect="off"
        spellcheck="false"
        enterkeyhint="send"
        onkeydown={handleEnter}
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
    flex-direction: column;
    touch-action: manipulation;
    user-select: none;
    justify-content: center;
    align-items: center;
    height: 95vh;
    white-space: pre;
    color: #2eff51;
  }

  /* The board is 60 columns (~36em of monospace). Shrink it on narrow screens so
     the dino at the left edge stays visible instead of being cut off. */
  .game-container pre {
    font-size: min(1rem, calc((100vw - 2rem) / 37));
  }

  .quit {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
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