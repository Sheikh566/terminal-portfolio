import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DinoGame } from "./dino-logic.ts";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, String(v)),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
    data,
  };
}

/** Run ticks until the game ends (or a safety limit is reached). */
function playUntilGameOver(game: DinoGame, limit = 10_000) {
  for (let i = 0; i < limit && !game.isGameOver(); i++) game.tick();
}

describe("DinoGame", () => {
  let storage: ReturnType<typeof memoryStorage>;

  beforeEach(() => {
    storage = memoryStorage();
    vi.stubGlobal("localStorage", storage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("starts with an empty board and the controls hint", () => {
    const game = new DinoGame();
    const frame = game.getFrame();
    expect(game.isGameOver()).toBe(false);
    expect(game.getScore()).toBe(0);
    expect(frame).not.toContain("#");
    expect(frame).toContain("Controls: SPACE/UP or tap to jump, Q to quit");
  });

  it("scores one point per tick while alive", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // never spawn obstacles
    const game = new DinoGame();
    for (let i = 0; i < 25; i++) game.tick();
    expect(game.getScore()).toBe(25);
    expect(game.isGameOver()).toBe(false);
  });

  it("spawns obstacles that end the game when they reach the dino", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.9); // spawn whenever allowed
    const game = new DinoGame();
    playUntilGameOver(game);
    expect(game.isGameOver()).toBe(true);
    expect(game.getFrame()).toContain("GAME OVER!");
  });

  it("lets the dino jump over an obstacle", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.9);
    const game = new DinoGame();
    // First obstacle spawns at step 10 at x=60 and moves 1 column per step.
    // It reaches the hitbox around step 66; jump a few steps before that.
    for (let i = 0; i < 62; i++) game.tick();
    game.jump();
    for (let i = 0; i < 12; i++) game.tick();
    expect(game.isGameOver()).toBe(false);
  });

  it("ignores jumps while airborne", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const control = new DinoGame();
    const doubleJump = new DinoGame();
    control.jump();
    doubleJump.jump();
    control.tick();
    doubleJump.tick();
    doubleJump.jump(); // mid-air: must not re-launch
    for (let i = 0; i < 15; i++) {
      control.tick();
      doubleJump.tick();
      expect(doubleJump.getFrame(), `tick ${i}`).toBe(control.getFrame());
    }
  });

  it("lands exactly on the ground and can jump again right away", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const game = new DinoGame();
    const groundFrame = game.getFrame().split("\n").slice(0, 10).join("\n");
    game.jump();
    // JUMP_FORCE -2 with GRAVITY 0.4 is airborne for exactly 10 steps
    for (let i = 0; i < 11; i++) game.tick();
    expect(game.getFrame().split("\n").slice(0, 10).join("\n")).toBe(groundFrame);
    game.jump();
    game.tick();
    expect(game.getFrame().split("\n").slice(0, 10).join("\n")).not.toBe(groundFrame);
  });

  it("reset() starts a fresh run", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.9);
    const game = new DinoGame();
    playUntilGameOver(game);
    game.reset();
    expect(game.isGameOver()).toBe(false);
    expect(game.getScore()).toBe(0);
    expect(game.getFrame()).not.toContain("#");
  });

  it("does not advance after game over", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.9);
    const game = new DinoGame();
    playUntilGameOver(game);
    const score = game.getScore();
    game.tick();
    expect(game.getScore()).toBe(score);
  });

  it("loads the high score from localStorage", () => {
    storage.setItem("dino_highscore", "1234");
    expect(new DinoGame().getFrame()).toContain("HI: 1234");
  });
});

describe("DinoGame (regressions)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("persists a new high score when the run ends", () => {
    const storage = memoryStorage({ dino_highscore: "5" });
    vi.stubGlobal("localStorage", storage);
    vi.spyOn(Math, "random").mockReturnValue(0.9);
    const game = new DinoGame();
    playUntilGameOver(game);
    expect(game.getScore()).toBeGreaterThan(5);
    expect(storage.getItem("dino_highscore")).toBe(String(game.getScore()));
  });

  it("does not overwrite a higher stored score", () => {
    const storage = memoryStorage({ dino_highscore: "99999" });
    vi.stubGlobal("localStorage", storage);
    vi.spyOn(Math, "random").mockReturnValue(0.9);
    const game = new DinoGame();
    playUntilGameOver(game);
    expect(storage.getItem("dino_highscore")).toBe("99999");
  });

  it("survives a corrupt stored high score", () => {
    vi.stubGlobal("localStorage", memoryStorage({ dino_highscore: "garbage" }));
    expect(new DinoGame().getFrame()).toContain("HI: 0");
  });

  it("works when localStorage throws (e.g. blocked storage)", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => { throw new Error("SecurityError"); },
      setItem: () => { throw new Error("SecurityError"); },
    });
    vi.spyOn(Math, "random").mockReturnValue(0.9);
    const game = new DinoGame();
    expect(() => playUntilGameOver(game)).not.toThrow();
    expect(game.isGameOver()).toBe(true);
  });

  it("only collides when the obstacle is drawn touching the dino", () => {
    vi.stubGlobal("localStorage", memoryStorage());
    vi.spyOn(Math, "random").mockReturnValue(0.9);
    const game = new DinoGame();
    playUntilGameOver(game);
    // The final frame must show the obstacle overlapping the dino's columns (x=2..3),
    // i.e. no gap of open ground between the dino's feet and the obstacle.
    const rows = game.getFrame().split("\n");
    const feetRow = rows[8];
    expect(feetRow.slice(2, 4)).toMatch(/#/);
  });
});

describe("DinoGame high score", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("saves a record when the player quits mid-run", () => {
    const storage = memoryStorage({ dino_highscore: "3" });
    vi.stubGlobal("localStorage", storage);
    vi.spyOn(Math, "random").mockReturnValue(0);
    const game = new DinoGame();
    for (let i = 0; i < 10; i++) game.tick();
    game.commitHighScore();
    expect(storage.getItem("dino_highscore")).toBe("10");
  });

  it("does not let a stale tab overwrite a higher score from another tab", () => {
    const storage = memoryStorage({ dino_highscore: "5" });
    vi.stubGlobal("localStorage", storage);
    vi.spyOn(Math, "random").mockReturnValue(0.9);
    const staleTab = new DinoGame(); // loaded HI 5
    storage.setItem("dino_highscore", "99999"); // another tab sets a record
    playUntilGameOver(staleTab);
    expect(storage.getItem("dino_highscore")).toBe("99999");
    expect(staleTab.getFrame()).toContain("HI: 99999");
  });
});
