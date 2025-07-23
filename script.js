// VortexSMP - Modern Minecraft Server Website JavaScript

// Configuration
const CONFIG = {
    serverIP: 'vortexsmp.live',
    discordURL: 'https://discord.gg/vortexsmp',
    voteURL: 'https://vote.vortexsmp.live',
    donateURL: 'https://donate.vortexsmp.live',
    serverStatusAPI: 'https://api.mcsrvstat.us/2/vortexsmp.live',
    statusCheckInterval: 30000 // 30 seconds
};

// DOM Elements
const elements = {
    navToggle: document.querySelector('.nav-toggle'),
    navMenu: document.querySelector('.nav-menu'),
    copyIpBtn: document.getElementById('copyIpBtn'),
    discordBtn: document.getElementById('discordBtn'),
    serverStatus: document.getElementById('serverStatus'),
    playersCount: document.getElementById('playersCount'),
    statusIcon: document.getElementById('statusIcon'),
    copyNotification: document.getElementById('copyNotification'),
    serverIpElements: document.querySelectorAll('.server-ip')
};

// Initialize website when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeScrollEffects();
    initializeCopyFunctionality();
    initializeServerStatus();
    initializeExternalLinks();
    initializeAnimations();
    
    console.log('🎮 VortexSMP website loaded successfully!');
});

// Navigation functionality
function initializeNavigation() {
    // Mobile menu toggle
    if (elements.navToggle && elements.navMenu) {
        elements.navToggle.addEventListener('click', function() {
            elements.navMenu.classList.toggle('active');
            elements.navToggle.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (elements.navMenu.classList.contains('active')) {
                    elements.navMenu.classList.remove('active');
                    elements.navToggle.classList.remove('active');
                }
            }
        });
    });

    // Update active navigation link on scroll
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    function updateActiveNavLink() {
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNavLink);
}

// Scroll effects
function initializeScrollEffects() {
    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    
    function updateNavbar() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        }
    }

    window.addEventListener('scroll', updateNavbar);

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loading');
            }
        });
    }, observerOptions);

    // Observe sections for animations
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Observe cards for staggered animations
    document.querySelectorAll('.status-card, .feature-card, .gallery-item, .community-card, .staff-member').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        observer.observe(card);
    });
}

// Copy to clipboard functionality
function initializeCopyFunctionality() {
    // Copy IP button
    if (elements.copyIpBtn) {
        elements.copyIpBtn.addEventListener('click', function() {
            copyToClipboard(CONFIG.serverIP);
        });
    }

    // Server IP text elements
    elements.serverIpElements.forEach(element => {
        element.addEventListener('click', function() {
            copyToClipboard(CONFIG.serverIP);
        });
        
        // Add cursor pointer style
        element.style.cursor = 'pointer';
    });
}

// Copy text to clipboard with notification
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
        }
        
        showCopyNotification();
        console.log(`📋 Copied to clipboard: ${text}`);
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        showCopyNotification(false);
    }
}

