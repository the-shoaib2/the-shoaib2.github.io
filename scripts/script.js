/* ==========================================================================
   Theme Initialization (Immediate)
   ========================================================================== */
(function () {
    const savedTheme = document.cookie.split('; ').find(row => row.startsWith('theme='))?.split('=')[1] || 'light';
    if (savedTheme === 'dark') document.documentElement.classList.add('dark');
})();

/* ==========================================================================
   Core Initialization
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Identify current page
    const isIndexPage = document.getElementById('loader') !== null;
    const isPolicyPage = document.querySelector('.policy-container') !== null;

    if (isIndexPage) {
        initIndexPage();
    } else if (isPolicyPage) {
        initPolicyPage();
    }
});

/* ==========================================================================
   Index Page Logic
   ========================================================================== */
function initIndexPage() {
    const loader = document.getElementById('loader');

    // Load all data from data.json
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            populateSite(data.site, data.profile);
            populateHero(data.profile);
            populateAbout(data.about);
            populateExperience(data.experience);
            populateSkills(data.skills);
            populateServices(data.services);
            populateTestimonials(data.testimonials);
            populateProjects(data.projects);
            populateContact(data.contact);
        })

        .catch(error => {
            console.error('Error loading data:', error);
            if (loader) loader.innerHTML = '<p style="color:var(--black); text-align:center; padding-top: 20px;">Error loading content. Please check your data.json file.</p>';
        })
        .finally(() => {
            // Hide sections before loader fades out to prevent blink
            hideSections();

            setTimeout(() => {
                if (loader) loader.style.opacity = '0';
                setTimeout(() => {
                    if (loader) loader.style.display = 'none';
                    document.body.classList.remove('loading');
                    initScrollSpy();
                    initRevealAnimations();

                    // Start Section Animations after loader is gone
                    initSectionObserver();
                }, 300); // Wait for transition
            }, 200);
        });

    // Set up UI Interactivity
    initMobileMenu();
    initRippleEffect();
    initHeaderScroll();
    initImageModal();
    initContactForm();
    initCustomScrollbar();
    initThemeToggle();
    initParticlesSystem();
}

/* ==========================================================================
   Policy Page Logic (Privacy & Terms)
   ========================================================================== */
function initPolicyPage() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const site = data.site;

            // Determine which policy to load based on URL or title
            const isPrivacy = window.location.pathname.includes('privacy') || document.title.toLowerCase().includes('privacy');
            const policyKey = isPrivacy ? 'privacy' : 'terms';
            const policy = site.policies[policyKey];

            if (policy) {
                // Update Metadata
                document.title = policy.title;
                const policyTitleEl = document.getElementById('policy-title');
                const lastUpdatedEl = document.getElementById('last-updated');

                if (policyTitleEl) policyTitleEl.textContent = policy.heading;
                if (lastUpdatedEl) lastUpdatedEl.textContent = `Last updated: ${policy.lastUpdated}`;
            }

            // Update Logo
            const logo = document.getElementById('site-logo');
            if (logo) {
                logo.innerHTML = `${site.logo.text}<span>${site.logo.span.replace(/\.$/, '<span class="logo-dot">.</span>')}</span>`;
            }
        });

    initHeaderScroll(); // Re-use common header scroll logic if compatible, or use simple one
    initThemeForPolicy(); // Policy pages just need to respect theme, maybe not toggle it if no button
}

/* ==========================================================================
   Common Functions & Utilities
   ========================================================================== */

function initCustomScrollbar() {
    const thumb = document.getElementById('scrollbar-thumb');
    const track = document.getElementById('scrollbar-track');
    if (!thumb || !track) return;

    function updateScrollbar() {
        const docHeight = document.documentElement.scrollHeight;
        const winHeight = window.innerHeight;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        if (docHeight <= winHeight) {
            thumb.style.height = '0px';
            return;
        }

        const scrollPercent = scrollTop / (docHeight - winHeight);
        const thumbHeight = Math.max(20, (winHeight / docHeight) * winHeight);
        const maxTop = winHeight - thumbHeight;
        const thumbTop = scrollPercent * maxTop;

        thumb.style.height = `${thumbHeight}px`;
        thumb.style.transform = `translateY(${thumbTop}px)`;
    }

    window.addEventListener('scroll', updateScrollbar);
    window.addEventListener('resize', updateScrollbar);
    const observer = new MutationObserver(updateScrollbar);
    observer.observe(document.body, { childList: true, subtree: true });

    updateScrollbar();
}

