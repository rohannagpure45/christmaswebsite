function updateCountdown() {
    const christmas = new Date('December 25, 2025 00:00:00').getTime();
    const now = new Date().getTime();
    const diff = christmas - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('countdown').innerHTML = 
        `${days}d ${hours}h ${minutes}m ${seconds}s until Christmas!`;
}

setInterval(updateCountdown, 1000);
updateCountdown();