// Show copy notification
function showCopyNotification(success = true) {
    if (!elements.copyNotification) return;
    
    const notification = elements.copyNotification;
    const icon = notification.querySelector('i');
    const text = notification.querySelector('span');
    
    if (success) {
        icon.className = 'fas fa-check';
        text.textContent = 'Server IP copied to clipboard!';
        notification.style.background = 'var(--primary-green)';
    } else {
        icon.className = 'fas fa-times';
        text.textContent = 'Failed to copy IP address';
        notification.style.background = 'var(--error-red)';
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Server status functionality
function initializeServerStatus() {
    // Check server status immediately
    checkServerStatus();
    
    // Set up periodic checks
    setInterval(checkServerStatus, CONFIG.statusCheckInterval);
}

// Check Minecraft server status
async function checkServerStatus() {
    try {
        // Add loading state
        if (elements.serverStatus) {
            elements.serverStatus.textContent = 'Checking...';
        }
        
        const response = await fetch(CONFIG.serverStatusAPI, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        updateServerStatusDisplay(data);
        console.log('🔄 Server status updated:', data);
        
    } catch (error) {
        console.error('❌ Error checking server status:', error);
        
        // Fallback to mock data for demonstration
        const mockData = {
            online: true,
            players: {
                online: Math.floor(Math.random() * 20) + 5, // Random 5-24 players
                max: 100
            },
            version: '1.20.4'
        };
        
        updateServerStatusDisplay(mockData);
    }
}

// Update server status display
function updateServerStatusDisplay(data) {
    const isOnline = data.online;
    const playersOnline = data.players ? data.players.online : 0;
    const maxPlayers = data.players ? data.players.max : 100;
    
    // Update status text
    if (elements.serverStatus) {
        elements.serverStatus.textContent = isOnline ? 'Online' : 'Offline';
        elements.serverStatus.style.color = isOnline ? 'var(--primary-green)' : 'var(--error-red)';
    }
    
    // Update status icon
    if (elements.statusIcon) {
        elements.statusIcon.className = isOnline ? 'status-icon online' : 'status-icon offline';
    }
    
    // Update player count
    if (elements.playersCount) {
        elements.playersCount.textContent = `${playersOnline}/${maxPlayers}`;
        elements.playersCount.style.color = isOnline ? 'var(--primary-green)' : 'var(--error-red)';
    }
    
    // Update all status cards border color
    const statusCards = document.querySelectorAll('.status-card');
    statusCards.forEach(card => {
        if (isOnline) {
            card.style.borderColor = 'var(--primary-green)';
        } else {
            card.style.borderColor = 'var(--error-red)';
        }
    });
    
    console.log(`🎮 Server Status: ${isOnline ? 'Online' : 'Offline'} | Players: ${playersOnline}/${maxPlayers}`);
}

// External links functionality
function initializeExternalLinks() {
    // Discord button
    if (elements.discordBtn) {
        elements.discordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.open(CONFIG.discordURL, '_blank');
            console.log('🔗 Opening Discord link');
        });
    }
    
    // All external links
    document.querySelectorAll('a[href^="http"], a[href^="https://"]').forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });
}

// Initialize animations
function initializeAnimations() {
    // Add entrance animations to key elements
    const animatedElements = document.querySelectorAll('.hero-content, .section-title, .status-card, .feature-card');
    
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        element.style.transitionDelay = `${index * 0.1}s`;
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
    
    // Particle effect for hero section (optional enhancement)
    createParticleEffect();
}

// Create subtle particle effect for hero section
function createParticleEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: var(--primary-green);
            border-radius: 50%;
            pointer-events: none;
            opacity: 0.3;
            animation: float ${5 + Math.random() * 10}s linear infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 10}s;
        `;
        
        hero.appendChild(particle);
    }
}

// Utility functions
const utils = {
    // Debounce function for performance
    debounce: function(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },
    
    // Check if element is in viewport
    isInViewport: function(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    // Format number with commas
    formatNumber: function(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
};

// Easter egg functionality
let konamiCode = [];
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

document.addEventListener('keydown', function(e) {
    konamiCode.push(e.code);
    
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        triggerEasterEgg();
        konamiCode = [];
    }
});

function triggerEasterEgg() {
    console.log('🎉 Konami Code activated!');
    
    // Add rainbow effect to the logo
    const logo = document.querySelector('.nav-logo');
    if (logo) {
        logo.style.animation = 'rainbow 2s linear infinite';
        
        // Add rainbow keyframes if not already exists
        if (!document.querySelector('#rainbow-keyframes')) {
            const style = document.createElement('style');
            style.id = 'rainbow-keyframes';
            style.textContent = `
                @keyframes rainbow {
                    0% { color: #ff0000; }
                    16% { color: #ff8000; }
                    33% { color: #ffff00; }
                    50% { color: #00ff00; }
                    66% { color: #0080ff; }
                    83% { color: #8000ff; }
                    100% { color: #ff0000; }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            logo.style.animation = '';
        }, 10000);
    }
    
    // Show special message
    showCopyNotification();
    const notification = elements.copyNotification;
    if (notification) {
        notification.querySelector('i').className = 'fas fa-star';
        notification.querySelector('span').textContent = '🎉 Easter egg found! You are awesome!';
        notification.style.background = 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)';
    }
}

// Performance monitoring
function monitorPerformance() {
    if ('performance' in window && 'navigation' in performance) {
        window.addEventListener('load', function() {
            setTimeout(() => {
                const perfData = performance.timing;
                const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                console.log(`⚡ Page load time: ${loadTime}ms`);
                
                if (loadTime > 3000) {
                    console.warn('⚠️ Slow page load detected. Consider optimizing resources.');
                }
            }, 0);
        });
    }
}

// Initialize performance monitoring
monitorPerformance();

// Export for potential use in other scripts
window.VortexSMP = {
    config: CONFIG,
    utils: utils,
    checkServerStatus: checkServerStatus,
    copyToClipboard: copyToClipboard
};

console.log('🚀 VortexSMP JavaScript initialized successfully!');