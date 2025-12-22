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
        }, 500);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ChristmasifyManager();
});