function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navbar = document.querySelector('.navbar');

    if (mobileToggle && navbar) {
        mobileToggle.addEventListener('click', () => {
            navbar.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-xmark');
        });

        document.querySelectorAll('.navbar a').forEach(link => {
            link.addEventListener('click', () => {
                navbar.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-xmark');
            });
        });
    }
}

function initRippleEffect() {
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('ripple')) {
            const btn = e.target;
            const x = e.clientX - btn.offsetLeft;
            const y = e.clientY - btn.offsetTop;
            const ripples = document.createElement('span');
            ripples.classList.add('ripple-span');
            ripples.style.left = x + 'px';
            ripples.style.top = y + 'px';
            btn.appendChild(ripples);
            setTimeout(() => ripples.remove(), 1000);
        }
    });
}

function initHeaderScroll() {
    const header = document.querySelector('.header');
    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    let isNavigating = false;
    let navTimeout;

    const handleScroll = () => {
        if (isNavigating) return;

        const currentScroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        if (!header) return;

        if (currentScroll > lastScrollY && currentScroll > 100) {
            header.classList.add('hidden');
        } else if (currentScroll < lastScrollY) {
            header.classList.remove('hidden');
        }

        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
            header.classList.remove('hidden');
        }
        lastScrollY = currentScroll;
    };

    // For index page navigation links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('.navbar a');
        if (link && link.getAttribute('href').startsWith('#')) {
            isNavigating = true;
            header.classList.remove('hidden');
            clearTimeout(navTimeout);
            navTimeout = setTimeout(() => {
                isNavigating = false;
                lastScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
            }, 1000);
        }
    });

    window.addEventListener('scroll', handleScroll, true);
}

function initImageModal() {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const profileContainer = document.querySelector('.profile-img-container');

    if (profileContainer && modal && modalImg) {
        profileContainer.addEventListener('click', () => {
            const heroImg = document.getElementById('hero-img');
            if (heroImg && heroImg.src) {
                modalImg.src = heroImg.src;
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });

        modal.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
}

/* ==========================================================================
   Data Population Functions (Index)
   ========================================================================== */

function populateSite(site, profile, images) {
    const siteTitle = document.getElementById('site-title');
    if (siteTitle) siteTitle.textContent = site.title;

    const logo = document.getElementById('site-logo');
    const bigLogo = document.getElementById('footer-big-logo');
    const logoText = site.logo.text;
    let charIndex = 0;
    const coloredText = logoText.split('').map(char => {
        if (char.trim() === '') return char;
        charIndex++;
        return `<span class="logo-char-${charIndex}">${char}</span>`;
    }).join('');

    const faviconSrc = site.favicon || 'public/images/favicon.ico';
    const logoHTML = `<img src="${faviconSrc}" alt="Icon" class="logo-icon"> <div>${coloredText}<span>${site.logo.span.replace(/\.$/, '<span class="logo-dot">.</span>')}</span></div>`;

    if (logo) logo.innerHTML = logoHTML;
    if (bigLogo) bigLogo.innerHTML = coloredText + `<span>${site.logo.span.replace(/\.$/, '<span class="logo-dot">.</span>')}</span>`;

    const nav = document.getElementById('site-nav');
    if (nav) {
        site.nav.forEach((item, index) => {
            const a = document.createElement('a');
            a.href = item.link;
            a.textContent = item.label;
            if (index === 0) a.classList.add('active');
            nav.appendChild(a);
        });
    }

    Object.keys(site.sections).forEach(key => {
        const section = site.sections[key];
        const subtitle = document.getElementById(`${key}-subtitle`);
        const title = document.getElementById(`${key}-title`);
        if (subtitle) subtitle.textContent = section.subtitle;
        if (title) title.textContent = section.title;
    });

    const footerText = document.getElementById('footer-text');
    if (footerText) footerText.innerHTML = site.footer;

    const footerSocial = document.getElementById('footer-social');
    if (footerSocial && profile && profile.social) {
        profile.social.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.innerHTML = `<i class="${link.icon}"></i>`;
            footerSocial.appendChild(a);
        });
    }
}

