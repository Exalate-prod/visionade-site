// Visionade Analytics & SEO Optimization

// Google Analytics 4 Configuration
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

// Initialize GA4 (replace with actual measurement ID)
if (typeof GA_MEASUREMENT_ID !== 'undefined') {
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href
    });
}

// Enhanced Event Tracking
function trackEvent(eventName, parameters = {}) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            ...parameters,
            timestamp: Date.now(),
            page_path: window.location.pathname,
            page_title: document.title
        });
    }

    // Microsoft Clarity (if enabled)
    if (typeof clarity !== 'undefined') {
        clarity('event', eventName, parameters);
    }

    // Console logging for development
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('dev')) {
        console.log('Analytics Event:', eventName, parameters);
    }
}

// Page Performance Tracking
function trackPagePerformance() {
    if ('performance' in window && 'getEntriesByType' in performance) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const paintData = performance.getEntriesByType('paint');

                // Core Web Vitals tracking
                const metrics = {
                    page_load_time: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
                    dom_content_loaded: Math.round(perfData.domContentLoadedEventEnd - perfData.loadEventStart),
                    time_to_first_byte: Math.round(perfData.responseStart - perfData.requestStart)
                };

                // First Paint and First Contentful Paint
                paintData.forEach(paint => {
                    if (paint.name === 'first-paint') {
                        metrics.first_paint = Math.round(paint.startTime);
                    }
                    if (paint.name === 'first-contentful-paint') {
                        metrics.first_contentful_paint = Math.round(paint.startTime);
                    }
                });

                trackEvent('page_performance', metrics);

                // Track slow pages
                if (metrics.page_load_time > 3000) {
                    trackEvent('slow_page_load', {
                        load_time: metrics.page_load_time,
                        page: window.location.pathname
                    });
                }
            }, 1000);
        });
    }
}

// User Engagement Tracking
function trackUserEngagement() {
    let scrollDepth = 0;
    let timeOnPage = Date.now();
    let isActive = true;

    // Scroll depth tracking
    window.addEventListener('scroll', () => {
        const currentScrollDepth = Math.round(
            (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );

        if (currentScrollDepth > scrollDepth && currentScrollDepth % 25 === 0) {
            scrollDepth = currentScrollDepth;
            trackEvent('scroll_depth', {
                depth: scrollDepth,
                page: window.location.pathname
            });
        }
    });

    // Time on page tracking
    const trackTimeOnPage = () => {
        const timeSpent = Math.round((Date.now() - timeOnPage) / 1000);

        if (timeSpent > 30 && timeSpent % 30 === 0 && isActive) {
            trackEvent('time_on_page', {
                duration: timeSpent,
                page: window.location.pathname
            });
        }
    };

    setInterval(trackTimeOnPage, 30000); // Every 30 seconds

    // Activity tracking
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, () => {
            isActive = true;
        }, { passive: true });
    });

    // Track when user becomes inactive
    setInterval(() => {
        isActive = false;
    }, 30000);

    // Track page exit
    window.addEventListener('beforeunload', () => {
        const finalTimeSpent = Math.round((Date.now() - timeOnPage) / 1000);
        trackEvent('page_exit', {
            duration: finalTimeSpent,
            page: window.location.pathname,
            max_scroll_depth: scrollDepth
        });
    });
}

// CTA Click Tracking
function setupCTATracking() {
    document.addEventListener('DOMContentLoaded', () => {
        // Track marketplace clicks
        document.querySelectorAll('a[href*="marketplace.atlassian.com"]').forEach(link => {
            link.addEventListener('click', () => {
                trackEvent('cta_click', {
                    cta_type: 'marketplace_trial',
                    cta_text: link.textContent.trim(),
                    cta_location: getCTALocation(link)
                });
            });
        });

        // Track email CTAs
        document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
            link.addEventListener('click', () => {
                trackEvent('cta_click', {
                    cta_type: 'email_contact',
                    cta_text: link.textContent.trim(),
                    email_type: getEmailType(link.href)
                });
            });
        });

        // Track demo buttons
        document.querySelectorAll('button, a').forEach(element => {
            const text = element.textContent.toLowerCase();
            if (text.includes('demo') || text.includes('watch')) {
                element.addEventListener('click', () => {
                    trackEvent('cta_click', {
                        cta_type: 'demo_request',
                        cta_text: element.textContent.trim(),
                        cta_location: getCTALocation(element)
                    });
                });
            }
        });

        // Track navigation clicks
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                trackEvent('navigation_click', {
                    nav_item: link.textContent.trim(),
                    destination: link.getAttribute('href')
                });
            });
        });
    });
}

