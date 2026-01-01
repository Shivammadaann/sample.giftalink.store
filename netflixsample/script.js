// ====================
// CONFIGURATION
// ====================
const CONFIG = {
    PASSWORD: "1234", // Your secret password
    MAX_ATTEMPTS: 5,
    ANNIVERSARY_DATE: new Date(new Date().getFullYear() + 1, 0, 1), // Next year Jan 1st
    MEMORIES: [
        { src: "../assets/us1.jpeg", title: "Photo-genic Gul vs Photo-Hating Me", desc: "You being the photo-genic one and me being exactly the opposite!" },
        { src: "../assets/us2.png", title: "Bullet Rides Together", desc: "Our Bullet Rides Together. 😘" },
        { src: "../assets/us3.png", title: "Late Night Chai Drives", desc: "Late Night Drives to Get Chai for you. ❤️" },
        { src: "../assets/us4.png", title: "Best Kisser Ever", desc: "You Being the Best Kisser Ever!" }
    ],
    LOVE_LEVELS: [
        "Just Starting",
        "Growing Strong",
        "Deeply in Love",
        "Unbreakable Bond",
        "Eternal Love"
    ]
};

// ====================
// STATE MANAGEMENT
// ====================
let state = {
    unlocked: sessionStorage.getItem('unlocked') === 'true',
    attempts: 0,
    loveLevel: 100,
    currentMemoryIndex: 0,
    isMusicPlaying: false,
    backgroundMusic: null,
    konamiIndex: 0,
    konamiCode: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
};

// ====================
// DOM ELEMENTS
// ====================
const elements = {
    lockScreen: document.getElementById('lockScreen'),
    passwordInput: document.getElementById('passwordInput'),
    errorMsg: document.getElementById('errorMsg'),
    mainContent: document.getElementById('mainContent'),
    progressBar: document.getElementById('progressBar'),
    musicBtn: document.getElementById('musicBtn'),
    loveFill: document.getElementById('loveFill'),
    lovePercentage: document.getElementById('lovePercentage'),
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    memoryLightbox: document.getElementById('memoryLightbox'),
    lightboxImage: document.getElementById('lightboxImage'),
    lightboxTitle: document.getElementById('lightboxTitle'),
    lightboxDesc: document.getElementById('lightboxDesc'),
    secretModal: document.getElementById('secretModal'),
    season2Days: document.getElementById('season2Days')
};

// ====================
// PASSWORD SYSTEM
// ====================
function unlock() {
    const input = elements.passwordInput.value.trim();
    state.attempts++;
    
    if (input === CONFIG.PASSWORD) {
        // Success
        state.unlocked = true;
        sessionStorage.setItem('unlocked', 'true');
        
        // Visual feedback
        elements.lockScreen.style.opacity = '0';
        elements.lockScreen.style.pointerEvents = 'none';
        document.body.style.overflow = 'auto';
        document.body.classList.add('unlocked');
        
        // Celebration effects
        createConfetti();
        playSuccessSound();
        
        // Show main content with animation
        setTimeout(() => {
            elements.lockScreen.style.display = 'none';
            initializeMainContent();
        }, 1000);
        
    } else {
        // Failure
        const attemptsLeft = CONFIG.MAX_ATTEMPTS - state.attempts;
        
        if (attemptsLeft <= 0) {
            elements.errorMsg.innerHTML = `
                <i class="fas fa-lock"></i> Too many attempts!<br>
                <small>Hint: My name + birthday (0720)</small>
            `;
            elements.passwordInput.disabled = true;
            setTimeout(() => {
                elements.passwordInput.disabled = false;
                state.attempts = 0;
                elements.errorMsg.textContent = '';
            }, 30000);
        } else {
            elements.errorMsg.innerHTML = `
                <i class="fas fa-times-circle"></i> Wrong password!<br>
                <small>${attemptsLeft} attempt${attemptsLeft > 1 ? 's' : ''} remaining</small>
            `;
            
            // Shake animation
            elements.passwordInput.parentElement.style.animation = 'shake 0.5s';
            setTimeout(() => {
                elements.passwordInput.parentElement.style.animation = '';
            }, 500);
            
            // Clear input
            elements.passwordInput.value = '';
            elements.passwordInput.focus();
        }
    }
}

// ====================
// INITIALIZATION
// ====================
function initializeMainContent() {
    // Update countdown
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Set season 2 countdown (1 year from now)
    updateSeason2Countdown();
    
    // Initialize progress bar
    window.addEventListener('scroll', updateProgressBar);
    
    // Initialize memory lightbox
    initializeMemories();
    
    // Add konami code listener
    document.addEventListener('keydown', handleKonamiCode);
    
    // Add click sounds to buttons
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => playClickSound());
    });
    
    // Initialize love meter
    updateLoveMeter();
}

