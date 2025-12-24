// ==========================================
// Christmas Countdown Timer
// ==========================================
function updateCountdown() {
    const christmas = new Date('December 25, 2025 00:00:00').getTime();
    const now = new Date().getTime();
    const diff = christmas - now;

    if (diff <= 0) {
        document.getElementById('countdown').innerHTML = '🎄 Merry Christmas! 🎄';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('countdown').innerHTML = 
        `${days}d ${hours}h ${minutes}m ${seconds}s until Christmas!`;
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ==========================================
// Snowfall Effect (Canvas-based)
// ==========================================
class Snowfall {
    constructor() {
        this.canvas = document.getElementById('snow-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.snowflakes = [];
        // Reduce snowflake count on mobile for better performance
        this.snowflakeCount = window.innerWidth <= 768 ? 75 : 150;
        
        this.resize();
        this.init();
        this.animate();
        
        // Debounced resize handler for iOS Safari performance
        this.handleResize = this.debounce(() => this.resize(), 250);
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('orientationchange', () => this.resize());
    }
    
    debounce(fn, delay) {
        let timeout;
        return () => {
            clearTimeout(timeout);
            timeout = setTimeout(fn, delay);
        };
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        this.snowflakes = [];
        for (let i = 0; i < this.snowflakeCount; i++) {
            this.snowflakes.push(this.createSnowflake());
        }
    }
    
    createSnowflake(startFromTop = false) {
        return {
            x: Math.random() * this.canvas.width,
            y: startFromTop ? -10 : Math.random() * this.canvas.height,
            radius: Math.random() * 3 + 1,
            speed: Math.random() * 1.5 + 0.5,
            wind: Math.random() * 0.5 - 0.25,
            opacity: Math.random() * 0.6 + 0.4,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.02 + 0.01
        };
    }
    
    update() {
        this.snowflakes.forEach((flake, index) => {
            // Update wobble
            flake.wobble += flake.wobbleSpeed;
            
            // Move snowflake
            flake.y += flake.speed;
            flake.x += flake.wind + Math.sin(flake.wobble) * 0.5;
            
            // Reset if off screen
            if (flake.y > this.canvas.height + 10) {
                this.snowflakes[index] = this.createSnowflake(true);
            }
            
            // Wrap horizontally
            if (flake.x > this.canvas.width + 10) {
                flake.x = -10;
            } else if (flake.x < -10) {
                flake.x = this.canvas.width + 10;
            }
        });
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.snowflakes.forEach(flake => {
            this.ctx.beginPath();
            this.ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
            this.ctx.fill();
        });
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize snowfall
new Snowfall();

// ==========================================
// Christmasify Image Functionality
// ==========================================
class ChristmasifyManager {
    constructor() {
        this.imageCards = document.querySelectorAll('.image-card');
        this.init();
    }
    
    loadImage(img, url, container) {
        const handleComplete = () => {
            container.classList.remove('loading');
            img.classList.remove('fade-out');
        };
        
        img.onload = handleComplete;
        img.onerror = handleComplete;
        img.src = url;
        
        // Handle already-cached images
        if (img.complete) {
            handleComplete();
        }
    }
    
    init() {
        this.imageCards.forEach(card => {
            const christmasifyBtn = card.querySelector('.christmasify-btn');
            const toggleBtn = card.querySelector('.toggle-btn');
            const img = card.querySelector('img');
            const container = card.querySelector('.image-container');
            
            // Store state
            card.dataset.isChristmasified = 'false';
            
            // Christmasify button click
            christmasifyBtn.addEventListener('click', () => {
                this.christmasify(card, img, container, christmasifyBtn, toggleBtn);
            });
            
            // Toggle button click
            toggleBtn.addEventListener('click', () => {
                this.toggle(card, img, container);
            });
        });
    }
    
    christmasify(card, img, container, christmasifyBtn, toggleBtn) {
        const christmasUrl = card.dataset.christmas;
        
        // Add loading state
        container.classList.add('loading');
        
        // Fade out current image
        img.classList.add('fade-out');
        
        // Swap image after fade
        setTimeout(() => {
            card.dataset.isChristmasified = 'true';
            this.loadImage(img, christmasUrl, container);
            
            // Hide christmasify button
            christmasifyBtn.classList.add('hidden');
            
            // Show hospital message if this is the hospital photo
            if (card.dataset.original.includes('hospitaloriginal')) {
                const hospitalMessage = card.querySelector('.hospital-message');
                if (hospitalMessage) {
                    hospitalMessage.classList.remove('hidden');
                    hospitalMessage.classList.add('fade-in');
                }
            }
        }, 500);
        
        // Show toggle button after 5 seconds
        setTimeout(() => {
            toggleBtn.classList.remove('hidden');
            toggleBtn.classList.add('fade-in');
        }, 5000);
    }
    
    toggle(card, img, container) {
        const isChristmasified = card.dataset.isChristmasified === 'true';
        const targetUrl = isChristmasified ? card.dataset.original : card.dataset.christmas;
        
        // Add loading state
        container.classList.add('loading');
        
        // Fade out
        img.classList.add('fade-out');
        
        setTimeout(() => {
            card.dataset.isChristmasified = isChristmasified ? 'false' : 'true';
            this.loadImage(img, targetUrl, container);
            
            // Toggle hospital message visibility if this is the hospital photo
            if (card.dataset.original.includes('hospitaloriginal')) {
                const hospitalMessage = card.querySelector('.hospital-message');
                if (hospitalMessage) {
                    if (isChristmasified) {
                        // Switching to original - hide message
                        hospitalMessage.classList.add('hidden');
                        hospitalMessage.classList.remove('fade-in');
                    } else {
                        // Switching to Christmas - show message
                        hospitalMessage.classList.remove('hidden');
                        hospitalMessage.classList.add('fade-in');
                    }
                }
            }
        }, 500);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ChristmasifyManager();
    new WhackAMoleGame();
    new GalleryParallax();
});

// ==========================================
// Gallery Parallax Scroll Effect
// ==========================================
class GalleryParallax {
    constructor() {
        this.rows = document.querySelectorAll('.gallery-row');
        this.items = document.querySelectorAll('.gallery-item[data-parallax]');
        this.ticking = false;
        this.lastScrollY = 0;
        // Disable parallax on mobile for better iOS Safari performance
        this.isMobile = window.innerWidth <= 768;
        
        this.init();
    }
    
    init() {
        // Skip parallax on mobile for better performance
        if (this.isMobile) return;
        
        // Parallax scroll effect
        this.setupParallaxScroll();
    }
    
    setupParallaxScroll() {
        // Throttled scroll handler for iOS Safari performance
        const handleScroll = () => {
            this.lastScrollY = window.scrollY;
            
            if (!this.ticking) {
                requestAnimationFrame(() => {
                    this.updateParallax();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        };
        
        // Use passive listener for better scroll performance
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Initial update
        this.updateParallax();
    }
    
    updateParallax() {
        // Skip if mobile (double check)
        if (this.isMobile) return;
        
        const windowHeight = window.innerHeight;
        const scrollY = this.lastScrollY;
        
        this.items.forEach(item => {
            const rect = item.getBoundingClientRect();
            const parsed = parseFloat(item.dataset.parallax);
            const parallaxFactor = isNaN(parsed) ? 0.5 : parsed;
            
            // Only apply parallax when item is visible
            if (rect.top < windowHeight && rect.bottom > 0) {
                // Calculate offset based on scroll position
                const elementCenter = rect.top + rect.height / 2;
                const distanceFromCenter = elementCenter - windowHeight / 2;
                const offset = distanceFromCenter * parallaxFactor * 0.15;
                
                // Apply transform
                item.style.transform = `translateY(${offset}px)`;
                item.style.webkitTransform = `translateY(${offset}px)`;
            }
        });
    }
}

// ==========================================
// Whack-a-Mole Game (Safari iOS Optimized)
// ==========================================
class WhackAMoleGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 30;
        this.bestScore = parseInt(localStorage.getItem('whackBestScore')) || 0;
        this.isPlaying = false;
        this.lastHole = -1;
        this.animationId = null;
        this.lastFrameTime = 0;
        this.popInterval = 800; // ms between pops
        this.lastPopTime = 0;
        this.activeHoles = new Set();
        this.leaderboard = this.loadLeaderboard();
        this.newEntryIndex = -1;
        this.highlightTimeoutId = null;
        
        this.characters = ['snowman', 'reindeer', 'present', 'candy'];
        
        this.holes = document.querySelectorAll('.mole-hole');
        this.scoreEl = document.getElementById('game-score');
        this.timerEl = document.getElementById('game-timer');
        this.bestEl = document.getElementById('game-best');
        this.startBtn = document.getElementById('start-game');
        this.stopBtn = document.getElementById('stop-game');
        this.messageEl = document.getElementById('game-message');
        
        // Leaderboard elements
        this.leaderboardBody = document.getElementById('leaderboard-body');
        this.nameModal = document.getElementById('name-modal');
        this.playerNameInput = document.getElementById('player-name-input');
        this.modalScoreValue = document.getElementById('modal-score-value');
        this.submitScoreBtn = document.getElementById('submit-score');
        this.skipScoreBtn = document.getElementById('skip-score');
        
        this.init();
    }
    
    loadLeaderboard() {
        try {
            const data = localStorage.getItem('whackLeaderboard');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }
    
    saveLeaderboard() {
        localStorage.setItem('whackLeaderboard', JSON.stringify(this.leaderboard));
    }
    
    init() {
        this.bestEl.textContent = this.bestScore;
        this.renderLeaderboard();
        
        // Touch-optimized event listeners
        this.holes.forEach(hole => {
            const handler = (e) => {
                e.preventDefault();
                this.whack(hole);
            };
            
            // Use both touch and click for cross-device support
            hole.addEventListener('touchstart', handler, { passive: false });
            hole.addEventListener('mousedown', handler);
        });
        
        this.startBtn.addEventListener('click', () => this.startGame());
        this.startBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startGame();
        }, { passive: false });
        
        // Stop button listeners
        this.stopBtn.addEventListener('click', () => this.stopGame());
        this.stopBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.stopGame();
        }, { passive: false });
        
        // Modal listeners
        this.submitScoreBtn.addEventListener('click', () => this.submitScore());
        this.skipScoreBtn.addEventListener('click', () => this.hideModal());
        this.playerNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.submitScore();
            }
        });
    }
    
    renderLeaderboard() {
        if (this.leaderboard.length === 0) {
            this.leaderboardBody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="3">No scores yet - be the first!</td>
                </tr>
            `;
            return;
        }
        
        this.leaderboardBody.innerHTML = this.leaderboard
            .slice(0, 10)
            .map((entry, index) => {
                const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
                const isNew = index === this.newEntryIndex;
                return `
                    <tr class="${isNew ? 'new-entry' : ''}">
                        <td>${rankEmoji}</td>
                        <td>${this.escapeHtml(entry.name)}</td>
                        <td>${entry.score}</td>
                    </tr>
                `;
            })
            .join('');
        
        // Clear highlight after animation
        if (this.newEntryIndex >= 0) {
            // Clear any pending timeout to prevent premature highlight removal
            if (this.highlightTimeoutId) {
                clearTimeout(this.highlightTimeoutId);
            }
            this.highlightTimeoutId = setTimeout(() => {
                this.newEntryIndex = -1;
                this.highlightTimeoutId = null;
            }, 2000);
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showModal() {
        this.modalScoreValue.textContent = this.score;
        this.playerNameInput.value = localStorage.getItem('whackPlayerName') || '';
        this.nameModal.classList.remove('hidden');
        setTimeout(() => this.playerNameInput.focus(), 100);
    }
    
    hideModal() {
        this.nameModal.classList.add('hidden');
        this.playerNameInput.value = '';
    }
    
    submitScore() {
        const name = this.playerNameInput.value.trim() || 'Anonymous';
        
        // Save name for next time
        localStorage.setItem('whackPlayerName', name);
        
        // Add to leaderboard
        const newEntry = {
            name: name,
            score: this.score,
            date: new Date().toISOString().split('T')[0]
        };
        
        this.leaderboard.push(newEntry);
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 10); // Keep top 10
        
        // Find the index of the new entry for highlighting
        this.newEntryIndex = this.leaderboard.findIndex(
            e => e.name === newEntry.name && e.score === newEntry.score && e.date === newEntry.date
        );
        
        this.saveLeaderboard();
        this.renderLeaderboard();
        this.hideModal();
    }
    
    stopGame() {
        if (!this.isPlaying) return;
        this.endGame(true); // Pass stopped flag
    }
    
    startGame() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.score = 0;
        this.timeLeft = 30;
        this.lastPopTime = 0;
        this.activeHoles.clear();
        
        this.scoreEl.textContent = '0';
        this.timerEl.textContent = '30';
        this.messageEl.textContent = '';
        this.startBtn.disabled = true;
        this.startBtn.textContent = 'Playing...';
        this.stopBtn.classList.remove('hidden');
        
        // Clear any existing characters
        this.holes.forEach(hole => {
            const char = hole.querySelector('.character');
            char.className = 'character';
        });
        
        // Start game loop using single RAF
        this.lastFrameTime = performance.now();
        this.gameLoop();
        
        // Timer countdown
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.timerEl.textContent = this.timeLeft;
            
            // Speed up as time decreases
            if (this.timeLeft <= 10) {
                this.popInterval = 500;
            } else if (this.timeLeft <= 20) {
                this.popInterval = 650;
            }
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    gameLoop() {
        if (!this.isPlaying) return;
        
        const now = performance.now();
        
        // Pop new character based on interval
        if (now - this.lastPopTime >= this.popInterval) {
            this.popCharacter();
            this.lastPopTime = now;
        }
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    popCharacter() {
        // Don't pop if too many are active
        if (this.activeHoles.size >= 3) return;
        
        // Pick a random hole that's not active and not the last one
        let holeIndex;
        let attempts = 0;
        do {
            holeIndex = Math.floor(Math.random() * this.holes.length);
            attempts++;
        } while ((this.activeHoles.has(holeIndex) || holeIndex === this.lastHole) && attempts < 10);
        
        if (this.activeHoles.has(holeIndex)) return;
        
        this.lastHole = holeIndex;
        this.activeHoles.add(holeIndex);
        
        const hole = this.holes[holeIndex];
        const character = hole.querySelector('.character');
        
        // Random character type
        const charType = this.characters[Math.floor(Math.random() * this.characters.length)];
        character.className = `character ${charType} active`;
        
        // Auto-hide after random time
        const hideTime = Math.random() * 600 + 400; // 400-1000ms
        setTimeout(() => {
            if (character.classList.contains('active') && !character.classList.contains('whacked')) {
                character.classList.remove('active');
                this.activeHoles.delete(holeIndex);
            }
        }, hideTime);
    }
    
    whack(hole) {
        if (!this.isPlaying) return;
        
        const character = hole.querySelector('.character');
        const holeIndex = parseInt(hole.dataset.hole);
        
        if (character.classList.contains('active') && !character.classList.contains('whacked')) {
            // Success!
            character.classList.add('whacked');
            character.classList.remove('active');
            
            this.score++;
            this.scoreEl.textContent = this.score;
            this.activeHoles.delete(holeIndex);
            
            // Visual feedback
            this.showHitEffect(hole);
            
            // Reset character after animation
            setTimeout(() => {
                character.className = 'character';
            }, 300);
        }
    }
    
    showHitEffect(hole) {
        // Create sparkle effect
        const sparkle = document.createElement('div');
        sparkle.className = 'hit-sparkle';
        sparkle.innerHTML = '✨';
        sparkle.style.cssText = `
            position: absolute;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            font-size: 2rem;
            z-index: 10;
            animation: sparkleUp 0.5s ease-out forwards;
            pointer-events: none;
        `;
        hole.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 500);
    }
    
    endGame(stopped = false) {
        this.isPlaying = false;
        clearInterval(this.timerInterval);
        cancelAnimationFrame(this.animationId);
        this.popInterval = 800;
        
        // Hide all active characters
        this.holes.forEach(hole => {
            const char = hole.querySelector('.character');
            char.className = 'character';
        });
        this.activeHoles.clear();
        
        // Update best score if needed
        if (!stopped && this.score > this.bestScore) {
            this.bestScore = this.score;
            this.bestEl.textContent = this.bestScore;
            localStorage.setItem('whackBestScore', this.bestScore);
        }
        
        // Set message based on how game ended
        if (stopped) {
            this.messageEl.textContent = `Game stopped! You scored ${this.score} points.`;
        } else {
            this.messageEl.textContent = '';
        }
        
        this.startBtn.disabled = false;
        this.startBtn.textContent = 'Play Again';
        this.stopBtn.classList.add('hidden');
        
        // Show name entry modal if game completed naturally and score > 0
        if (!stopped && this.score > 0) {
            this.showModal();
        }
    }
}
