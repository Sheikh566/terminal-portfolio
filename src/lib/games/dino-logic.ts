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
    private readonly STORAGE_KEY = 'dino_highscore';

    constructor() {
        this.loadHighScore();
        this.reset();
    }

    private loadHighScore() {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                this.highScore = parseInt(saved, 10);
            }
        }
    }

    private saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(this.STORAGE_KEY, this.highScore.toString());
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

    tick() {
        if (this.gameOver) return;

        this.frameCount++;

        // Physics
        if (this.isJumping || this.dinoY !== this.GROUND_Y) {
            this.dinoY += this.dinoVelocity;
            this.dinoVelocity += this.GRAVITY;

            if (this.dinoY >= this.GROUND_Y) {
                this.dinoY = this.GROUND_Y;
                this.dinoVelocity = 0;
                this.isJumping = false;
            }
        }

        // Obstacles
        if (this.frameCount % 30 === 0 && Math.random() > 0.5) {
            this.obstacles.push(this.width);
        }

        this.obstacles = this.obstacles
            .map(x => x - this.OBSTACLE_SPEED)
            .filter(x => x > -2); // Remove obstacles that are off screen

        // Collision detection
        const dinoHitboxX = 4; // Dino is roughly at x=2 to x=6
        const dinoHitboxY = this.height - Math.floor(this.dinoY);
        
        for (const obsX of this.obstacles) {
            // Simple collision: if obstacle is within dino X range and dino is on ground
            if (obsX >= 2 && obsX <= 6 && this.dinoY > -1) { 
                 // Dino y is negative when jumping (0 is ground)
                 // In our coord system: 0 is ground. negative is UP.
                 // Wait, let's fix coordinate system. 
                 // Let's say y=0 is ground. y increases as we go UP.
                 // But gravity adds to velocity, velocity adds to Y. 
                 // If JUMP_FORCE is negative, then Y becomes negative (UP).
                 // Let's keep: Y=0 is ground, Negative Y is AIR.
                 
                 // Collision:
                 // Obstacle is at Y=0 (ground).
                 // Dino hits if it's close to ground (e.g. > -1) AND x matches.
                 
                 this.gameOver = true;
                 this.saveHighScore();
            }
        }

        if (!this.gameOver) {
            this.score++;
            if (this.score > this.highScore) {
                this.highScore = this.score;
                // Optimization: only save to localStorage on game over or periodically if needed
            }
        }
    }

    getFrame(): string {
        const grid: string[][] = Array(this.height).fill(null).map(() => Array(this.width).fill(' '));
        
        // Draw Ground
        const groundY = this.height - 1;
        for(let x=0; x<this.width; x++) grid[groundY][x] = '_';

        // Draw Dino
        // Dino is at x=2. Y depends on this.dinoY (0 is ground, negative is up)
        // We need to map this.dinoY to grid coordinates.
        // groundY is floor. 
        // Dino foot is at groundY - 1 + this.dinoY (since dinoY is <= 0)
        
        const dinoFootY = groundY + Math.floor(this.dinoY);
        const dinoX = 2;

        // Simple Dino Art (2x2)
        //  O
        // /|\
        // / \
        
        if (dinoFootY >= 0 && dinoFootY < this.height) {
             // Only draw if within bounds
             if (dinoFootY - 1 >= 0) {
                grid[dinoFootY - 1][dinoX] = 'O';
                grid[dinoFootY - 1][dinoX+1] = '>';
             }
             if (dinoFootY >= 0) {
                grid[dinoFootY][dinoX] = '/';
                grid[dinoFootY][dinoX+1] = '\\';
             }
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
        output += `\nScore: ${this.score.toString().padEnd(10)} HI: ${this.highScore}`;
        if (this.gameOver) {
            output += `\n\nGAME OVER! Press 'R' to retry or 'Q' to quit.`;
        } else {
            output += `\n\nControls: SPACE/UP to jump, Q to quit`;
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