function populateHero(profile, images) {
    const heroName = document.getElementById('hero-name');
    const heroDesc = document.getElementById('hero-desc');
    if (heroName) heroName.textContent = profile.name;
    if (heroDesc) heroDesc.textContent = profile.description;

    const heroImg = document.getElementById('hero-img');
    if (heroImg) {
        if (profile.profileImage) {
            heroImg.src = profile.profileImage;
            heroImg.alt = profile.name;
        } else {
            heroImg.parentElement.style.display = 'none';
        }
    }

    const socialContainer = document.getElementById('hero-social');
    if (socialContainer) {
        profile.social.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.innerHTML = `<i class="${link.icon}"></i>`;
            socialContainer.appendChild(a);
        });
    }
}

function populateAbout(about) {
    const textContainer = document.getElementById('about-text');
    if (textContainer) {
        about.text.forEach(p => {
            const para = document.createElement('p');
            para.textContent = p;
            textContainer.appendChild(para);
        });
    }

    const statsContainer = document.getElementById('about-stats');
    if (statsContainer) {
        about.stats.forEach(stat => {
            const div = document.createElement('div');
            div.className = 'stat-item';
            div.innerHTML = `<h3>${stat.value}</h3><p>${stat.label}</p>`;
            statsContainer.appendChild(div);
        });
    }
}

function populateSkills(skills) {
    const container = document.getElementById('skills-container');
    if (!container) return;

    const categories = {
        programming_languages: "Programming Languages",
        frontend: "Frontend Development",
        backend_and_apis: "Backend & APIs",
        mobile_development: "Mobile Development",
        ai_machine_learning: "AI & Machine Learning",
        databases: "Databases",
        devops_and_tools: "DevOps & Cloud",
        tools_and_ides: "IDEs & Tools",
        design_and_media: "Design & Media"
    };

    Object.keys(skills).forEach((key, index) => {
        const category = document.createElement('div');
        category.className = 'skill-category reveal';
        category.style.transitionDelay = `${index * 100}ms`;

        const title = categories[key] || key.replace(/_/g, ' ');
        let skillTags = skills[key].map(skill => `<span class="skill-tag">${skill}</span>`).join('');

        category.innerHTML = `
            <h3>${title}</h3>
            <div class="skill-list">${skillTags}</div>
        `;
        container.appendChild(category);
    });
}

function populateProjects(projects) {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;

    projects.forEach((project, index) => {
        const card = document.createElement('div');
        card.className = 'project-card reveal';
        card.style.transitionDelay = `${index * 150}ms`;

        const techTags = project.tech_stack.map(tech => `<span class="tech-tag">${tech}</span>`).join('');

        // Dynamic Screenshot Logic: Direct Thum.io Link
        let projectImg = project.image;
        if (!projectImg && (project.live_preview || project.repository)) {
            const previewUrl = project.live_preview || project.repository;
            projectImg = `https://image.thum.io/get/width/1200/crop/800/maxAge/12/delay/3/${previewUrl}`;
        }

        card.innerHTML = `
            <div class="project-img loading">
                <img src="${projectImg || ''}" alt="${project.name}" class="project-card-img" 
                     onload="this.classList.add('loaded'); this.parentElement.classList.remove('loading');"
                     onerror="this.style.display='none'; this.parentElement.classList.remove('loading'); this.parentElement.classList.add('no-image');">
                <div class="img-fallback"></div>
            </div>
            <div class="project-content">
                <h3>${project.name}</h3>
                <p>${project.description}</p>
                <div class="tech-stack">${techTags}</div>
                <div class="project-links">
                    <a href="${project.repository}" target="_blank" class="project-link">
                        <i class="fa-brands fa-github"></i> Source
                    </a>
                    ${project.live_preview ? `
                    <a href="${project.live_preview}" target="_blank" class="project-link demo-link">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Live Preview Link
                    </a>` : ''}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Global Image Error Handler for Screenshot Fallback
window.handleImageError = function (img, fallbackSrc) {
    if (img.getAttribute('data-tried-fallback') === 'true') {
        // Fallback also failed -> Hide image completely
        img.style.display = 'none';
        img.parentElement.classList.remove('loading');
        img.parentElement.classList.add('no-image');
        return;
    }

    // First failure (Local missing) -> Try Thum.io fallback
    img.setAttribute('data-tried-fallback', 'true');
    img.src = fallbackSrc;
};

function populateContact(contact) {
    const infoContainer = document.getElementById('contact-info');
    if (!infoContainer) return;
    const icons = { location: 'fa-location-dot', email: 'fa-envelope', phone: 'fa-phone' };

    Object.keys(contact).forEach(key => {
        const div = document.createElement('div');
        div.className = 'info-item';
        div.innerHTML = `
            <i class="fa-solid ${icons[key]}"></i>
            <div>
                <h4>${key.charAt(0).toUpperCase() + key.slice(1)}</h4>
                <p>${contact[key]}</p>
            </div>
        `;
        infoContainer.appendChild(div);
    });
}

function populateExperience(experience) {
    const container = document.getElementById('experience-timeline');
    if (!container || !experience) return;

    experience.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'timeline-item reveal';
        div.style.transitionDelay = `${index * 150}ms`;
        div.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <span class="timeline-date">${item.duration}</span>
                <h3>${item.role}</h3>
                <h4>${item.company}</h4>
                <p>${item.description}</p>
            </div>
        `;
        container.appendChild(div);
    });
}