// ====================
// SCROLL FUNCTIONS
// ====================
function scrollToStory() {
    document.querySelector(".section-header").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function updateProgressBar() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    elements.progressBar.style.width = scrolled + "%";
}

// ====================
// COUNTDOWN FUNCTIONS
// ====================
function updateCountdown() {
    const now = new Date().getTime();
    const diff = CONFIG.ANNIVERSARY_DATE - now;
    
    if (diff < 0) {
        // If anniversary passed, set to next year
        CONFIG.ANNIVERSARY_DATE.setFullYear(CONFIG.ANNIVERSARY_DATE.getFullYear() + 1);
        return updateCountdown();
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    elements.days.textContent = days.toString().padStart(2, '0');
    elements.hours.textContent = hours.toString().padStart(2, '0');
    elements.minutes.textContent = minutes.toString().padStart(2, '0');
    elements.seconds.textContent = seconds.toString().padStart(2, '0');
}

function updateSeason2Countdown() {
    const nextYear = new Date().getFullYear() + 1;
    const season2Date = new Date(nextYear, 0, 1);
    const today = new Date();
    const diffTime = season2Date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    elements.season2Days.textContent = diffDays;
}

// ====================
// MEMORY LIGHTBOX
// ====================
function initializeMemories() {
    document.querySelectorAll('.memory-card').forEach((card, index) => {
        card.addEventListener('click', () => openMemory(index));
    });
}

function openMemory(index) {
    state.currentMemoryIndex = index;
    const memory = CONFIG.MEMORIES[index];
    
    elements.lightboxImage.src = memory.src;
    elements.lightboxTitle.textContent = memory.title;
    elements.lightboxDesc.textContent = memory.desc;
    
    elements.memoryLightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeMemory() {
    elements.memoryLightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function prevMemory() {
    state.currentMemoryIndex = (state.currentMemoryIndex - 1 + CONFIG.MEMORIES.length) % CONFIG.MEMORIES.length;
    openMemory(state.currentMemoryIndex);
}

function nextMemory() {
    state.currentMemoryIndex = (state.currentMemoryIndex + 1) % CONFIG.MEMORIES.length;
    openMemory(state.currentMemoryIndex);
}

// Close lightbox on ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.memoryLightbox.style.display === 'flex') {
        closeMemory();
    }
});

// ====================
// LOVE METER
// ====================
function increaseLove() {
    if (state.loveLevel < 200) {
        const increase = Math.floor(Math.random() * 15) + 5;
        state.loveLevel = Math.min(state.loveLevel + increase, 200);
        updateLoveMeter();
        createHearts();
        playLoveSound();
    }
}

function updateLoveMeter() {
    elements.loveFill.style.width = `${state.loveLevel}%`;
    elements.lovePercentage.textContent = `${state.loveLevel}%`;
    
    // Add extra effect at certain levels
    if (state.loveLevel > 150) {
        elements.loveFill.style.background = 'linear-gradient(90deg, #e50914, #ff6b6b, #ffd700)';
        elements.loveFill.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.7)';
    } else if (state.loveLevel > 100) {
        elements.loveFill.style.background = 'linear-gradient(90deg, #e50914, #ff6b6b, #ff8c00)';
        elements.loveFill.style.boxShadow = '0 0 20px rgba(229, 9, 20, 0.7)';
    }
}

// ====================
// MUSIC PLAYER
// ====================
function toggleMusic() {
    if (!state.backgroundMusic) {
        // Create audio element
        state.backgroundMusic = new Audio('../assets/music.mp3'); // ← Add your file path here
        state.backgroundMusic.loop = true;
        state.backgroundMusic.volume = 0.3;

        // You can add your own background music file
        // state.backgroundMusic.src = 'assets/background-music.mp3';
        
        // For now, we'll use a placeholder
        // In a real implementation, add your music file to assets/
    }
    
    if (state.isMusicPlaying) {
        state.backgroundMusic.pause();
        elements.musicBtn.innerHTML = '<i class="fas fa-music"></i> Play Music';
        state.isMusicPlaying = false;
    } else {
        state.backgroundMusic.play().catch(e => {
            console.log("Autoplay prevented. User interaction required.");
            // Fallback: Show message
            alert("Click the music button again to start playback!");
        });
        elements.musicBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Music';
        state.isMusicPlaying = true;
    }
}

