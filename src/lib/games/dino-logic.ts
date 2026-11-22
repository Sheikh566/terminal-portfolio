const snap = (n: number) => Math.round(n * 1e6) / 1e6;

export class DinoGame {
    private width = 60;
    private height = 10;
    private dinoY = 0;
    private dinoVelocity = 0;
    private isJumping = false;
    private obstacles: number[] = [];
    private score = 0;
    private highScore = 0;
    private gameOver = false;
    private frameCount = 0;

    private readonly GRAVITY = 0.4;
    private readonly JUMP_FORCE = -2.0; // Reduced jump height and speed
    private readonly GROUND_Y = 0;
    private readonly OBSTACLE_SPEED = 1;
    private readonly MIN_OBSTACLE_DISTANCE = 22;
    private readonly STORAGE_KEY = 'dino_highscore';
    private readonly DINO_X = 2;

    constructor() {
        this.loadHighScore();
        this.reset();
    }

    // localStorage can be missing (SSR) or throw (blocked storage, private mode).
    // The high score is a nice-to-have, so storage failures are ignored.
    private readStoredHighScore(): number {
        try {
            const saved = Number.parseInt(localStorage.getItem(this.STORAGE_KEY) ?? '', 10);
            return Number.isFinite(saved) && saved > 0 ? saved : 0;
        } catch {
            return 0;
        }
    }

    private loadHighScore() {
        this.highScore = this.readStoredHighScore();
    }

    /**
     * Save the best of this run, this session and what's stored. Re-reading storage
     * means a stale tab can't overwrite a higher score set in another tab.
     * Call on game over and when the player quits mid-run.
     */
    commitHighScore() {
        const stored = this.readStoredHighScore();
        this.highScore = Math.max(this.highScore, this.score, stored);
        if (this.highScore > stored) {
            try {
                localStorage.setItem(this.STORAGE_KEY, this.highScore.toString());
            } catch {
                // ignore
            }
        }
    }

    reset() {
        this.dinoY = 0;
        this.dinoVelocity = 0;
        this.isJumping = false;
        this.obstacles = [];
        this.score = 0;
        this.gameOver = false;
        this.frameCount = 0;
    }

    jump() {
        if (!this.isJumping && this.dinoY === this.GROUND_Y && !this.gameOver) {
            this.dinoVelocity = this.JUMP_FORCE;
            this.isJumping = true;
        }
    }

    private canSpawnObstacle(): boolean {
        if (this.obstacles.length === 0) {
            return true;
        }

        const rightmostObstacle = Math.max(...this.obstacles);
        return this.width - rightmostObstacle >= this.MIN_OBSTACLE_DISTANCE;
    }

    /** Advance the game by one fixed step. The caller controls timing. */
    tick() {
        if (this.gameOver) return;

        this.frameCount++;

        // Physics
        if (this.isJumping || this.dinoY !== this.GROUND_Y) {
            // Snap to 6 decimals: 0.4 isn't exact in binary, and without this the
            // landing step ends at -1e-15 instead of 0, so the dino hovers a row too long.
            this.dinoY = snap(this.dinoY + this.dinoVelocity);
            this.dinoVelocity = snap(this.dinoVelocity + this.GRAVITY);

            if (this.dinoY >= this.GROUND_Y) {
                this.dinoY = this.GROUND_Y;
                this.dinoVelocity = 0;
                this.isJumping = false;
            }
        }

        // Obstacles
        if (this.frameCount % 10 === 0 && Math.random() > 0.5 && this.canSpawnObstacle()) {
            this.obstacles.push(this.width);
        }

        this.obstacles = this.obstacles
            .map(x => x - this.OBSTACLE_SPEED)
            .filter(x => x > -2); // Remove obstacles that are off screen

        // Collision: the dino occupies columns DINO_X..DINO_X+1 on the ground row,
        // and is airborne once it has risen at least one row (dinoY <= -1).
        const onGround = this.dinoY > -1;
        const hit = onGround && this.obstacles.some(
            x => x >= this.DINO_X && x <= this.DINO_X + 1
        );

        if (hit) {
            this.gameOver = true;
            this.commitHighScore();
            return;
        }

        this.score++;
    }

    getFrame(): string {
        const grid: string[][] = Array(this.height).fill(null).map(() => Array(this.width).fill(' '));
        
        // Draw Ground
        const groundY = this.height - 1;
        for(let x=0; x<this.width; x++) grid[groundY][x] = '_';

        // Draw Dino (2 columns wide). dinoY is 0 on the ground and negative in the air.
        //  O>
        //  /\
        const dinoFootY = groundY + Math.floor(this.dinoY);
        const dinoX = this.DINO_X;

        if (dinoFootY >= 0 && dinoFootY < this.height) {
            if (dinoFootY - 1 >= 0) {
                grid[dinoFootY - 1][dinoX] = 'O';
                grid[dinoFootY - 1][dinoX + 1] = '>';
            }
            grid[dinoFootY][dinoX] = '/';
            grid[dinoFootY][dinoX + 1] = '\\';
        }

        // Draw Obstacles
        for (const obsX of this.obstacles) {
            const x = Math.floor(obsX);
            if (x >= 0 && x < this.width) {
                grid[groundY-1][x] = '#';
            }
        }

        // Render
        let output = grid.map(row => row.join('')).join('\n');
        output += `\nScore: ${this.score.toString().padEnd(10)} HI: ${Math.max(this.score, this.highScore)}`;
        if (this.gameOver) {
            output += `\n\nGAME OVER! Press 'R' or tap to retry, 'Q' to quit.`;
        } else {
            output += `\n\nControls: SPACE/UP or tap to jump, Q to quit`;
        }
        
        return output;
    }
    
    isGameOver() {
        return this.gameOver;
    }
    
    getScore() {
        return this.score;
    }
}