function populateServices(services) {
    const container = document.getElementById('services-grid');
    if (!container || !services) return;

    services.forEach((service, index) => {
        const div = document.createElement('div');
        div.className = 'service-card reveal';
        div.style.transitionDelay = `${index * 100}ms`;
        div.innerHTML = `
            <div class="service-icon"><i class="${service.icon}"></i></div>
            <h3>${service.title}</h3>
            <p>${service.description}</p>
        `;
        container.appendChild(div);
    });
}

function populateTestimonials(testimonials) {
    const row1 = document.getElementById('testimonials-row-1');
    const row2 = document.getElementById('testimonials-row-2');
    if (!row1 || !row2 || !testimonials) return;

    // Split testimonials into two groups
    const middleIndex = Math.ceil(testimonials.length / 2);
    const group1 = testimonials.slice(0, middleIndex);
    const group2 = testimonials.slice(middleIndex);

    const createCard = (testimonial) => `
        <div class="testimonial-card">
            <div class="testimonial-content">
                <i class="fa-solid fa-quote-left"></i>
                <p>"${testimonial.feedback}"</p>
            </div>
            <div class="testimonial-author">
                <img src="${testimonial.avatar}" alt="${testimonial.name}" class="author-img">
                <div class="author-info">
                    <h4>${testimonial.name}</h4>
                    <p>${testimonial.role}</p>
                </div>
            </div>
        </div>
    `;

    // Populate rows with clones for seamless scroll
    const fillRow = (row, items) => {
        // Triple items to ensure content is wider than screen
        const content = [...items, ...items, ...items].map(createCard).join('');
        row.innerHTML = content;
    };

    fillRow(row1, group1);
    fillRow(row2, group2);

    // Initialize Scroll-Linked Animation
    initTestimonialScroll();
}

function initTestimonialScroll() {
    const row1 = document.getElementById('testimonials-row-1');
    const row2 = document.getElementById('testimonials-row-2');
    const section = document.getElementById('testimonials');

    if (!row1 || !row2 || !section) return;

    window.addEventListener('scroll', () => {
        const rect = section.getBoundingClientRect();
        const viewHeight = window.innerHeight;

        // Check if section is visible in viewport
        if (rect.top < viewHeight && rect.bottom > 0) {
            // Calculate scroll progress within and around the section
            const scrolled = (viewHeight - rect.top) / (viewHeight + rect.height);

            // Apply parallax effect (different directions for rows)
            const speed = 300; // Increased for more distinct movement
            const offset1 = (scrolled - 0.5) * speed;
            const offset2 = (0.5 - scrolled) * speed;

            row1.style.transform = `translateX(${offset1}px)`;
            row2.style.transform = `translateX(${offset2}px)`;
        }
    });
}