// ====================
// VISUAL EFFECTS
// ====================
function createConfetti() {
    const colors = ['#e50914', '#ff6b6b', '#ff8c00', '#ffd700', '#ffffff'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.cssText = `
            position: fixed;
            width: ${Math.random() * 15 + 5}px;
            height: ${Math.random() * 15 + 5}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            top: -20px;
            left: ${Math.random() * 100}vw;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            z-index: 10000;
            pointer-events: none;
        `;
        
        document.body.appendChild(confetti);
        
        // Animation
        confetti.animate([
            { 
                transform: `translateY(0) rotate(0deg)`,
                opacity: 1 
            },
            { 
                transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 720}deg)`,
                opacity: 0 
            }
        ], {
            duration: Math.random() * 3000 + 2000,
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
        }).onfinish = () => confetti.remove();
    }
}

function createHearts() {
    for (let i = 0; i < 15; i++) {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.cssText = `
            position: fixed;
            font-size: ${Math.random() * 25 + 15}px;
            left: ${Math.random() * 100}vw;
            top: 100vh;
            z-index: 1000;
            pointer-events: none;
            opacity: 0.9;
        `;
        
        document.body.appendChild(heart);
        
        // Animation
        heart.animate([
            { 
                transform: 'translateY(0) rotate(0deg) scale(1)',
                opacity: 1 
            },
            { 
                transform: `translateY(-${window.innerHeight + 100}px) rotate(${Math.random() * 360}deg) scale(${Math.random() * 0.5 + 0.5})`,
                opacity: 0 
            }
        ], {
            duration: Math.random() * 2000 + 2000,
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
        }).onfinish = () => heart.remove();
    }
}

// ====================
// SOUND EFFECTS
// ====================
function playSuccessSound() {
    // Create a success sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
}

function playClickSound() {
    // Simple click sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playLoveSound() {
    // Heart/love sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    for (let i = 0; i < 3; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const time = audioContext.currentTime + i * 0.1;
        
        oscillator.frequency.setValueAtTime(600 + i * 50, time);
        oscillator.frequency.exponentialRampToValueAtTime(300 + i * 25, time + 0.2);
        
        gainNode.gain.setValueAtTime(0.1, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        
        oscillator.start(time);
        oscillator.stop(time + 0.3);
    }
}

// ====================
// SECRET FEATURES
// ====================
function showSecretMessage() {
    elements.secretModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeSecretModal() {
    elements.secretModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showKonamiHint() {
    alert("💖 Secret Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A");
}

function handleKonamiCode(e) {
    if (e.key === state.konamiCode[state.konamiIndex]) {
        state.konamiIndex++;
        if (state.konamiIndex === state.konamiCode.length) {
            // Konami code activated!
            activateEasterEgg();
            state.konamiIndex = 0;
        }
    } else {
        state.konamiIndex = 0;
    }
}

function activateEasterEgg() {
    // Change background
    document.body.style.background = "linear-gradient(45deg, #000, #e50914, #000, #e50914, #000)";
    document.body.style.backgroundSize = "400% 400%";
    
    // Animate gradient
    let position = 0;
    const animate = () => {
        position = (position + 1) % 100;
        document.body.style.backgroundPosition = `${position}% 50%`;
        requestAnimationFrame(animate);
    };
    animate();
    
    // Create massive hearts
    for (let i = 0; i < 50; i++) {
        setTimeout(() => createHearts(), i * 100);
    }
    
    // Play special sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200 + i * 100, audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
        }, i * 150);
    }
    
    // Show message
    setTimeout(() => {
        alert("🎉 You found the secret love code! 💖\n\nFor my Gul: This is just one of the many surprises I have for you!");
    }, 1000);
    
    // Reset after 10 seconds
    setTimeout(() => {
        document.body.style.background = "#000";
        document.body.style.backgroundSize = "auto";
    }, 10000);
}

// ====================
// VIDEO PLAYER
// ====================
function playTrailer() {
    const video = document.querySelector('video');
    const overlay = document.querySelector('.video-overlay');
    
    if (video.paused) {
        video.play();
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
    }
}

// Listen for video end to show overlay again
document.querySelector('video').addEventListener('ended', () => {
    document.querySelector('.video-overlay').style.opacity = '1';
    document.querySelector('.video-overlay').style.pointerEvents = 'auto';
});

// ====================
// PAGE LOAD
// ====================
window.addEventListener('DOMContentLoaded', () => {
    // Check if already unlocked
    if (state.unlocked) {
        elements.lockScreen.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.body.classList.add('unlocked');
        initializeMainContent();
    } else {
        // Focus password input
        elements.passwordInput.focus();
        
        // Enter key to submit password
        elements.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                unlock();
            }
        });
    }
    
    // Add fade-in animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
});

// ====================
// UTILITY FUNCTIONS
// ====================
function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ====================
// MOBILE TOUCH SUPPORT
// ====================
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', e => {
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', e => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeDistance = touchEndY - touchStartY;
    
    // Swipe up to scroll to story
    if (swipeDistance < -50 && window.scrollY < 100) {
        scrollToStory();
    }
}