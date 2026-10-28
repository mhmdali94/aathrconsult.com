// Front-end reference extracted from aathrconsult/html/script.js
// Form helpers (lines 252-281):
    const consultationForm = document.getElementById('consultationForm');
    const submitWhatsappBtn = document.getElementById('submitWhatsappBtn');
    const formStatusAlert = document.getElementById('formStatusAlert');

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

// Email submission (lines 316-359):
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