/* ==========================================================================
   Scroll & Animations
   ========================================================================== */

function initScrollSpy() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".navbar a");
    if (!sections.length || !navLinks.length) return;

    const options = { root: null, rootMargin: '-20% 0px -70% 0px', threshold: 0 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                navLinks.forEach((link) => {
                    link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
                });
            }
        });
    }, options);

    sections.forEach((section) => observer.observe(section));

    window.addEventListener('scroll', () => {
        if (window.scrollY < 100) {
            navLinks.forEach(l => l.classList.remove('active'));
            if (navLinks[0]) navLinks[0].classList.add('active');
        }
    });
}

function initRevealAnimations() {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function hideSections() {
    // Initialize all sections as hidden immediately
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('section-hidden');
    });
}

function initSectionObserver() {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('section-hidden');
                entry.target.classList.add('section-visible');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px'
    });

    document.querySelectorAll('section').forEach(section => {
        sectionObserver.observe(section);
    });
}

/* ==========================================================================
   Particles System
   ========================================================================== */

function initParticlesSystem() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 200;

    function getParticleColors() {
        // Google Brand Colors: Blue, Red, Yellow, Green
        return [
            'rgba(66, 133, 244, 0.6)', // Blue
            'rgba(234, 67, 53, 0.6)',  // Red
            'rgba(251, 188, 5, 0.6)',  // Yellow
            'rgba(52, 168, 83, 0.6)'   // Green
        ];
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }

    class Particle {
        constructor() { this.init(); }
        init() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.8 + 0.2;
            const colors = getParticleColors();
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.maxSpeed = Math.random() * 0.6 + 0.2;
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            if (this.x > canvas.width) this.x = 0; else if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0; else if (this.y < 0) this.y = canvas.height;
            if (Math.random() < 0.02) {
                this.vx += (Math.random() - 0.5) * 0.1;
                this.vy += (Math.random() - 0.5) * 0.1;
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > this.maxSpeed) { this.vx = (this.vx / speed) * this.maxSpeed; this.vy = (this.vy / speed) * this.maxSpeed; }
            }
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animateParticles);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animateParticles();

    // Attach to window so theme toggle can re-init
    window.initParticles = initParticles;
}

/* ==========================================================================
   Contact Form (EmailJS)
   ========================================================================== */

function initContactForm() {
    if (typeof emailjs === 'undefined') return;

    emailjs.init("0angy-FFhuMJiDUal");

    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const statusMsg = document.getElementById('contact-status');
    const honeyPot = document.getElementById('honey-pot');

    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();

            if (honeyPot && honeyPot.value !== "") return;

            statusMsg.className = 'contact-status';
            statusMsg.textContent = '';

            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Sending...</span>';

            const templateParams = {
                from_name: document.getElementById('contact-name').value,
                from_email: document.getElementById('contact-email').value,
                subject: document.getElementById('contact-subject').value,
                message: document.getElementById('contact-message').value
            };

            emailjs.send('service_rtmlnoj', 'template_o7kynn5', templateParams)
                .then(() => {
                    statusMsg.classList.add('success');
                    statusMsg.textContent = 'Message sent successfully! I will get back to you soon.';
                    contactForm.reset();
                }, (error) => {
                    console.error('EmailJS Error:', error);
                    statusMsg.classList.add('error');
                    statusMsg.textContent = 'Failed to send message. Please try again later.';
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnContent;
                });
        });
    }
}

/* ==========================================================================
   Theme Management
   ========================================================================== */

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    updateToggleButton(theme);
    if (typeof window.initParticles === 'function') window.initParticles();
}

function updateToggleButton(theme) {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    const icon = toggle.querySelector('i');
    if (!icon) return;

    if (theme === 'dark') {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
}

function initThemeToggle() {
    const savedTheme = getCookie('theme') || 'light';
    applyTheme(savedTheme);

    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.classList.contains('dark');
            const newTheme = isDark ? 'light' : 'dark';
            applyTheme(newTheme);
            setCookie('theme', newTheme, 30);
        });
    }
}

function initThemeForPolicy() {
    // Just apply the saved theme without adding toggle logic if button doesn't exist
    const savedTheme = getCookie('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}
