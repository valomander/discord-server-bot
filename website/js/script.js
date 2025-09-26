// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });

    // Navbar functionality
    initNavbar();
    
    // Mobile menu
    initMobileMenu();
    
    // Animated counters
    initCounters();
    
    // Particles animation
    initParticles();
    
    // Smooth scrolling
    initSmoothScroll();
    
    // Typing animation
    initTypingAnimation();
});

// Navbar scroll effect
function initNavbar() {
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Mobile menu toggle
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Animated counters
function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    const speed = 200; // Animation speed
    
    const countUp = (counter) => {
        const target = +counter.getAttribute('data-count');
        const current = +counter.innerText;
        const increment = target / speed;
        
        if (current < target) {
            counter.innerText = Math.ceil(current + increment);
            setTimeout(() => countUp(counter), 1);
        } else {
            counter.innerText = target;
        }
    };
    
    // Intersection Observer for counters
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                countUp(entry.target);
                entry.target.classList.add('counted');
            }
        });
    }, { threshold: 0.7 });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// Particles animation
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            background: rgba(88, 101, 242, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: floatParticle ${Math.random() * 20 + 10}s linear infinite;
        `;
        
        particlesContainer.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
                createParticle(); // Create new particle
            }
        }, (Math.random() * 20 + 10) * 1000);
    }
    
    // Add particle animation CSS
    if (!document.getElementById('particle-styles')) {
        const style = document.createElement('style');
        style.id = 'particle-styles';
        style.textContent = `
            @keyframes floatParticle {
                0% {
                    transform: translateY(100vh) translateX(0px) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100px) translateX(${Math.random() * 200 - 100}px) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Smooth scrolling for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const offsetTop = target.offsetTop - 70; // Account for navbar height
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Typing animation for hero section
function initTypingAnimation() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;
    
    const text = heroTitle.innerHTML;
    const gradientText = heroTitle.querySelector('.gradient-text');
    
    if (gradientText) {
        const gradientContent = gradientText.textContent;
        heroTitle.innerHTML = text.replace(gradientContent, '');
        
        // Add typing cursor
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        cursor.textContent = '|';
        cursor.style.cssText = `
            animation: blink 1s infinite;
            color: var(--primary-color);
            margin-left: 2px;
        `;
        
        // Add cursor animation
        if (!document.getElementById('cursor-styles')) {
            const style = document.createElement('style');
            style.id = 'cursor-styles';
            style.textContent = `
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        heroTitle.appendChild(cursor);
        
        // Type the gradient text
        setTimeout(() => {
            typeText(heroTitle, gradientContent, cursor);
        }, 1000);
    }
}

function typeText(container, text, cursor) {
    const gradientSpan = document.createElement('span');
    gradientSpan.className = 'gradient-text';
    
    container.insertBefore(gradientSpan, cursor);
    
    let i = 0;
    const typeInterval = setInterval(() => {
        gradientSpan.textContent = text.slice(0, i);
        i++;
        
        if (i > text.length) {
            clearInterval(typeInterval);
            // Remove cursor after typing is complete
            setTimeout(() => {
                if (cursor.parentNode) {
                    cursor.parentNode.removeChild(cursor);
                }
            }, 2000);
        }
    }, 100);
}

// Add hover effects to feature cards
document.addEventListener('DOMContentLoaded', function() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Command cards hover effect
document.addEventListener('DOMContentLoaded', function() {
    const commandCards = document.querySelectorAll('.command-card');
    
    commandCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const badge = this.querySelector('.command-badge');
            if (badge) {
                badge.style.transform = 'scale(1.1)';
                badge.style.transition = 'transform 0.3s ease';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const badge = this.querySelector('.command-badge');
            if (badge) {
                badge.style.transform = 'scale(1)';
            }
        });
    });
});

// Add ripple effect to buttons
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            // Add ripple animation if not exists
            if (!document.getElementById('ripple-styles')) {
                const style = document.createElement('style');
                style.id = 'ripple-styles';
                style.textContent = `
                    @keyframes ripple {
                        to {
                            transform: scale(4);
                            opacity: 0;
                        }
                    }
                    .btn {
                        position: relative;
                        overflow: hidden;
                    }
                `;
                document.head.appendChild(style);
            }
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });
    });
});

// Parallax scrolling effect
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero-visual');
    
    parallaxElements.forEach(element => {
        const speed = 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Add loading animation
document.addEventListener('DOMContentLoaded', function() {
    // Remove loading class when page is fully loaded
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        
        // Add entrance animations
        const heroContent = document.querySelector('.hero-content');
        const heroVisual = document.querySelector('.hero-visual');
        
        if (heroContent) {
            heroContent.style.animation = 'slideInLeft 0.8s ease-out';
        }
        
        if (heroVisual) {
            heroVisual.style.animation = 'slideInRight 0.8s ease-out';
        }
    });
});

// Copy to clipboard functionality for command codes
document.addEventListener('DOMContentLoaded', function() {
    const commandCodes = document.querySelectorAll('.command-header code');
    
    commandCodes.forEach(code => {
        code.style.cursor = 'pointer';
        code.title = 'Click to copy';
        
        code.addEventListener('click', function() {
            const text = this.textContent;
            navigator.clipboard.writeText(text).then(() => {
                // Show copied feedback
                const originalText = this.textContent;
                this.textContent = 'Copied!';
                this.style.background = 'var(--success-color)';
                this.style.color = 'white';
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = '';
                    this.style.color = '';
                }, 1000);
            });
        });
    });
});

// Intersection Observer for fade-in animations
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
});

// Add CSS for intersection observer animations
document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('intersection-styles')) {
        const style = document.createElement('style');
        style.id = 'intersection-styles';
        style.textContent = `
            section {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.8s ease, transform 0.8s ease;
            }
            
            section.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .hero {
                opacity: 1;
                transform: none;
            }
        `;
        document.head.appendChild(style);
    }
});