/**
 * Aathr Consulting — Core Application Logic & Interactivity
 * Features: Bilingual Engine (AR/EN), Dark/Light Theming, Service Filtering,
 * Consultation WhatsApp/Email Dispatcher, Scroll Spy, Stat Counters, FAQ Accordions
 */

document.addEventListener('DOMContentLoaded', () => {
    const htmlEl = document.documentElement;
    const body = document.body;

    // ─────────────────────────────────────────────────────────────
    // 1. BILINGUAL ENGINE (ARABIC / ENGLISH)
    // ─────────────────────────────────────────────────────────────
    const langToggleBtn = document.getElementById('langToggle');
    const langText = document.getElementById('langText');
    const savedLang = localStorage.getItem('aathr_lang') || 'ar';

    function setLanguage(lang) {
        if (lang === 'en') {
            htmlEl.setAttribute('lang', 'en');
            htmlEl.setAttribute('dir', 'ltr');
            body.classList.add('lang-en');
            if (langText) langText.textContent = 'العربية';
        } else {
            htmlEl.setAttribute('lang', 'ar');
            htmlEl.setAttribute('dir', 'rtl');
            body.classList.remove('lang-en');
            if (langText) langText.textContent = 'English';
        }

        // Toggle data-lang elements
        document.querySelectorAll('[data-lang]').forEach(el => {
            const isTargetLang = el.getAttribute('data-lang') === lang;
            if (el.tagName === 'SPAN' || el.tagName === 'A' || el.tagName === 'STRONG') {
                el.style.display = isTargetLang ? 'inline-flex' : 'none';
                if (isTargetLang && el.tagName === 'SPAN' && !el.classList.contains('badge-pill')) {
                    el.style.display = 'inline-block';
                }
            } else if (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'H4' || el.tagName === 'P' || el.tagName === 'DIV') {
                el.style.display = isTargetLang ? 'block' : 'none';
            } else {
                el.style.display = isTargetLang ? '' : 'none';
            }
        });

        // Update form placeholders
        document.querySelectorAll('[data-placeholder-ar]').forEach(input => {
            const placeholder = lang === 'en' ? input.getAttribute('data-placeholder-en') : input.getAttribute('data-placeholder-ar');
            if (placeholder) input.setAttribute('placeholder', placeholder);
        });

        // Update select option texts
        document.querySelectorAll('option[data-text-ar]').forEach(option => {
            const text = lang === 'en' ? option.getAttribute('data-text-en') : option.getAttribute('data-text-ar');
            if (text) option.textContent = text;
        });

        // Update card action icons
        document.querySelectorAll('.ar-icon').forEach(icon => {
            icon.style.display = lang === 'ar' ? 'inline-block' : 'none';
        });
        document.querySelectorAll('.en-icon').forEach(icon => {
            icon.style.display = lang === 'en' ? 'inline-block' : 'none';
        });

        localStorage.setItem('aathr_lang', lang);
    }

    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            const currentLang = htmlEl.getAttribute('lang') === 'en' ? 'en' : 'ar';
            const nextLang = currentLang === 'ar' ? 'en' : 'ar';
            setLanguage(nextLang);
        });
    }

    // Initialize Language
    setLanguage(savedLang);

    // ─────────────────────────────────────────────────────────────
    // 2. THEME ENGINE (LIGHT / DARK)
    // ─────────────────────────────────────────────────────────────
    const themeToggleBtn = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('aathr_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    function applyTheme(theme) {
        htmlEl.setAttribute('data-theme', theme);
        localStorage.setItem('aathr_theme', theme);
    }

    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDark) {
        applyTheme('dark');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlEl.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 3. STICKY HEADER, SCROLL PROGRESS & ACTIVE NAV LINK
    // ─────────────────────────────────────────────────────────────
    const mainHeader = document.getElementById('mainHeader');
    const backToTopBtn = document.getElementById('backToTopBtn');
    const progressCircle = document.querySelector('.progress-ring-circle');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    const circleRadius = 21;
    const circumference = 2 * Math.PI * circleRadius; // ~131.95

    function handleScroll() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        // Sticky Header effect
        if (mainHeader) {
            if (scrollY > 60) {
                mainHeader.classList.add('scrolled');
            } else {
                mainHeader.classList.remove('scrolled');
            }
        }

        // Back to top button & Progress Ring
        if (backToTopBtn && progressCircle) {
            if (scrollY > 350) {
                backToTopBtn.classList.add('visible');
                const scrollProgress = scrollY / scrollHeight;
                const offset = circumference - (scrollProgress * circumference);
                progressCircle.style.strokeDashoffset = offset;
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }

        // Active Nav Spy
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 140;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            // Page links (services.html, ...) keep their server-rendered active state
            if (!href.startsWith('#')) return;
            if (href === `#${currentSectionId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 4. MOBILE NAVIGATION DRAWER
    // ─────────────────────────────────────────────────────────────
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');

    function toggleMenu(isOpen) {
        const expanded = isOpen !== undefined ? isOpen : !mainNav.classList.contains('active');
        if (mainNav) mainNav.classList.toggle('active', expanded);
        if (mobileOverlay) mobileOverlay.classList.toggle('active', expanded);
        if (mobileMenuBtn) {
            mobileMenuBtn.classList.toggle('active', expanded);
            mobileMenuBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        }
        body.style.overflow = expanded ? 'hidden' : '';
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => toggleMenu());
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', () => toggleMenu(false));
    }

    document.querySelectorAll('.nav-link, .mobile-nav-cta a').forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });

    // ─────────────────────────────────────────────────────────────
    // 5. SERVICES CATEGORY FILTERING
    // ─────────────────────────────────────────────────────────────
    const filterTabs = document.querySelectorAll('.filter-tab');
    // The same tabs filter service cards and, on the Our Work page, projects
    const serviceCards = document.querySelectorAll('.service-deluxe-card, .work-item[data-category]');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-pressed', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-pressed', 'true');

            const filterValue = tab.getAttribute('data-filter');

            serviceCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 250);
                }
            });
        });
    });

    // Impact (athar) switch: show the project before Aathr, then flip to "with Aathr"
    const impactSection = document.querySelector('.impact-section');
    if (impactSection) {
        const impactBtns = impactSection.querySelectorAll('[data-impact-state]');
        let impactTouched = false;

        function setImpactState(state) {
            impactSection.setAttribute('data-state', state);
            impactBtns.forEach(btn => {
                btn.setAttribute('aria-pressed', btn.getAttribute('data-impact-state') === state ? 'true' : 'false');
            });
        }

        impactBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                impactTouched = true;
                setImpactState(btn.getAttribute('data-impact-state'));
            });
        });

        // The markup defaults to "after" so the page reads well without JS
        if ('IntersectionObserver' in window) {
            setImpactState('before');
            const impactObserver = new IntersectionObserver(entries => {
                if (!entries[0].isIntersecting) return;
                impactObserver.disconnect();
                setTimeout(() => {
                    if (!impactTouched) setImpactState('after');
                }, 1400);
            }, { threshold: 0.45 });
            impactObserver.observe(impactSection.querySelector('.impact-rows'));
        }
    }

    // Preselect the service when arriving from a service card (contact.html?service=erp)
    const requestedService = new URLSearchParams(window.location.search).get('service');
    const serviceSelectEl = document.getElementById('serviceInterest');
    if (requestedService && serviceSelectEl && serviceSelectEl.querySelector(`option[value="${CSS.escape(requestedService)}"]`)) {
        serviceSelectEl.value = requestedService;
    }

    // Service Card Quick Trigger to Consultation Form
    document.querySelectorAll('[data-service-select]').forEach(link => {
        link.addEventListener('click', (e) => {
            const serviceKey = link.getAttribute('data-service-select');
            const selectEl = document.getElementById('serviceInterest');
            if (selectEl && serviceKey) {
                selectEl.value = serviceKey;
            }
        });
    });

    // ─────────────────────────────────────────────────────────────
    // 6. EXECUTIVE CONSULTATION FORM DISPATCHER
    // ─────────────────────────────────────────────────────────────
    const consultationForm = document.getElementById('consultationForm');
    const submitWhatsappBtn = document.getElementById('submitWhatsappBtn');
    const formStatusAlert = document.getElementById('formStatusAlert');

    // "Not sure" service → point to the Explore journey
    const serviceInterestSelect = document.getElementById('serviceInterest');
    const exploreFormHint = document.getElementById('exploreFormHint');
    if (serviceInterestSelect && exploreFormHint) {
        const syncExploreHint = () => { exploreFormHint.hidden = serviceInterestSelect.value !== 'all'; };
        serviceInterestSelect.addEventListener('change', syncExploreHint);
        syncExploreHint();
    }

    function getFormValues() {
        const name = document.getElementById('clientName')?.value.trim() || '';
        const company = document.getElementById('clientCompany')?.value.trim() || '';
        const email = document.getElementById('clientEmail')?.value.trim() || '';
        const phone = document.getElementById('clientPhone')?.value.trim() || '';
        const serviceSelect = document.getElementById('serviceInterest');
        const serviceName = serviceSelect ? serviceSelect.options[serviceSelect.selectedIndex].text : '';
        const branchSelect = document.getElementById('clientBranch');
        const branchKey = branchSelect ? branchSelect.value : 'ksa';
        const branchName = branchSelect ? branchSelect.options[branchSelect.selectedIndex].text : '';
        const message = document.getElementById('clientMessage')?.value.trim() || '';

        return { name, company, email, phone, serviceName, branchKey, branchName, message };
    }

    function showStatus(msg, isSuccess = true) {
        if (!formStatusAlert) return;
        formStatusAlert.textContent = msg;
        formStatusAlert.className = `form-status-alert ${isSuccess ? 'success' : 'error'}`;
        formStatusAlert.style.display = 'block';
        setTimeout(() => {
            formStatusAlert.style.display = 'none';
        }, 6000);
    }

    // Direct WhatsApp Submission
    if (submitWhatsappBtn) {
        submitWhatsappBtn.addEventListener('click', () => {
            const values = getFormValues();

            if (!values.name || !values.company || !values.email || !values.phone) {
                const isAr = htmlEl.getAttribute('lang') !== 'en';
                alert(isAr ? 'يرجى ملء الحقول الإلزامية (الاسم، الشركة، البريد، الهاتف)' : 'Please fill all required fields (Name, Company, Email, Phone)');
                return;
            }

            // Target phone number based on branch
            const whatsappNumber = values.branchKey === 'ksa' ? '966545469150' : '201289609100';

            const waText = encodeURIComponent(
                `*طلب جديد من الموقع - آثر للاستشارات*\n` +
                `------------------------------------\n` +
                `*الاسم:* ${values.name}\n` +
                `*الشركة:* ${values.company}\n` +
                `*البريد الإلكتروني:* ${values.email}\n` +
                `*الهاتف:* ${values.phone}\n` +
                `*الخدمة المطلوبة:* ${values.serviceName}\n` +
                `*الفرع:* ${values.branchName}\n` +
                (values.message ? `*تفاصيل إضافية:* ${values.message}\n` : '') +
                `------------------------------------`
            );

            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${waText}`;
            window.open(whatsappUrl, '_blank');

            const isAr = htmlEl.getAttribute('lang') !== 'en';
            showStatus(isAr ? 'تم فتح تطبيق واتساب لإرسال تفاصيل طلبك مباشرة إلى فريقنا.' : 'WhatsApp opened to dispatch your request directly to our team.');
        });
    }

    // Email Submission (server-side, via send-email.php)
    if (consultationForm) {
        consultationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const isAr = htmlEl.getAttribute('lang') !== 'en';

            const values = getFormValues();
            if (!values.name || !values.company || !values.email || !values.phone) {
                alert(isAr ? 'يرجى ملء الحقول الإلزامية (الاسم، الشركة، البريد، الهاتف)' : 'Please fill all required fields (Name, Company, Email, Phone)');
                return;
            }

            const submitBtn = document.getElementById('submitEmailBtn');
            const honeypot = document.getElementById('clientWebsite')?.value || '';
            const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>${isAr ? 'جاري الإرسال...' : 'Sending...'}</span>`;
            }

            fetch('send-email.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...values, website: honeypot })
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        showStatus(isAr ? 'شكراً لتواصلك مع آثر للاستشارات! تم إرسال رسالتك وسيقوم خبراؤنا بالرد عليك خلال ساعات العمل.' : 'Thank you for reaching out to Aathr Consulting! Our senior consultants will respond promptly.');
                        consultationForm.reset();
                    } else {
                        showStatus(isAr ? 'تعذر إرسال الرسالة، يرجى المحاولة مرة أخرى أو التواصل عبر واتساب.' : 'Failed to send your message. Please try again or contact us via WhatsApp.', false);
                    }
                })
                .catch(() => {
                    showStatus(isAr ? 'تعذر إرسال الرسالة، يرجى المحاولة مرة أخرى أو التواصل عبر واتساب.' : 'Failed to send your message. Please try again or contact us via WhatsApp.', false);
                })
                .finally(() => {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnHTML;
                    }
                });
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 7. FAQ ACCORDION
    // ─────────────────────────────────────────────────────────────
    const faqCards = document.querySelectorAll('.faq-card');

    faqCards.forEach(card => {
        const trigger = card.querySelector('.faq-trigger');
        const panel = card.querySelector('.faq-answer-panel');

        if (trigger && panel) {
            trigger.addEventListener('click', () => {
                const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

                // Close other panels
                faqCards.forEach(otherCard => {
                    const otherTrigger = otherCard.querySelector('.faq-trigger');
                    const otherPanel = otherCard.querySelector('.faq-answer-panel');
                    if (otherTrigger && otherPanel && otherCard !== card) {
                        otherTrigger.setAttribute('aria-expanded', 'false');
                        otherPanel.style.maxHeight = null;
                    }
                });

                // Toggle current
                trigger.setAttribute('aria-expanded', !isExpanded ? 'true' : 'false');
                if (!isExpanded) {
                    panel.style.maxHeight = panel.scrollHeight + 40 + 'px';
                } else {
                    panel.style.maxHeight = null;
                }
            });
        }
    });

    // FAQ page: search box and category tabs work together
    const faqSearch = document.getElementById('faqSearch');
    const faqEmpty = document.getElementById('faqEmpty');
    const faqTabs = document.querySelectorAll('[data-faq-filter]');
    const faqGroups = document.querySelectorAll('.faq-group');

    if (faqSearch && faqGroups.length) {
        let faqCategory = 'all';

        // Match Arabic regardless of diacritics, tatweel and hamza/taa-marbuta spelling
        const normalizeText = text => text.toLowerCase()
            .replace(/[ً-ْـ]/g, '')
            .replace(/[أإآ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي');

        function applyFaqFilter() {
            const query = normalizeText(faqSearch.value.trim());
            let shown = 0;

            faqGroups.forEach(group => {
                const inCategory = faqCategory === 'all' || group.getAttribute('data-category') === faqCategory;
                let groupShown = 0;
                group.querySelectorAll('.faq-card').forEach(card => {
                    const matches = inCategory && (!query || normalizeText(card.textContent).includes(query));
                    card.hidden = !matches;
                    if (matches) groupShown++;
                });
                group.hidden = groupShown === 0;
                shown += groupShown;
            });

            if (faqEmpty) faqEmpty.hidden = shown > 0;
        }

        faqSearch.addEventListener('input', applyFaqFilter);
        faqTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                faqCategory = tab.getAttribute('data-faq-filter');
                faqTabs.forEach(t => {
                    t.classList.toggle('active', t === tab);
                    t.setAttribute('aria-pressed', t === tab ? 'true' : 'false');
                });
                applyFaqFilter();
            });
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 8. FLOATING WHATSAPP POPUP PICKER
    // ─────────────────────────────────────────────────────────────
    const whatsappTriggerBtn = document.getElementById('whatsappTriggerBtn');
    const whatsappPopup = document.getElementById('whatsappPopup');
    const closeWhatsappPopup = document.getElementById('closeWhatsappPopup');

    if (whatsappTriggerBtn && whatsappPopup) {
        whatsappTriggerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            whatsappPopup.classList.toggle('show');
        });

        if (closeWhatsappPopup) {
            closeWhatsappPopup.addEventListener('click', (e) => {
                e.stopPropagation();
                whatsappPopup.classList.remove('show');
            });
        }

        document.addEventListener('click', (e) => {
            if (!whatsappPopup.contains(e.target) && e.target !== whatsappTriggerBtn) {
                whatsappPopup.classList.remove('show');
            }
        });
    }

    // ─────────────────────────────────────────────────────────────
    // 9. INTERSECTION OBSERVER: SCROLL REVEALS & STAT COUNTERS
    // ─────────────────────────────────────────────────────────────
    const revealElements = document.querySelectorAll('[data-reveal]');
    const counterElements = document.querySelectorAll('.counter');
    let countersAnimated = false;

    function animateCounters() {
        if (countersAnimated) return;
        countersAnimated = true;

        counterElements.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 1600;
            const stepTime = 25;
            const steps = duration / stepTime;
            const increment = target / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.ceil(current);
                }
            }, stepTime);
        });
    }

    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');

                // If hero stats section is revealed, animate counters
                if (entry.target.classList.contains('stat-card') || entry.target.closest('.hero-stats-wrapper')) {
                    animateCounters();
                }

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));

    // ─────────────────────────────────────────────────────────────
    // 10. COPYRIGHT YEAR UPDATE
    // ─────────────────────────────────────────────────────────────
    document.querySelectorAll('.copyright-year').forEach(el => {
        el.textContent = new Date().getFullYear();
    });
});
