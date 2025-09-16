// Visionade Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Header scroll effect
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    document.querySelectorAll('.value-prop, .feature-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Demo functionality
function showChart(chartType) {
    const demoArea = document.getElementById('demoArea');
    const demoButtons = document.querySelectorAll('.demo-btn');

    // Update active button
    demoButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Chart configurations
    const charts = {
        bar: {
            title: 'Sprint Velocity - Bar Chart',
            description: 'Story points completed per sprint',
            visual: '📊'
        },
        pie: {
            title: 'Issue Distribution - Pie Chart',
            description: 'Issues by status across all projects',
            visual: '🥧'
        },
        line: {
            title: 'Burndown Trend - Line Chart',
            description: 'Sprint progress over time',
            visual: '📈'
        },
        column: {
            title: 'Team Performance - Column Chart',
            description: 'Completed issues by team member',
            visual: '📋'
        }
    };

    const chart = charts[chartType];

    // Simulate chart rendering
    demoArea.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div style="font-size: 4rem; margin-bottom: 16px;">${chart.visual}</div>
            <h4 style="margin-bottom: 8px; color: var(--primary-color);">${chart.title}</h4>
            <p style="color: var(--text-medium); margin-bottom: 24px;">${chart.description}</p>
            <div style="background: linear-gradient(45deg, #0052CC20, #00C85320); height: 200px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <p style="color: var(--primary-color); font-weight: 600;">Interactive ${chartType.toUpperCase()} Chart</p>
            </div>
            <p style="margin-top: 16px; font-size: 0.9rem; color: var(--text-light);">
                <em>In the real app, this would be a fully interactive chart with live data</em>
            </p>
        </div>
    `;

    // Track demo interaction
    trackEvent('demo_interaction', {
        chart_type: chartType
    });
}

// Demo video modal
function playDemo() {
    const modal = document.getElementById('demoModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    trackEvent('demo_video_play');
}

function closeDemoModal() {
    const modal = document.getElementById('demoModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal on outside click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('demoModal');
    if (e.target === modal) {
        closeDemoModal();
    }
});

// Escape key to close modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeDemoModal();
    }
});

// Analytics tracking functions
function trackEvent(eventName, parameters = {}) {
    // Google Analytics 4 event tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, parameters);
    }

    // Console log for development
    console.log('Event tracked:', eventName, parameters);
}

// Track CTA clicks
function trackCTAClick(ctaName, destination) {
    trackEvent('cta_click', {
        cta_name: ctaName,
        destination: destination
    });
}

// Add click tracking to CTAs
document.addEventListener('DOMContentLoaded', function() {
    // Track marketplace clicks
    document.querySelectorAll('a[href*="marketplace.atlassian.com"]').forEach(link => {
        link.addEventListener('click', () => {
            trackCTAClick('marketplace_trial', 'atlassian_marketplace');
        });
    });

    // Track navigation clicks
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            trackCTAClick('navigation', link.getAttribute('href'));
        });
    });

    // Track button clicks
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', () => {
            const text = button.textContent.trim();
            trackCTAClick('button_click', text);
        });
    });
});

// Form validation helper (for future forms)
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Lazy loading for images (when added)
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Performance monitoring
function measurePerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;

            trackEvent('page_performance', {
                load_time: Math.round(loadTime),
                dom_content_loaded: Math.round(perfData.domContentLoadedEventEnd - perfData.loadEventStart)
            });
        });
    }
}

// Initialize performance monitoring
measurePerformance();

// Accessibility helpers
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });
}

// Apply focus trap to modal when it opens
function playDemo() {
    const modal = document.getElementById('demoModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Focus the close button for accessibility
    const closeButton = modal.querySelector('button');
    if (closeButton) {
        closeButton.focus();
        trapFocus(modal);
    }

    trackEvent('demo_video_play');
}