// Helper Functions
function getCTALocation(element) {
    const section = element.closest('section');
    if (section) {
        return section.className || section.id || 'unknown_section';
    }
    return 'unknown';
}

function getEmailType(href) {
    if (href.includes('sales@')) return 'sales';
    if (href.includes('support@')) return 'support';
    if (href.includes('events@')) return 'events';
    return 'general';
}

// Form Tracking
function trackFormInteractions() {
    document.addEventListener('DOMContentLoaded', () => {
        // Track form field interactions
        document.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('focus', () => {
                trackEvent('form_field_focus', {
                    field_name: field.name || field.id || 'unnamed',
                    field_type: field.type || field.tagName.toLowerCase(),
                    form_name: getFormName(field)
                });
            });

            field.addEventListener('blur', () => {
                if (field.value.trim()) {
                    trackEvent('form_field_complete', {
                        field_name: field.name || field.id || 'unnamed',
                        field_type: field.type || field.tagName.toLowerCase(),
                        form_name: getFormName(field)
                    });
                }
            });
        });

        // Track form submissions
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                trackEvent('form_submit', {
                    form_name: form.name || form.id || 'unnamed',
                    form_action: form.action || 'none'
                });
            });
        });
    });
}

function getFormName(field) {
    const form = field.closest('form');
    return form ? (form.name || form.id || 'unnamed') : 'no_form';
}

// Error Tracking
function setupErrorTracking() {
    window.addEventListener('error', (event) => {
        trackEvent('javascript_error', {
            error_message: event.message,
            error_filename: event.filename,
            error_line: event.lineno,
            error_column: event.colno,
            user_agent: navigator.userAgent
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        trackEvent('promise_rejection', {
            error_message: event.reason?.message || 'Unknown promise rejection',
            error_stack: event.reason?.stack || 'No stack trace',
            user_agent: navigator.userAgent
        });
    });
}

// A/B Testing Framework
function initializeABTesting() {
    // Simple A/B testing framework
    const experiments = {
        hero_cta_text: {
            variants: ['Start Free Trial', 'Try Visionade Free', 'Get Started Free'],
            traffic: 0.33 // 33% of traffic sees each variant
        }
    };

    Object.keys(experiments).forEach(experimentName => {
        const experiment = experiments[experimentName];
        const userId = getUserId();
        const variant = getVariant(userId, experimentName, experiment.variants.length);

        trackEvent('ab_test_exposure', {
            experiment: experimentName,
            variant: variant,
            variant_text: experiment.variants[variant]
        });

        // Apply variant (simplified example)
        if (experimentName === 'hero_cta_text') {
            const ctaButton = document.querySelector('.hero .btn-primary');
            if (ctaButton) {
                ctaButton.textContent = experiment.variants[variant];
            }
        }
    });
}

function getUserId() {
    // Simple user ID generation (in production, use a more robust method)
    let userId = localStorage.getItem('visionade_user_id');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visionade_user_id', userId);
    }
    return userId;
}

function getVariant(userId, experimentName, numVariants) {
    // Simple hash-based variant assignment
    const hash = userId + experimentName;
    let hashCode = 0;
    for (let i = 0; i < hash.length; i++) {
        hashCode = ((hashCode << 5) - hashCode) + hash.charCodeAt(i);
        hashCode = hashCode & hashCode; // Convert to 32bit integer
    }
    return Math.abs(hashCode) % numVariants;
}

// Privacy and GDPR Compliance
function initializePrivacyCompliance() {
    const privacySettings = {
        analytics: localStorage.getItem('visionade_analytics_consent') === 'true',
        marketing: localStorage.getItem('visionade_marketing_consent') === 'true'
    };

    // Show consent banner if needed
    if (privacySettings.analytics === null) {
        showConsentBanner();
    }

    // Only track if consent given
    if (privacySettings.analytics) {
        trackPagePerformance();
        trackUserEngagement();
        setupCTATracking();
        trackFormInteractions();
    }
}

function showConsentBanner() {
    // Simple consent banner (in production, use a proper consent management platform)
    const banner = document.createElement('div');
    banner.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #172B4D;
        color: white;
        padding: 16px;
        z-index: 10000;
        text-align: center;
    `;
    banner.innerHTML = `
        <p style="margin: 0 0 12px;">We use cookies to improve your experience and analyze site usage.
        <a href="#privacy" style="color: #0052CC;">Learn more</a></p>
        <button onclick="acceptConsent()" style="background: #0052CC; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-right: 8px;">Accept</button>
        <button onclick="declineConsent()" style="background: transparent; color: white; border: 1px solid white; padding: 8px 16px; border-radius: 4px;">Decline</button>
    `;
    document.body.appendChild(banner);
}

function acceptConsent() {
    localStorage.setItem('visionade_analytics_consent', 'true');
    localStorage.setItem('visionade_marketing_consent', 'true');
    document.querySelector('[style*="position: fixed"]').remove();
    initializePrivacyCompliance();
}

function declineConsent() {
    localStorage.setItem('visionade_analytics_consent', 'false');
    localStorage.setItem('visionade_marketing_consent', 'false');
    document.querySelector('[style*="position: fixed"]').remove();
}

// SEO Enhancements
function enhanceSEO() {
    // Add structured data for breadcrumbs if on a sub-page
    if (window.location.pathname !== '/') {
        addBreadcrumbStructuredData();
    }

    // Add FAQ structured data if FAQ section exists
    const faqSection = document.querySelector('.faq-section, #faq');
    if (faqSection) {
        addFAQStructuredData();
    }

    // Enhance meta description based on page content
    updateMetaDescription();
}

function addBreadcrumbStructuredData() {
    const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://visionade.com"
            }
        ]
    };

    const pathParts = window.location.pathname.split('/').filter(part => part);
    if (pathParts.length > 0) {
        const pageName = pathParts[pathParts.length - 1].replace('.html', '').replace('-', ' ');
        breadcrumbData.itemListElement.push({
            "@type": "ListItem",
            "position": 2,
            "name": pageName.charAt(0).toUpperCase() + pageName.slice(1),
            "item": window.location.href
        });
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(breadcrumbData);
    document.head.appendChild(script);
}

function addFAQStructuredData() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length === 0) return;

    const faqData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": []
    };

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question, h4');
        const answer = item.querySelector('p');

        if (question && answer) {
            faqData.mainEntity.push({
                "@type": "Question",
                "name": question.textContent.trim(),
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": answer.textContent.trim()
                }
            });
        }
    });

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(faqData);
    document.head.appendChild(script);
}

function updateMetaDescription() {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
        const description = document.createElement('meta');
        description.name = 'description';
        description.content = getPageDescription();
        document.head.appendChild(description);
    }
}

function getPageDescription() {
    const title = document.title;
    const firstParagraph = document.querySelector('p');

    if (title.includes('Pricing')) {
        return 'Simple, transparent pricing for Visionade. Start with our free 30-day trial - no credit card required.';
    } else if (title.includes('How It Works')) {
        return 'Learn how Visionade transforms your Jira data into insights in 4 simple steps. From installation to sharing dashboards.';
    } else if (title.includes('Benefits')) {
        return 'Calculate your ROI with Visionade. See measurable benefits, customer success stories, and feature comparisons.';
    } else if (firstParagraph) {
        return firstParagraph.textContent.substring(0, 155) + '...';
    }

    return 'Transform your Jira data into actionable insights with Visionade. No code, no SQL, just drag-and-drop simplicity.';
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    setupErrorTracking();
    initializePrivacyCompliance();
    initializeABTesting();
    enhanceSEO();
});

// Export functions for global access
window.trackEvent = trackEvent;
window.acceptConsent = acceptConsent;
window.declineConsent = declineConsent;