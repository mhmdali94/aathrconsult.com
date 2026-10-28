/**
 * Aathr Consulting — "استكشف مع آثر" (Explore with Aathr) Journey
 * One question at a time across 4 stations, a live "what we understood" panel,
 * an initial reading, and hand-off to the team via WhatsApp / email.
 * Question bank & branching rules follow the "Aathr Explore Journey" spec.
 */

(function () {
    'use strict';

    const root = document.getElementById('exploreApp');
    if (!root) return;

    const htmlEl = document.documentElement;
    const STORAGE_KEY = 'aathr_explore_v1';
    const AUTO_ADVANCE_MS = 380;

    const lang = () => (htmlEl.getAttribute('lang') === 'en' ? 'en' : 'ar');
    const t = (o) => (o == null ? '' : typeof o === 'string' ? o : (o[lang()] ?? o.ar));
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const L = (ar, en) => ({ ar, en });
    const O = (v, ar, en, icon) => ({ v, label: L(ar, en), icon });
    const sep = () => (lang() === 'en' ? ', ' : '، ');

    // ─────────────────────────────────────────────────────────────
    // 1. STATIONS
    // ─────────────────────────────────────────────────────────────
    const STATIONS = [
        { n: 1, icon: 'fa-comment-dots', name: L('احكِ لنا', 'Tell us'), sub: L('ما الذي يعطل أعمالك؟', 'What is holding you back?') },
        { n: 2, icon: 'fa-magnifying-glass', name: L('نقترب من التفاصيل', 'A closer look'), sub: L('أسئلة قصيرة بحسب حالتك', 'Short questions for your case') },
        { n: 3, icon: 'fa-puzzle-piece', name: L('نرتب الصورة', 'Putting it together'), sub: L('راجع معنا ما فهمناه', 'Review what we understood') },
        { n: 4, icon: 'fa-location-dot', name: L('نحدد نقطة البداية', 'Your starting point'), sub: L('قراءتك الأولية والخطوة المناسبة', 'Your initial reading & next step') }
    ];

    // ─────────────────────────────────────────────────────────────
    // 2. SHARED OPTION SETS
    // ─────────────────────────────────────────────────────────────
    const OFTEN = [O('often', 'غالبًا', 'Often'), O('sometimes', 'أحيانًا', 'Sometimes'), O('rarely', 'نادرًا', 'Rarely'), O('unknown', 'لا أعرف', "I don't know")];
    const MUCH = [O('often', 'كثيرًا', 'A lot'), O('sometimes', 'أحيانًا', 'Sometimes'), O('no', 'لا', 'No'), O('unknown', 'لا أعرف', "I don't know")];
    const YES_PARTLY = [O('yes', 'نعم', 'Yes'), O('partly', 'جزئيًا', 'Partly'), O('no', 'لا', 'No'), O('unknown', 'لا أعرف', "I don't know")];
    const isRecurring = (v) => v === 'often' || v === 'sometimes';

    const TRACKS = {
        profit: { icon: 'fa-coins', label: L('الربح والسيولة', 'Profit & cash flow'), desc: L('المبيعات موجودة، لكن الربح أو السيولة لا يعكسانها', 'Sales are there, but profit or cash do not reflect them') },
        delays: { icon: 'fa-hourglass-half', label: L('التأخر والأخطاء', 'Delays & errors'), desc: L('أعمال تتأخر أو تتكرر فيها الأخطاء', 'Work runs late or errors keep repeating') },
        roles: { icon: 'fa-people-arrows', label: L('المسؤوليات', 'Responsibilities'), desc: L('غير واضح من يفعل ماذا، ومن يقرر', 'Unclear who does what, and who decides') },
        reports: { icon: 'fa-chart-column', label: L('الأرقام والتقارير', 'Numbers & reports'), desc: L('أرقام متأخرة أو مختلفة أو لا يُوثق بها', 'Numbers that are late, conflicting or untrusted') },
        tech: { icon: 'fa-server', label: L('الأنظمة والتقنية', 'Systems & technology'), desc: L('أنظمة بطيئة أو لا تغطي الاحتياج أو غير مترابطة', 'Systems that are slow, incomplete or disconnected') }
    };
    const TRACK_KEYS = Object.keys(TRACKS);

    // ─────────────────────────────────────────────────────────────
    // 3. QUESTION BANK
    //    st: station · sum: label in the live summary
    //    multi/max/exclusive: multi-select rules · text: free-text config
    //    show(): branching rule — evaluated against answers so far
    // ─────────────────────────────────────────────────────────────
    const Q = {
        q01: {
            st: 1, sum: L('ما يزعجك', 'What bothers you'), noSkip: true, multi: true, exclusive: 'unknown',
            title: L('ما أكثر شيء يزعجك في أداء شركتك حاليًا؟', 'What bothers you most about how your company performs today?'),
            hint: L('يمكنك اختيار أكثر من خيار. ليس مطلوبًا أن تعرف السبب.', 'Pick one or more. You do not need to know the cause.'),
            options: TRACK_KEYS.map((k) => ({ v: k, label: TRACKS[k].label, desc: TRACKS[k].desc, icon: TRACKS[k].icon }))
                .concat([{ v: 'unknown', label: L('لا أعرف بالضبط', "I'm not sure exactly"), desc: L('أشعر أن شيئًا لا يسير كما ينبغي', 'Something just is not working right'), icon: 'fa-circle-question' }])
        },
        q02: {
            st: 1, sum: L('نبدأ بـ', 'Starting with'), noSkip: true,
            title: L('أي هذه المشكلات تريد أن نبدأ بها؟', 'Which of these should we start with?'),
            hint: L('سنحتفظ بالبقية ونذكرها في القراءة.', 'We will keep the others and mention them in your reading.'),
            options: () => (ans('q01')?.v || []).map((k) => ({ v: k, label: TRACKS[k].label, icon: TRACKS[k].icon })),
            show: () => { const v = ans('q01')?.v || []; return v.length > 1 && !v.includes('unknown'); }
        },
        q03: {
            st: 1, sum: L('بكلماتك', 'In your words'),
            title: L('ما الذي يحدث؟ اذكر موقفًا قريبًا يوضح ما يزعجك.', 'What is happening? Describe a recent situation that shows it.'),
            hint: L('موقف واحد حقيقي يكفي، دون أسماء أو معلومات حساسة.', 'One real situation is enough. No names or sensitive details.'),
            text: { rows: 4, placeholder: () => t(EXAMPLES[getTrack() || 'general']), required: true }
        },
        u1: {
            st: 1, sum: L('مواقف تلاحظها', 'Where you notice it'), multi: true,
            title: L('في أي موقف تشعر أن الأمور لا تسير كما ينبغي؟', 'In which situations do things feel like they are not going right?'),
            hint: L('اختر ما ينطبق، ويمكنك الإضافة بكلماتك.', 'Pick what applies, and add your own words if you like.'),
            options: [
                O('numbers', 'الأرقام', 'The numbers', 'fa-calculator'), O('staff', 'متابعة الموظفين', 'Following up on staff', 'fa-user-clock'),
                O('delivery', 'التسليم', 'Delivery', 'fa-truck-fast'), O('customers', 'العملاء', 'Customers', 'fa-face-frown'),
                O('systems', 'الأنظمة', 'Systems', 'fa-laptop-code'), O('other', 'أخرى', 'Other', 'fa-ellipsis')
            ],
            text: { rows: 2, placeholder: L('أضف بكلماتك (اختياري)', 'Add in your own words (optional)') },
            show: () => isUnknownStart()
        },
        u2: {
            st: 1, sum: L('نقطة البدء المقترحة', 'Suggested focus'), noSkip: true,
            title: () => L(`يبدو أن البداية الأنسب هي فهم «${TRACKS[suggestTrack()].label.ar}». هل نبدأ منها؟`,
                `It looks like the best place to start is "${TRACKS[suggestTrack()].label.en}". Shall we start there?`),
            options: [O('yes', 'نعم، نبدأ منها', 'Yes, start there', 'fa-check'), O('no', 'لا، أريد وصفًا آخر', 'No, something else', 'fa-rotate')],
            show: () => isUnknownStart() && !!suggestTrack()
        },
        u3: {
            st: 1, sum: L('الأقرب لحالتك', 'Closest to your case'), noSkip: true,
            title: L('أي هذه الأوصاف أقرب لما تلاحظه؟', 'Which of these is closest to what you notice?'),
            options: TRACK_KEYS.map((k) => ({ v: k, label: TRACKS[k].label, desc: TRACKS[k].desc, icon: TRACKS[k].icon }))
                .concat([O('none', 'لا شيء منها تحديدًا', 'None of these exactly', 'fa-circle-question')]),
            show: () => isUnknownStart() && (ans('u2')?.v === 'no' || (!!ans('u1') && !suggestTrack()))
        },

        q04: {
            st: 2, sum: L('النشاط', 'Business activity'),
            title: L('ما النشاط الرئيسي للمنشأة؟', "What is your company's main activity?"),
            options: [
                O('trade', 'تجارة وتوزيع', 'Trade & distribution', 'fa-boxes-stacked'), O('services', 'خدمات', 'Services', 'fa-handshake'),
                O('manufacturing', 'تصنيع', 'Manufacturing', 'fa-industry'), O('contracting', 'مقاولات ومشروعات', 'Contracting & projects', 'fa-helmet-safety'),
                O('other', 'غير ذلك', 'Something else', 'fa-ellipsis')
            ],
            text: { rows: 1, when: 'other', placeholder: L('ما نشاطكم؟', 'What do you do?') }
        },
        q05: {
            st: 2, sum: L('أين', 'Where'),
            title: L('أين تلاحظ المشكلة أكثر؟', 'Where do you notice the problem most?'),
            options: [
                O('one', 'قسم واحد', 'One department', 'fa-door-open'), O('several', 'عدة أقسام', 'Several departments', 'fa-sitemap'),
                O('branches', 'بين الفروع', 'Between branches', 'fa-code-branch'), O('most', 'معظم الشركة', 'Most of the company', 'fa-building'),
                O('unsure', 'غير متأكد', 'Not sure', 'fa-circle-question')
            ],
            text: { rows: 1, optional: true, placeholder: L('حدد القسم أو الفروع (اختياري)', 'Name the department or branches (optional)') }
        },
        q06: {
            st: 2, sum: L('منذ متى', 'Since when'),
            title: L('منذ متى تلاحظ هذه المشكلة؟', 'How long have you noticed this?'),
            options: [O('recent', 'مؤخرًا', 'Recently', 'fa-seedling'), O('months', 'عدة أشهر', 'Several months', 'fa-calendar'), O('year', 'أكثر من سنة', 'Over a year', 'fa-calendar-days'), O('unknown', 'لا أتذكر', "I don't remember", 'fa-circle-question')]
        },
        q07: {
            st: 2, sum: L('التكرار', 'How often'),
            title: L('كم مرة تواجهون هذه المشكلة؟', 'How often do you run into it?'),
            options: [
                O('daily', 'يوميًا', 'Daily', 'fa-sun'), O('weekly', 'أسبوعيًا', 'Weekly', 'fa-calendar-week'), O('periodic', 'على فترات', 'From time to time', 'fa-wave-square'),
                O('pressure', 'عند الضغط', 'Under pressure', 'fa-gauge-high'), O('once', 'مرة واحدة', 'Just once', 'fa-1'), O('unsure', 'غير متأكد', 'Not sure', 'fa-circle-question')
            ]
        },
        q08: {
            st: 2, sum: L('الأثر', 'Impact'), multi: true, max: 3,
            title: L('ما أبرز نتيجة تسببها هذه المشكلة؟', 'What does this problem cause the most?'),
            hint: L('اختر حتى ثلاث نتائج.', 'Pick up to three.'),
            options: [
                O('cost', 'تكلفة', 'Cost', 'fa-money-bill-wave'), O('delay', 'تأخير', 'Delays', 'fa-clock'), O('customers', 'شكاوى أو فقد عملاء', 'Complaints or lost customers', 'fa-user-minus'),
                O('team', 'ضغط على الفريق', 'Pressure on the team', 'fa-people-group'), O('decision', 'صعوبة القرار', 'Harder decisions', 'fa-scale-unbalanced'),
                O('downtime', 'تعطل', 'Downtime', 'fa-plug-circle-xmark'), O('other', 'أخرى', 'Other', 'fa-ellipsis')
            ],
            text: { rows: 1, when: 'other', placeholder: L('ما النتيجة الأخرى؟', 'What else?') }
        },
        q09: {
            st: 2, sum: L('محاولات سابقة', 'Previous attempts'),
            title: L('هل حاولتم معالجة المشكلة من قبل؟', 'Have you tried to fix it before?'),
            options: [O('yes', 'نعم', 'Yes', 'fa-check'), O('no', 'لا', 'No', 'fa-xmark'), O('unknown', 'لا أعرف', "I don't know", 'fa-circle-question')]
        },
        q10: {
            st: 2, sum: L('ما جربتموه', 'What you tried'),
            title: L('ماذا جربتم، وما الذي تغير بعده؟', 'What did you try, and what changed after?'),
            text: { rows: 2, first: true, placeholder: L('مثال: عيّنا موظف متابعة، أو غيرنا البرنامج...', 'e.g. we hired a coordinator, or changed the software...') },
            options: [O('lasting', 'تحسن مستمر', 'Lasting improvement'), O('temporary', 'تحسن مؤقت', 'Temporary improvement'), O('none', 'لا تحسن', 'No improvement'), O('worse', 'أصبح أسوأ', 'Got worse'), O('unsure', 'غير متأكد', 'Not sure')],
            show: () => ans('q09')?.v === 'yes'
        },

        // ── Track: profit & cash flow
        p1: {
            st: 2, track: 'profit', sum: L('في المال', 'In the money'),
            title: L('أين تلاحظ المشكلة المالية أكثر؟', 'Where do you notice the money problem most?'),
            options: [
                O('lowprofit', 'أرباح منخفضة', 'Low profits', 'fa-arrow-trend-down'), O('cash', 'نقص سيولة رغم المبيعات', 'Cash shortage despite sales', 'fa-wallet'),
                O('expenses', 'ارتفاع المصروفات', 'Rising expenses', 'fa-arrow-trend-up'), O('unknownprofit', 'لا أعرف الربح الحقيقي', "I don't know the real profit", 'fa-circle-question'),
                O('other', 'أخرى', 'Other', 'fa-ellipsis')
            ],
            text: { rows: 1, when: 'other', placeholder: L('صف باختصار', 'Briefly describe') }
        },
        p2: { st: 2, track: 'profit', sum: L('تأخر السداد', 'Late payments'), title: L('هل يتأخر العملاء في سداد مستحقاتهم؟', 'Do customers pay you late?'), options: [OFTEN[0], OFTEN[1], OFTEN[2], O('na', 'لا ينطبق', 'Not applicable'), OFTEN[3]] },
        p2b: {
            st: 2, track: 'profit', sum: L('متابعة التحصيل', 'Collections follow-up'),
            title: L('هل توجد متابعة واضحة للتحصيل؟', 'Is there clear follow-up on collections?'), options: YES_PARTLY,
            show: () => isRecurring(ans('p2')?.v)
        },
        p3: { st: 2, track: 'profit', sum: L('وضوح التقارير المالية', 'Financial reporting'), title: L('هل تعرف الربح والمصروفات من تقرير دوري واضح؟', 'Do you see profit and expenses in a clear, regular report?'), options: YES_PARTLY },
        p3b: {
            st: 2, track: 'profit', sum: L('التقارير المتاحة', 'Available reports'),
            title: L('ما التقارير المتاحة حاليًا، ومن يعدها؟', 'Which reports exist today, and who prepares them?'),
            text: { rows: 2, required: true, placeholder: L('مثال: كشف حساب البنك، وملف Excel يعده المحاسب شهريًا', 'e.g. bank statement, and an Excel file the accountant prepares monthly') },
            show: () => ['partly', 'no'].includes(ans('p3')?.v)
        },
        c2: {
            st: 2, track: 'profit', sum: L('توضيح', 'Clarification'), clarify: true,
            title: L('ذكرت أنك لا تعرف الربح الحقيقي، وأن هناك تقريرًا دوريًا واضحًا. أيهما أقرب؟', 'You said you do not know the real profit, and also that there is a clear regular report. Which is closer?'),
            options: [O('distrust', 'التقرير موجود، لكن لا أثق في رقم الربح', 'The report exists, but I do not trust the profit figure'), O('clear', 'التقرير واضح، والمشكلة في مكان آخر', 'The report is clear; the problem is elsewhere')],
            show: () => ans('p1')?.v === 'unknownprofit' && ans('p3')?.v === 'yes'
        },

        // ── Track: delays & errors
        d1: {
            st: 2, track: 'delays', sum: L('موضع التعطل', 'Where it stalls'),
            title: L('في أي جزء يتعطل العمل غالبًا؟', 'Where does work usually get stuck?'),
            options: [
                O('approval', 'الاعتماد', 'Approval', 'fa-stamp'), O('execution', 'التنفيذ', 'Execution', 'fa-gears'),
                O('handoff', 'انتقال العمل بين الأقسام', 'Handoff between departments', 'fa-right-left'), O('delivery', 'التسليم', 'Delivery', 'fa-truck-fast'),
                O('unknown', 'لا أعرف', "I don't know", 'fa-circle-question')
            ]
        },
        d1a: {
            st: 2, track: 'delays', sum: L('مدة الاعتماد', 'Approval time'), show: () => ans('d1')?.v === 'approval',
            title: L('كم يستغرق الاعتماد عادة؟', 'How long does approval usually take?'),
            options: [O('sameday', 'نفس اليوم', 'Same day'), O('days', 'عدة أيام', 'A few days'), O('week', 'أسبوع أو أكثر', 'A week or more'), O('varies', 'يختلف كثيرًا', 'It varies a lot')]
        },
        d1e: {
            st: 2, track: 'delays', sum: L('ما يؤخر التنفيذ', 'What slows execution'), show: () => ans('d1')?.v === 'execution',
            title: L('ما الذي يؤخر التنفيذ غالبًا؟', 'What usually slows execution down?'),
            options: [O('info', 'معلومات ناقصة', 'Missing information'), O('resources', 'نقص موارد أو أشخاص', 'Not enough people or resources'), O('rework', 'إعادة عمل بسبب أخطاء', 'Rework from errors'), O('priorities', 'أولويات غير واضحة', 'Unclear priorities'), O('unknown', 'لا أعرف', "I don't know")]
        },
        d1h: {
            st: 2, track: 'delays', sum: L('طريقة الانتقال', 'How work is handed off'), show: () => ans('d1')?.v === 'handoff',
            title: L('كيف ينتقل العمل بين الأقسام حاليًا؟', 'How does work move between departments today?'),
            options: [O('system', 'عبر نظام', 'Through a system'), O('messages', 'بريد أو واتساب', 'Email or WhatsApp'), O('paper', 'ورقيًا', 'On paper'), O('verbal', 'شفهيًا', 'Verbally'), O('mix', 'مزيج من ذلك', 'A mix of these')]
        },
        d1d: {
            st: 2, track: 'delays', sum: L('عند التسليم', 'At delivery'), show: () => ans('d1')?.v === 'delivery',
            title: L('ما أكثر ما يحدث عند التسليم؟', 'What happens most at delivery?'),
            options: [O('late', 'يتأخر', 'It is late'), O('incomplete', 'يصل ناقصًا', 'It arrives incomplete'), O('errors', 'به أخطاء', 'It has errors'), O('returns', 'مرتجعات أو شكاوى', 'Returns or complaints')]
        },
        c1: {
            st: 2, track: 'delays', sum: L('توضيح', 'Clarification'), clarify: true,
            title: L('ذكرت أن المشكلة في قسم واحد، وأن التعطل في انتقال العمل بين الأقسام. أيهما أقرب؟', 'You said the problem is in one department, and that work stalls between departments. Which is closer?'),
            options: [O('inside', 'التعطل داخل قسم واحد', 'It stalls inside one department'), O('between', 'التعطل بين الأقسام فعلًا', 'It really stalls between departments')],
            show: () => ans('q05')?.v === 'one' && ans('d1')?.v === 'handoff'
        },
        d2: { st: 2, track: 'delays', sum: L('تكرار الإدخال', 'Duplicate entry'), title: L('هل تُكتب البيانات نفسها في أكثر من ملف أو نظام؟', 'Is the same data typed into more than one file or system?'), options: MUCH },
        d2b: {
            st: 2, track: 'delays', sum: L('مثال التكرار', 'Duplication example'), show: () => isRecurring(ans('d2')?.v),
            title: L('هل تذكر مثالًا؟', 'Can you give an example?'),
            text: { rows: 2, required: true, placeholder: L('مثال: رقم الطلب يُكتب في Excel ثم في نظام المحاسبة', 'e.g. the order number is typed in Excel, then in the accounting system') }
        },
        d3: { st: 2, track: 'delays', sum: L('مع حجم العمل', 'With workload'), title: L('هل تزيد المشكلة عند ارتفاع حجم العمل؟', 'Does it get worse when workload rises?'), options: [O('yes', 'نعم', 'Yes', 'fa-check'), O('no', 'لا', 'No', 'fa-xmark'), O('unsure', 'غير متأكد', 'Not sure', 'fa-circle-question')] },

        // ── Track: responsibilities
        r1: { st: 2, track: 'roles', sum: L('وضوح المسؤول', 'Clear owner'), title: L('عندما تتعطل مهمة، هل يتضح من المسؤول عن استكمالها؟', 'When a task stalls, is it clear who should finish it?'), options: [O('always', 'دائمًا', 'Always'), O('sometimes', 'أحيانًا', 'Sometimes'), O('mostlynot', 'غالبًا لا', 'Mostly not'), O('unsure', 'غير متأكد', 'Not sure')] },
        r1b: {
            st: 2, track: 'roles', sum: L('توزيع مكتوب', 'Written roles'), show: () => ['sometimes', 'mostlynot', 'unsure'].includes(ans('r1')?.v),
            title: L('هل يوجد توزيع مسؤوليات أو إجراء مكتوب؟', 'Is there a written split of roles or a procedure?'), options: YES_PARTLY
        },
        r2: { st: 2, track: 'roles', sum: L('انتظار الموافقة', 'Waiting on approval'), title: L('هل تنتظر الأعمال الروتينية موافقة شخص واحد؟', 'Does routine work wait for one person to approve?'), options: OFTEN },
        r2b: {
            st: 2, track: 'roles', sum: L('قرار ينتظر', 'A waiting decision'), show: () => isRecurring(ans('r2')?.v),
            title: L('اذكر مثالًا لقرار ينتظر الاعتماد.', 'Give an example of a decision that waits for approval.'),
            text: { rows: 2, required: true, placeholder: L('مثال: أي خصم للعميل يحتاج موافقة المدير العام', 'e.g. any customer discount needs the general manager’s OK') }
        },
        r3: { st: 2, track: 'roles', sum: L('تداخل المهام', 'Overlapping tasks'), title: L('هل يؤدي أكثر من طرف المهمة نفسها، أو لا ينفذها أحد؟', 'Do several people do the same task, or nobody does it?'), options: MUCH },
        r3b: {
            st: 2, track: 'roles', sum: L('موقف التداخل', 'Overlap example'), show: () => isRecurring(ans('r3')?.v),
            title: L('صف موقفًا حدث فيه ذلك.', 'Describe a time it happened.'),
            text: { rows: 2, required: true, placeholder: L('مثال: اتصل موظفان بنفس العميل، ولم يرسل أحد العرض', 'e.g. two staff called the same customer, and nobody sent the quote') }
        },

        // ── Track: numbers & reports
        n1: {
            st: 2, track: 'reports', sum: L('سبب عدم الثقة', 'Why numbers feel off'), multi: true,
            title: L('ما الذي يجعل الأرقام غير موثوقة؟', 'What makes the numbers unreliable?'),
            options: [
                O('differ', 'اختلاف التقارير', 'Reports disagree', 'fa-not-equal'), O('late', 'تأخرها', 'They come late', 'fa-clock'),
                O('missing', 'نقص البيانات', 'Missing data', 'fa-database'), O('hard', 'صعوبة تفسيرها', 'Hard to interpret', 'fa-chart-pie'), O('other', 'أخرى', 'Other', 'fa-ellipsis')
            ],
            text: { rows: 1, when: 'other', placeholder: L('ما السبب الآخر؟', 'What else?') }
        },
        n2: {
            st: 2, track: 'reports', sum: L('مصادر البيانات', 'Data sources'),
            title: L('من أين تُجمع البيانات لإعداد التقارير؟', 'Where is report data collected from?'),
            options: [O('one', 'نظام واحد', 'One system', 'fa-server'), O('multi', 'عدة أنظمة', 'Several systems', 'fa-network-wired'), O('excel', 'Excel', 'Excel', 'fa-file-excel'), O('mix', 'مزيج', 'A mix', 'fa-shuffle'), O('unknown', 'لا أعرف', "I don't know", 'fa-circle-question')]
        },
        n2b: {
            st: 2, track: 'reports', sum: L('التجميع والمراجعة', 'Compiling & review'), show: () => ['multi', 'excel', 'mix'].includes(ans('n2')?.v),
            title: L('كيف يتم التجميع والمراجعة؟', 'How is it compiled and checked?'),
            options: [O('oneperson', 'يدويًا بواسطة شخص واحد', 'Manually, by one person'), O('several', 'يدويًا بواسطة عدة أشخاص', 'Manually, by several people'), O('partauto', 'مؤتمت جزئيًا', 'Partly automated'), O('noreview', 'لا توجد مراجعة واضحة', 'No clear review'), O('unknown', 'لا أعرف', "I don't know")]
        },
        n3: {
            st: 2, track: 'reports', sum: L('مثال اختلاف', 'A mismatch example'),
            title: L('هل تصف تقريرين أو رقمين ظهر بينهما اختلاف؟', 'Can you describe two reports or numbers that did not match?'),
            hint: L('اختياري، ودون أسماء أو معلومات حساسة. سنحفظه كنقطة تحقق.', 'Optional, with no names or sensitive data. We keep it as a checkpoint.'),
            text: { rows: 2, required: true, placeholder: L('مثال: مبيعات مارس في تقرير المبيعات تختلف عنها في تقرير المحاسبة', 'e.g. March sales differ between the sales report and accounting') }
        },

        // ── Track: systems & technology
        s1: {
            st: 2, track: 'tech', sum: L('المشكلة التقنية', 'Tech issue'),
            title: L('ما المشكلة الأبرز في استخدام الأنظمة؟', 'What is the main problem with your systems?'),
            options: [
                O('slow', 'بطء أو أعطال', 'Slowness or outages', 'fa-gauge'), O('gap', 'لا يغطي الاحتياج', 'Does not cover our needs', 'fa-puzzle-piece'),
                O('adoption', 'ضعف الاستخدام', 'Low adoption', 'fa-user-slash'), O('integration', 'عدم الترابط', 'Not connected', 'fa-link-slash'),
                O('security', 'مخاوف أمنية', 'Security concerns', 'fa-shield-halved'), O('other', 'أخرى', 'Other', 'fa-ellipsis')
            ],
            text: { rows: 1, when: 'other', placeholder: L('صف باختصار', 'Briefly describe') }
        },
        s2: { st: 2, track: 'tech', sum: L('عمل خارج النظام', 'Work outside the system'), title: L('هل ينفذ الفريق عملًا خارج النظام ثم يعيد إدخاله؟', 'Does the team work outside the system, then re-enter it?'), options: [OFTEN[0], OFTEN[1], O('no', 'لا', 'No'), OFTEN[3]] },
        s2b: {
            st: 2, track: 'tech', sum: L('سبب العمل خارجه', 'Why outside'), show: () => isRecurring(ans('s2')?.v),
            title: L('ما السبب غالبًا؟', 'Why, usually?'),
            options: [O('missing', 'النظام لا يدعم الخطوة', 'The system lacks that step'), O('easier', 'أسهل خارجه', 'It is easier outside'), O('training', 'الفريق غير مدرّب', 'The team is not trained'), O('slow', 'النظام بطيء', 'The system is slow'), O('unknown', 'لا أعرف', "I don't know")]
        },
        s3: {
            st: 2, track: 'tech', sum: L('بعد تغيير؟', 'After a change?'),
            title: L('هل ظهرت المشكلة بعد تغيير معين؟', 'Did it start after a specific change?'),
            options: [
                O('newsystem', 'تطبيق نظام جديد', 'A new system', 'fa-rocket'), O('update', 'تحديث', 'An update', 'fa-arrows-rotate'), O('growth', 'توسع', 'Growth', 'fa-arrow-up-right-dots'),
                O('team', 'تغيير في الفريق', 'Team change', 'fa-people-arrows'), O('none', 'دون تغيير واضح', 'No clear change', 'fa-minus'), O('unknown', 'لا أعرف', "I don't know", 'fa-circle-question')
            ]
        },

        q11: {
            st: 2, sum: L('الفرق المطلوب', 'The change you want'),
            title: L('إذا تحسنت المشكلة، ما أول فرق تريد أن تراه؟', 'If this improved, what is the first difference you would want to see?'),
            text: { rows: 2, required: true, placeholder: L('مثل: وصول الطلبات في موعدها دون متابعتي', 'e.g. orders arrive on time without me chasing them') }
        },
        q12: { st: 3, sum: null, noSkip: true, kind: 'review' }
    };

    const ORDER = ['q01', 'q02', 'q03', 'u1', 'u2', 'u3', 'q04', 'q05', 'q06', 'q07', 'q08', 'q09', 'q10',
        'p1', 'p2', 'p2b', 'p3', 'p3b', 'c2',
        'd1', 'd1a', 'd1e', 'd1h', 'd1d', 'c1', 'd2', 'd2b', 'd3',
        'r1', 'r1b', 'r2', 'r2b', 'r3', 'r3b',
        'n1', 'n2', 'n2b', 'n3',
        's1', 's2', 's2b', 's3',
        'q11', 'q12'];
    const EDITABLE = ['q03', 'q04', 'q05', 'q06', 'q07', 'q08', 'q10', 'q11'];

    const EXAMPLES = {
        profit: L('مثال: بعنا أكثر من العام الماضي، لكن في نهاية الشهر لا نجد سيولة لدفع الموردين.', 'e.g. We sold more than last year, but at month-end there is no cash to pay suppliers.'),
        delays: L('مثال: الطلبات تتأخر بين المبيعات والمستودع، والعميل يتصل ليسأل عن طلبه.', 'e.g. Orders get stuck between sales and the warehouse, and customers call to chase them.'),
        roles: L('مثال: تأخرت مهمة الأسبوع الماضي ولم يعرف أحد من المسؤول عن إكمالها.', 'e.g. A task slipped last week and nobody knew who was supposed to finish it.'),
        reports: L('مثال: تقرير المبيعات يعطي رقمًا، والمحاسبة رقمًا آخر لنفس الشهر.', 'e.g. The sales report shows one number and accounting another, for the same month.'),
        tech: L('مثال: الفريق يسجل الطلبات في Excel ثم يعيد إدخالها في النظام.', 'e.g. The team logs orders in Excel, then types them into the system again.'),
        general: L('مثال: أشعر أن الفريق مشغول دائمًا، لكن النتائج لا تتحسن.', 'e.g. The team always seems busy, yet results are not improving.')
    };

    const REASSURE = [
        L('لا بأس، هذا بالضبط ما نحن هنا لنكتشفه معك.', "That's fine. That's exactly what we're here to figure out with you."),
        L('إجابة «لا أعرف» مفيدة أيضًا، وتعني أن هناك ما يستحق الفحص.', '"I don\'t know" is useful too. It tells us something is worth a closer look.'),
        L('تمام، سنكمل بسؤال أبسط.', "Okay, let's keep going with something simpler.")
    ];

    // ─────────────────────────────────────────────────────────────
    // 4. STATE & PERSISTENCE
    // ─────────────────────────────────────────────────────────────
    let state = freshState();
    let draft = null;
    let notice = null;
    let resumeOffer = null;
    let lastAddedId = null;
    let advanceTimer = null;

    function freshState() {
        return { current: 'q01', history: [], answers: {}, returnTo: null, view: 'question', reviewMode: null, extra: '', next: null, contact: {} };
    }

    function save() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
    }

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : null;
            return parsed && Q[parsed.current] ? parsed : null;
        } catch (e) { return null; }
    }

    function clearSaved() {
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* storage unavailable */ }
    }

    const ans = (id) => state.answers[id];
    const answered = (id) => !!state.answers[id] && !state.answers[id].skipped;
    const isUnknownStart = () => (ans('q01')?.v || []).includes('unknown');
    const resolve = (v) => (typeof v === 'function' ? v() : v);

    function suggestTrack() {
        const map = { numbers: 'reports', staff: 'roles', delivery: 'delays', customers: 'delays', systems: 'tech' };
        const picked = ans('u1')?.v || [];
        const hit = picked.find((v) => map[v]);
        return hit ? map[hit] : null;
    }

    function getTrack() {
        const sel = ans('q01')?.v;
        if (!sel || !sel.length) return null;
        if (sel.includes('unknown')) {
            if (ans('u2')?.v === 'yes') return suggestTrack();
            const u3 = ans('u3')?.v;
            return u3 && u3 !== 'none' ? u3 : 'general';
        }
        if (sel.length === 1) return sel[0];
        return ans('q02')?.v || sel[0];
    }

    function isVisible(id) {
        const q = Q[id];
        if (q.track && q.track !== getTrack()) return false;
        return q.show ? !!q.show() : true;
    }

    function nextId(fromId) {
        if (state.returnTo && fromId !== state.returnTo) {
            const target = state.returnTo;
            state.returnTo = null;
            return target;
        }
        for (let i = ORDER.indexOf(fromId) + 1; i < ORDER.length; i++) {
            if (isVisible(ORDER[i])) return ORDER[i];
        }
        return null;
    }

    function optionsOf(id) { return resolve(Q[id].options) || []; }
    function labelOf(id, v) { const o = optionsOf(id).find((x) => x.v === v); return o ? t(o.label) : v; }

    // ─────────────────────────────────────────────────────────────
    // 5. NAVIGATION
    // ─────────────────────────────────────────────────────────────
    function goTo(id, direction) {
        state.current = id;
        state.view = id === 'q12' ? 'review' : 'question';
        draft = cloneAnswer(ans(id));
        save();
        render(direction || 'forward');
    }

    function cloneAnswer(a) {
        if (!a || a.skipped) return { v: Q[state.current]?.multi ? [] : null, text: '' };
        return { v: Array.isArray(a.v) ? a.v.slice() : a.v, text: a.text || '' };
    }

    function commit(skipped) {
        const id = state.current;
        const q = Q[id];
        if (skipped) {
            state.answers[id] = { skipped: true };
            notice = L('تمام، تخطيناه. سنذكر في القراءة أن هذه المعلومة تنقصنا.', "Okay, skipped. We'll note in your reading that this is missing.");
        } else {
            const a = { v: draft.v, text: (draft.text || '').trim() };
            if (q.text && q.text.when && a.v !== q.text.when && !(Array.isArray(a.v) && a.v.includes(q.text.when))) a.text = '';
            state.answers[id] = a;
            const vals = Array.isArray(a.v) ? a.v : [a.v];
            notice = vals.some((v) => v === 'unknown' || v === 'unsure') ? REASSURE[Math.floor(Math.random() * REASSURE.length)] : null;
        }
        lastAddedId = id;
        pruneHiddenAnswers();
        // While editing from the review step, return there without growing the history
        if (!state.returnTo) state.history.push(id);
        const nxt = nextId(id);
        if (nxt) goTo(nxt);
    }

    // Answers to questions that are no longer on the path (e.g. after changing track) are dropped
    function pruneHiddenAnswers() {
        Object.keys(state.answers).forEach((id) => {
            if (id !== state.current && Q[id] && !isVisible(id)) delete state.answers[id];
        });
        state.history = state.history.filter((id) => Q[id] && isVisible(id));
    }

    function back() {
        clearTimeout(advanceTimer);
        if (state.view === 'reading') { state.view = 'review'; save(); render('back'); return; }
        if (state.returnTo) { const target = state.returnTo; state.returnTo = null; goTo(target, 'back'); return; }
        const prev = state.history.pop();
        if (!prev) return;
        notice = null;
        state.returnTo = null;
        goTo(prev, 'back');
    }

    function startOver() {
        clearSaved();
        state = freshState();
        notice = null;
        resumeOffer = null;
        lastAddedId = null;
        goTo('q01', 'back');
    }

    function canContinue() {
        const q = Q[state.current];
        const opts = optionsOf(state.current);
        const text = (draft.text || '').trim();
        if (opts.length) {
            const hasPick = q.multi ? draft.v.length > 0 : draft.v != null;
            if (!hasPick) return false;
            if (q.text && q.text.first && !text) return false;
            return true;
        }
        if (q.text) return !q.text.required || text.length > 0;
        return true;
    }

    // ─────────────────────────────────────────────────────────────
    // 6. PROGRESS ALONG THE TRAIL
    // ─────────────────────────────────────────────────────────────
    // 0 → first station, 1 → last station (the trail runs between station dots)
    function progress() {
        if (state.view === 'reading') return 1;
        if (state.view === 'review') return 2 / 3;
        const st = Q[state.current].st;
        const inStation = ORDER.filter((id) => Q[id].st === st && (isVisible(id) || state.answers[id]));
        const done = inStation.filter((id) => state.answers[id] && id !== state.current).length;
        const frac = inStation.length ? Math.min(done / inStation.length, 0.95) : 0;
        return Math.min(((st - 1) + frac) / (STATIONS.length - 1), 1);
    }

    function currentStation() {
        if (state.view === 'reading') return 4;
        if (state.view === 'review') return 3;
        return Q[state.current].st;
    }

    // ─────────────────────────────────────────────────────────────
    // 7. SUMMARY ("WHAT WE UNDERSTOOD SO FAR")
    // ─────────────────────────────────────────────────────────────
    function formatAnswer(id) {
        const a = state.answers[id];
        if (!a) return '';
        if (a.skipped) return t(L('تم التخطي', 'Skipped'));
        const parts = [];
        if (a.v != null && (!Array.isArray(a.v) || a.v.length)) {
            parts.push((Array.isArray(a.v) ? a.v : [a.v]).map((v) => labelOf(id, v)).join(sep()));
        }
        if (a.text) parts.push(`«${a.text}»`);
        return parts.join(' — ');
    }

    function summaryEntries() {
        return ORDER.filter((id) => Q[id].sum && state.answers[id] && isVisible(id) && !Q[id].clarify)
            .map((id) => ({ id, label: t(Q[id].sum), value: formatAnswer(id), skipped: !!state.answers[id].skipped }));
    }

    // ─────────────────────────────────────────────────────────────
    // 8. THE INITIAL READING
    // ─────────────────────────────────────────────────────────────
    const PHRASES = {
        where: { one: L('في قسم واحد', 'in one department'), several: L('في عدة أقسام', 'across several departments'), branches: L('بين الفروع', 'between branches'), most: L('في معظم الشركة', 'across most of the company') },
        since: { recent: L('بدأت مؤخرًا', 'started recently'), months: L('منذ عدة أشهر', 'for several months'), year: L('منذ أكثر من سنة', 'for over a year') },
        freq: { daily: L('وتتكرر يوميًا', 'and it happens daily'), weekly: L('وتتكرر أسبوعيًا', 'and it happens weekly'), periodic: L('وتظهر على فترات', 'and it comes and goes'), pressure: L('وتظهر عند ضغط العمل', 'and it shows up under pressure'), once: L('وحدثت مرة واحدة', 'and it happened once') },
        activity: { trade: L('في منشأة تعمل في التجارة والتوزيع', 'in a trade & distribution business'), services: L('في منشأة خدمية', 'in a services business'), manufacturing: L('في منشأة تصنيع', 'in a manufacturing business'), contracting: L('في منشأة مقاولات ومشروعات', 'in a contracting & projects business') }
    };

    const TRACK_READING = {
        profit: {
            phrase: L('ضغطًا في الربح أو السيولة', 'pressure on profit or cash flow'),
            check: [L('العلاقة بين المبيعات والتحصيل والمصروفات خلال الأشهر الأخيرة', 'How sales, collections and expenses relate over recent months')],
            need: [L('متوسط مدة التحصيل الفعلية، وأكبر بنود المصروفات', 'Actual average collection time, and the largest expense lines')],
            start: L('مراجعة آخر ثلاثة أشهر من المبيعات والتحصيل والمصروفات، وبناء صورة واضحة للربح والسيولة قبل أي قرار بخفض التكاليف.', 'Review the last three months of sales, collections and expenses, and build a clear picture of profit and cash before any cost-cutting decision.'),
            services: ['consulting', 'erp']
        },
        delays: {
            phrase: L('تأخرًا أو أخطاء متكررة في العمل', 'recurring delays or errors in the work'),
            check: [L('آلية انتقال العمل وتحديث بياناته بين الأطراف', 'How work and its data move between people')],
            need: [L('المرحلة التي يقضي فيها العمل أطول وقت، ومدة الانتظار الفعلية', 'The stage where work spends the longest, and the actual waiting time')],
            start: L('مراجعة عينة من الطلبات ورسم مسار تنفيذها فعليًا، قبل اقتراح أي تعديل تنظيمي أو تقني.', 'Review a sample of orders and map how they actually flow, before proposing any organizational or technical change.'),
            services: ['erp', 'consulting']
        },
        roles: {
            phrase: L('عدم وضوح في المسؤوليات ومن يقرر', 'unclear responsibilities and decision rights'),
            check: [L('توزيع المسؤوليات وصلاحيات القرار', 'How responsibilities and decision rights are split')],
            need: [L('قائمة المهام المتكررة ومن ينفذها فعليًا اليوم', 'The recurring tasks, and who actually does them today')],
            start: L('رسم خريطة للمهام المتكررة: من ينفذ، ومن يعتمد، ومن يُبلَّغ، ثم مقارنتها بما يحدث فعليًا.', 'Map the recurring tasks (who does, who approves, who is informed) and compare that with what really happens.'),
            services: ['consulting']
        },
        reports: {
            phrase: L('أرقامًا وتقارير لا يُعتمد عليها بثقة', 'numbers and reports you cannot fully rely on'),
            check: [L('مصادر البيانات وطريقة تجميعها', 'Where the data comes from and how it is compiled')],
            need: [L('التقارير التي تعتمد عليها في القرار، ومن يعدها، ومن أين تأتي بياناتها', 'The reports you decide on, who prepares them, and where their data comes from')],
            start: L('اختيار تقرير واحد مهم وتتبع رقم منه حتى مصدره، لمعرفة أين يختلف أو يتأخر.', 'Pick one important report and trace one figure back to its source, to see where it diverges or slows down.'),
            services: ['erp', 'consulting']
        },
        tech: {
            phrase: L('مشكلات في الأنظمة والتقنية', 'problems with systems and technology'),
            check: [],
            need: [L('الأنظمة المستخدمة حاليًا، وأين تبدأ المشكلة ومتى تتكرر', 'The systems in use today, where the problem starts and when it recurs')],
            start: L('جلسة مراجعة للأنظمة الحالية مع من يستخدمها يوميًا، لتحديد ما يحتاج إصلاحًا قبل التفكير في نظام جديد.', 'A review session of current systems with the people who use them daily, to see what needs fixing before considering a new system.'),
            services: ['erp', 'cloud']
        },
        general: {
            phrase: L('أن الأمور لا تسير كما ينبغي', 'that things are not going as they should'),
            check: [L('المواقف التي ذكرتها لمعرفة النمط المشترك بينها', 'The situations you described, to find what they have in common')],
            need: [L('موقفان أو ثلاثة حدثت مؤخرًا بتفاصيل أكثر', 'Two or three recent situations in more detail')],
            start: L('جلسة استماع قصيرة لترتيب المواقف التي ذكرتها، وتحديد المسار الأنسب للبدء.', 'A short listening session to organize the situations you mentioned and choose the best place to start.'),
            services: ['consulting']
        }
    };

    const SERVICES = {
        consulting: { icon: 'fa-briefcase', label: L('الاستشارات المالية والإدارية', 'Financial & management consulting') },
        erp: { icon: 'fa-cubes', label: L('أنظمة ERP مفتوحة المصدر', 'Open-source ERP') },
        cloud: { icon: 'fa-cloud', label: L('السحابة والخوادم', 'Cloud & servers') },
        security: { icon: 'fa-shield-halved', label: L('الأمن السيبراني', 'Cybersecurity') }
    };

    function buildReading() {
        const track = getTrack() || 'general';
        const base = TRACK_READING[track];
        const v = (id) => (answered(id) ? ans(id).v : null);
        const has = (id, val) => { const x = v(id); return Array.isArray(x) ? x.includes(val) : x === val; };
        const check = base.check.slice();
        const need = base.need.slice();
        const services = base.services.slice();
        const notes = [];

        // Sentence: what we understood
        let where = PHRASES.where[v('q05')];
        if (v('c1') === 'between') where = L('بين الأقسام', 'between departments');
        const detailId = { profit: 'p1', delays: 'd1', tech: 's1' }[track];
        const detail = detailId && answered(detailId) && !['unknown', 'other'].includes(v(detailId)) ? labelOf(detailId, v(detailId)) : '';
        const parts = [
            t(L('تلاحظ ', 'You are seeing ')) + t(base.phrase) + (detail ? ` (${t(L('تحديدًا: ', 'specifically: '))}${detail})` : ''),
            PHRASES.activity[v('q04')] && t(PHRASES.activity[v('q04')]),
            where && t(where) + (answered('q05') && ans('q05').text ? ` (${ans('q05').text})` : ''),
            PHRASES.since[v('q06')] && t(PHRASES.since[v('q06')]),
            PHRASES.freq[v('q07')] && t(PHRASES.freq[v('q07')])
        ].filter(Boolean);
        const understood = [parts.join(sep()) + '.'];
        if (has('d3', 'yes')) understood.push(t(L('ويزيد ذلك عند ارتفاع حجم العمل (ارتباط نسجله، وليس سببًا مثبتًا).', 'It gets worse as workload rises (a link we note, not a proven cause).')));
        if (answered('s3') && !['none', 'unknown'].includes(v('s3'))) understood.push(t(L('وبدأت الملاحظة بعد: ', 'You first noticed it after: ')) + labelOf('s3', v('s3')) + t(L(' (تسلسل زمني نسجله دون الجزم بالسبب).', ' (a timeline we note, without assuming the cause).')));
        if (answered('q03') && ans('q03').text) understood.push(t(L('بكلماتك: ', 'In your words: ')) + `«${ans('q03').text}»`);
        if (answered('q10')) understood.push(t(L('جربتم سابقًا: ', 'You tried before: ')) + `«${ans('q10').text}»` + (ans('q10').v ? ` — ${labelOf('q10', ans('q10').v)}` : '') + '.');
        const others = (ans('q01')?.v || []).filter((k) => k !== track && TRACKS[k]);
        if (others.length) understood.push(t(L('ومشكلات أخرى ذكرتها وسنعود لها: ', 'Other issues you raised that we will come back to: ')) + others.map((k) => t(TRACKS[k].label)).join(sep()) + '.');
        if (state.extra) understood.push(t(L('أضفت: ', 'You added: ')) + `«${state.extra}»`);

        // Track-specific checks
        if (track === 'profit') {
            if (has('p1', 'cash')) check.push(L('دورة التحصيل والسداد والمخزون', 'The collection, payment and inventory cycle'));
            if (has('p1', 'lowprofit')) check.push(L('هامش الربح لكل منتج أو خدمة', 'Profit margin per product or service'));
            if (has('p1', 'expenses')) check.push(L('بنود المصروفات الأسرع نموًا', 'The fastest-growing expense lines'));
            if (isRecurring(v('p2'))) check.push(L('متابعة التحصيل وشروط السداد مع العملاء', 'Collections follow-up and customer payment terms'));
            if (['no', 'unknown'].includes(v('p2b'))) need.push(L('من يتابع التحصيل حاليًا، ومتى', 'Who follows up on collections today, and when'));
            if (['partly', 'no', 'unknown'].includes(v('p3')) || v('c2') === 'distrust') check.push(L('وضوح التقارير المالية الدورية والثقة فيها', 'How clear and trusted the regular financial reports are'));
        }
        if (track === 'delays') {
            const d1 = { approval: L('مسار الاعتماد وعدد مستوياته', 'The approval path and its levels'), execution: L('ما يحتاجه التنفيذ ولا يصل في وقته', 'What execution needs but does not get on time'), handoff: L('نقاط تسليم العمل بين الأقسام', 'The handoff points between departments'), delivery: L('خطوات التسليم والمراجعة النهائية', 'Delivery steps and the final check') }[v('d1')];
            if (d1) check.push(d1);
            check.push(L('توزيع المسؤوليات في كل مرحلة', 'Who owns each stage'));
            if (isRecurring(v('d2'))) check.push(L('تكرار إدخال البيانات نفسها في أكثر من مكان', 'The same data being entered in several places'));
            if (answered('d2b')) need.push(L('التحقق من مثال التكرار الذي ذكرته', 'Verifying the duplication example you gave'));
        }
        if (track === 'roles') {
            if (['no', 'unknown'].includes(v('r1b'))) check.push(L('غياب توزيع أو إجراء مكتوب للمهام', 'The lack of a written split of tasks or procedure'));
            if (isRecurring(v('r2'))) check.push(L('تركّز الاعتماد عند شخص واحد', 'Approvals concentrated in one person'));
            if (isRecurring(v('r3'))) check.push(L('تداخل المهام أو سقوطها بين الأطراف', 'Tasks that overlap or fall between people'));
        }
        if (track === 'reports') {
            const n1 = { differ: L('تعريف الأرقام الأساسية بين الأقسام', 'How key figures are defined across departments'), late: L('توقيت إغلاق البيانات وإعداد التقارير', 'When data is closed and reports prepared'), missing: L('اكتمال البيانات عند إدخالها', 'How complete data is at entry'), hard: L('شكل التقارير ومدى ارتباطها بالقرار', 'Report format and how it serves decisions') };
            (v('n1') || []).forEach((k) => n1[k] && check.push(n1[k]));
            if (['multi', 'excel', 'mix'].includes(v('n2'))) check.push(L('خطوات التجميع والمراجعة اليدوية', 'The manual compiling and review steps'));
            if (answered('n3')) need.push(L('مقارنة المثال الذي ذكرته كنقطة تحقق', 'Checking the mismatch you described, as a checkpoint'));
        }
        if (track === 'tech') {
            const s1 = { slow: L('أداء الخوادم والبنية التقنية', 'Server and infrastructure performance'), gap: L('الفجوة بين ما يغطيه النظام وما يحتاجه العمل', 'The gap between what the system covers and what the work needs'), adoption: L('التدريب وطريقة استخدام الفريق للنظام', 'Training and how the team uses the system'), integration: L('الربط بين الأنظمة وتدفق البيانات', 'Integration between systems and data flow'), security: L('إعدادات الحماية والصلاحيات والنسخ الاحتياطي', 'Security settings, permissions and backups') }[v('s1')];
            check.push(s1 || L('طريقة استخدام الأنظمة الحالية', 'How current systems are used'));
            if (isRecurring(v('s2'))) check.push(L('الأعمال التي تتم خارج النظام ثم يعاد إدخالها', 'Work done outside the system and re-entered'));
            if (v('s1') === 'slow') services.splice(0, services.length, 'cloud', 'erp');
            if (v('s1') === 'security') services.splice(0, services.length, 'security', 'cloud');
        }
        if (track === 'general' && answered('u1')) {
            check.push(L('المواقف التي اخترتها: ' + formatAnswer('u1'), 'The situations you picked: ' + formatAnswer('u1')));
        }

        // Impact
        const impact = answered('q08')
            ? ans('q08').v.filter((x) => x !== 'other').map((x) => labelOf('q08', x)).concat(ans('q08').text ? [ans('q08').text] : [])
            : [];

        // What is missing
        const missing = ORDER.filter((id) => state.answers[id]?.skipped && isVisible(id) && Q[id].sum).map((id) => t(Q[id].sum));
        const unknowns = ORDER.filter((id) => answered(id) && isVisible(id) && Q[id].sum && [].concat(ans(id).v).some((x) => x === 'unknown' || x === 'unsure')).map((id) => t(Q[id].sum));
        if (unknowns.length) need.push(L('نقاط أجبت عنها بـ«لا أعرف»: ' + unknowns.join('، '), 'Points you answered "not sure" to: ' + unknowns.join(', ')));
        if (has('q07', 'once')) notes.push(t(L('بما أن المشكلة حدثت مرة واحدة، قد يكفي فحص ذلك الموقف تحديدًا قبل أي تغيير أوسع.', 'Since it happened once, examining that one situation may be enough before any wider change.')));

        return {
            track,
            trackLabel: TRACKS[track] ? t(TRACKS[track].label) : t(L('غير مصنف', 'Unclassified')),
            understood,
            impact,
            check: check.map(t),
            need: need.map(t),
            start: t(base.start),
            notes,
            goal: answered('q11') ? ans('q11').text : '',
            services: services.map((k) => SERVICES[k]),
            missing,
            limits: t(L('هذه قراءة أولية مبنية على إجاباتك، وليست إثباتًا نهائيًا لأسباب المشكلة.', 'This is an initial reading based on your answers. It is not final proof of what causes the problem.'))
        };
    }

    function readingAsText(r) {
        const ar = lang() !== 'en';
        const lines = [];
        const sec = (title, items) => { if (items.length) { lines.push(`*${title}*`); items.forEach((x) => lines.push(`• ${x}`)); lines.push(''); } };
        lines.push(ar ? '*استكشف مع آثر — قراءة أولية*' : '*Explore with Aathr — Initial reading*');
        lines.push((ar ? 'المسار: ' : 'Track: ') + r.trackLabel);
        lines.push('------------------------------------');
        sec(ar ? 'ما فهمناه' : 'What we understood', r.understood);
        sec(ar ? 'الأثر الذي وصفته' : 'The impact you described', r.impact);
        if (r.goal) sec(ar ? 'الفرق المطلوب' : 'The change you want', [r.goal]);
        sec(ar ? 'ما يستحق الفحص' : 'Worth examining', r.check);
        sec(ar ? 'ما نحتاج إلى معرفته' : 'What we still need to know', r.need.concat(r.missing.length ? [(ar ? 'ما تخطيته: ' : 'Skipped: ') + r.missing.join(sep())] : []));
        sec(ar ? 'نقطة البداية المقترحة' : 'Suggested starting point', [r.start].concat(r.notes));
        lines.push('_' + r.limits + '_');
        return lines.join('\n');
    }

    // Every question with the client's exact answer, in Arabic, for the team's email only
    function answersAsText() {
        const ar = (o) => (o == null ? '' : typeof o === 'string' ? o : o.ar);
        const lines = [];
        ORDER.filter((id) => state.answers[id] && isVisible(id) && id !== 'q12').forEach((id, i) => {
            const a = state.answers[id];
            let answer;
            if (a.skipped) answer = '(تخطّى السؤال)';
            else {
                const picked = (Array.isArray(a.v) ? a.v : a.v == null ? [] : [a.v])
                    .map((v) => { const o = optionsOf(id).find((x) => x.v === v); return o ? ar(o.label) : v; });
                answer = picked.concat(a.text ? [`«${a.text}»`] : []).join('، ') || '-';
            }
            lines.push(`${i + 1}. ${ar(resolve(Q[id].title))}`, `   ← ${answer}`);
        });
        if (state.extra) lines.push('+ أضاف العميل في المراجعة:', `   ← «${state.extra}»`);
        return lines.join('\n');
    }

    // ─────────────────────────────────────────────────────────────
    // 9. RENDERING
    // ─────────────────────────────────────────────────────────────
    function render(direction) {
        const station = currentStation();
        const p = Math.round(progress() * 100);
        const view = state.view;

        root.innerHTML = `
            ${renderTrail(station, p)}
            ${resumeOffer ? renderResume() : ''}
            <div class="explore-layout ${view === 'reading' ? 'is-reading' : ''}">
                <div class="explore-stage">
                    ${view === 'reading' ? renderReading() : view === 'review' ? renderReview(direction) : renderQuestion(direction)}
                </div>
                ${view === 'reading' ? '' : renderAside()}
            </div>`;

        bind();
        const heading = root.querySelector('.explore-question-title, .explore-reading-title');
        if (heading && direction) heading.focus({ preventScroll: true });
        if (direction && root.getBoundingClientRect().top < 0) {
            root.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function renderTrail(station, p) {
        return `
            <ol class="explore-trail" style="--trail-progress:${p}%" aria-label="${esc(t(L('مراحل الرحلة', 'Journey stations')))}">
                <span class="trail-line" aria-hidden="true"><span class="trail-line-fill"></span><i class="fas fa-shoe-prints trail-feet"></i></span>
                ${STATIONS.map((s) => `
                    <li class="trail-station ${s.n < station ? 'is-done' : ''} ${s.n === station ? 'is-current' : ''}" ${s.n === station ? 'aria-current="step"' : ''}>
                        <span class="trail-dot"><i class="fas ${s.n < station ? 'fa-check' : s.icon}"></i></span>
                        <span class="trail-name">${esc(t(s.name))}</span>
                        <span class="trail-sub">${esc(t(s.sub))}</span>
                    </li>`).join('')}
            </ol>`;
    }

    function renderResume() {
        return `
            <div class="explore-resume" role="status">
                <i class="fas fa-route"></i>
                <span>${esc(t(L('لديك رحلة لم تكتمل. نكمل من حيث توقفت؟', 'You have an unfinished journey. Pick up where you left off?')))}</span>
                <div class="explore-resume-actions">
                    <button type="button" class="btn btn-primary" data-act="resume">${esc(t(L('أكمل', 'Continue')))}</button>
                    <button type="button" class="explore-link-btn" data-act="dismiss-resume">${esc(t(L('ابدأ من جديد', 'Start over')))}</button>
                </div>
            </div>`;
    }

    function renderNotice() {
        return notice ? `<p class="explore-notice" role="status"><i class="fas fa-heart"></i> ${esc(t(notice))}</p>` : '';
    }

    function renderQuestion(direction) {
        const id = state.current;
        const q = Q[id];
        const opts = optionsOf(id);
        const textCfg = q.text;
        const showText = textCfg && (!textCfg.when || (q.multi ? draft.v.includes(textCfg.when) : draft.v === textCfg.when));
        const singleAuto = !q.multi && opts.length && (!textCfg || (textCfg.when && !showText));
        const stepNo = state.history.length + 1;
        const field = showText ? renderTextField(textCfg) : '';

        return `
            <article class="explore-card ${direction === 'back' ? 'enter-back' : 'enter-forward'} ${q.clarify ? 'is-clarify' : ''}" data-q="${id}">
                ${renderNotice()}
                <p class="explore-step-label">
                    ${q.clarify ? `<i class="fas fa-lightbulb"></i> ${esc(t(L('سؤال توضيح', 'A quick clarification')))}` : `${esc(t(STATIONS[q.st - 1].name))} · ${esc(t(L('خطوة', 'Step')))} ${stepNo}`}
                </p>
                <h2 class="explore-question-title" tabindex="-1">${esc(t(resolve(q.title)))}</h2>
                ${q.hint ? `<p class="explore-hint">${esc(t(q.hint))}</p>` : ''}
                ${textCfg && textCfg.first ? field : ''}
                ${opts.length ? `
                    <div class="explore-options ${opts.some((o) => o.desc) ? 'has-desc' : ''} ${opts.length > 4 && !opts.some((o) => o.desc) ? 'is-dense' : ''}" role="${q.multi ? 'group' : 'radiogroup'}">
                        ${opts.map((o) => {
                            const on = q.multi ? draft.v.includes(o.v) : draft.v === o.v;
                            const full = q.multi && q.max && !on && draft.v.length >= q.max;
                            return `
                            <button type="button" class="explore-option ${on ? 'is-selected' : ''}" data-v="${esc(o.v)}"
                                role="${q.multi ? 'checkbox' : 'radio'}" aria-checked="${on}" ${full ? 'disabled' : ''}>
                                ${o.icon ? `<span class="explore-option-icon"><i class="fas ${o.icon}"></i></span>` : ''}
                                <span class="explore-option-text">
                                    <span class="explore-option-label">${esc(t(o.label))}</span>
                                    ${o.desc ? `<span class="explore-option-desc">${esc(t(o.desc))}</span>` : ''}
                                </span>
                                <span class="explore-option-check" aria-hidden="true"><i class="fas fa-check"></i></span>
                            </button>`;
                        }).join('')}
                    </div>` : ''}
                ${textCfg && !textCfg.first ? field : ''}
                <p class="explore-nudge" hidden></p>
                <div class="explore-actions">
                    ${singleAuto ? `<span class="explore-auto-hint">${esc(t(L('اختر للمتابعة', 'Choose to continue')))}</span>` : `
                    <button type="button" class="btn btn-primary" data-act="next" ${canContinue() ? '' : 'disabled'}>
                        <span>${esc(t(L('متابعة', 'Continue')))}</span> <i class="fas ${lang() === 'en' ? 'fa-arrow-right' : 'fa-arrow-left'}"></i>
                    </button>`}
                    ${!q.noSkip ? `<button type="button" class="explore-link-btn" data-act="skip">${esc(t(L('تخطَّ هذا السؤال', 'Skip this question')))}</button>` : ''}
                    ${state.history.length ? `<button type="button" class="explore-link-btn explore-back" data-act="back"><i class="fas ${lang() === 'en' ? 'fa-arrow-left' : 'fa-arrow-right'}"></i> ${esc(t(L('السابق', 'Back')))}</button>` : ''}
                </div>
            </article>`;
    }

    function renderTextField(cfg) {
        const rows = cfg.rows || 2;
        const ph = esc(t(resolve(cfg.placeholder)));
        return rows > 1
            ? `<textarea class="form-input explore-text" rows="${rows}" placeholder="${ph}">${esc(draft.text || '')}</textarea>`
            : `<input type="text" class="form-input explore-text" placeholder="${ph}" value="${esc(draft.text || '')}">`;
    }

    function renderAside() {
        const entries = summaryEntries();
        return `
            <aside class="explore-aside" aria-live="polite">
                <h3 class="explore-aside-title"><i class="fas fa-feather-pointed"></i> ${esc(t(L('ما فهمناه حتى الآن', 'What we understood so far')))}</h3>
                ${entries.length ? `
                    <ul class="explore-aside-list">
                        ${entries.map((e) => `
                            <li class="${e.id === lastAddedId ? 'is-new' : ''} ${e.skipped ? 'is-skipped' : ''}">
                                <span class="aside-label">${esc(e.label)}</span>
                                <span class="aside-value">${esc(e.value)}</span>
                            </li>`).join('')}
                    </ul>` : `<p class="explore-aside-empty">${esc(t(L('ستظهر هنا الصورة وهي تتشكل مع كل إجابة.', 'The picture will take shape here with every answer.')))}</p>`}
                <p class="explore-aside-foot"><i class="fas fa-lock"></i> ${esc(t(L('لا نرسل شيئًا إلا إذا اخترت التواصل.', 'Nothing is sent unless you choose to get in touch.')))}</p>
            </aside>`;
    }

    function renderReview(direction) {
        const entries = summaryEntries();
        const mode = state.reviewMode;
        return `
            <article class="explore-card ${direction === 'back' ? 'enter-back' : 'enter-forward'}" data-q="q12">
                <p class="explore-step-label">${esc(t(STATIONS[2].name))}</p>
                <h2 class="explore-question-title" tabindex="-1">${esc(t(L('هذا ما فهمناه... هل يعبر عن وضعكم؟', 'Here is what we understood... does it reflect your situation?')))}</h2>
                <ul class="explore-review-list">
                    ${entries.map((e) => `
                        <li class="${e.skipped ? 'is-skipped' : ''}">
                            <span class="aside-label">${esc(e.label)}</span>
                            <span class="aside-value">${esc(e.value)}</span>
                            ${mode === 'edit' && EDITABLE.includes(e.id) ? `<button type="button" class="explore-edit-btn" data-edit="${e.id}"><i class="fas fa-pen"></i> ${esc(t(L('تعديل', 'Edit')))}</button>` : ''}
                        </li>`).join('')}
                </ul>
                ${mode === 'extra' ? `
                    <label class="explore-extra-label" for="exploreExtra">${esc(t(L('ما الذي لم تذكره بعد؟', 'What have you not mentioned yet?')))}</label>
                    <textarea id="exploreExtra" class="form-input explore-text" rows="3" placeholder="${esc(t(L('أضف ما تراه مهمًا...', 'Add anything you think matters...')))}">${esc(state.extra || '')}</textarea>` : ''}
                ${mode === 'edit' ? `<p class="explore-hint">${esc(t(L('اختر الجزء الذي تريد تعديله، وسنعود بك إلى هنا مباشرة.', 'Pick the part to change, and we will bring you straight back here.')))}</p>` : ''}
                <div class="explore-review-choices">
                    <button type="button" class="explore-option" data-review="ok"><span class="explore-option-icon"><i class="fas fa-check"></i></span><span class="explore-option-label">${esc(t(L('صحيح، اعرض القراءة', 'Correct, show my reading')))}</span></button>
                    <button type="button" class="explore-option ${mode === 'edit' ? 'is-selected' : ''}" data-review="edit"><span class="explore-option-icon"><i class="fas fa-pen"></i></span><span class="explore-option-label">${esc(t(L('أريد التعديل', 'I want to edit')))}</span></button>
                    <button type="button" class="explore-option ${mode === 'extra' ? 'is-selected' : ''}" data-review="extra"><span class="explore-option-icon"><i class="fas fa-plus"></i></span><span class="explore-option-label">${esc(t(L('هناك شيء لم أذكره', "There's something I didn't mention")))}</span></button>
                </div>
                <div class="explore-actions">
                    ${mode === 'extra' ? `<button type="button" class="btn btn-primary" data-review="ok"><span>${esc(t(L('أضف واعرض القراءة', 'Add & show my reading')))}</span></button>` : ''}
                    <button type="button" class="explore-link-btn explore-back" data-act="back"><i class="fas ${lang() === 'en' ? 'fa-arrow-left' : 'fa-arrow-right'}"></i> ${esc(t(L('السابق', 'Back')))}</button>
                </div>
            </article>`;
    }

    function renderReading() {
        const r = buildReading();
        const list = (items) => `<ul>${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
        const today = new Date().toLocaleDateString(lang() === 'en' ? 'en-GB' : 'ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
        const choice = state.next;
        const NEXT = [
            { v: 'session', icon: 'fa-calendar-check', label: L('حجز جلسة', 'Book a session'), desc: L('جلسة قصيرة مع مستشار لمناقشة القراءة', 'A short session with a consultant to discuss it') },
            { v: 'contact', icon: 'fa-phone-volume', label: L('طلب تواصل', 'Request a call'), desc: L('نتواصل معك في الوقت المناسب لك', 'We reach out at a time that suits you') },
            { v: 'summary', icon: 'fa-envelope-open-text', label: L('استلام الملخص', 'Email me the summary'), desc: L('نرسل لك القراءة على بريدك', 'We send the reading to your inbox') },
            { v: 'read', icon: 'fa-book-open', label: L('الاكتفاء بالقراءة', 'Just the reading'), desc: L('احفظها وعد لنا متى شئت', 'Save it and come back anytime') }
        ];

        return `
            <section class="explore-reading" aria-labelledby="readingTitle">
                <header class="explore-reading-head">
                    <div>
                        <span class="section-badge"><i class="fas fa-location-dot"></i> ${esc(t(L('نقطة البداية', 'Starting point')))}</span>
                        <h2 class="explore-reading-title" id="readingTitle" tabindex="-1">${esc(t(L('قراءتك الأولية', 'Your initial reading')))}</h2>
                        <p class="explore-reading-meta">${esc(r.trackLabel)} · ${esc(today)}</p>
                    </div>
                    <img src="assets/logo-mark.png" alt="" class="explore-reading-logo" width="56" height="56">
                </header>

                <div class="explore-reading-grid">
                    <div class="reading-block reading-block--wide">
                        <h3><i class="fas fa-eye"></i> ${esc(t(L('ما فهمناه', 'What we understood')))}</h3>
                        ${list(r.understood)}
                    </div>
                    <div class="reading-block">
                        <h3><i class="fas fa-bolt"></i> ${esc(t(L('الأثر الذي وصفته', 'The impact you described')))}</h3>
                        ${r.impact.length ? `<div class="reading-chips">${r.impact.map((x) => `<span>${esc(x)}</span>`).join('')}</div>` : `<p class="reading-muted">${esc(t(L('لم تحدد أثرًا بعد.', 'No impact specified yet.')))}</p>`}
                    </div>
                    <div class="reading-block reading-goal">
                        <h3><i class="fas fa-flag-checkered"></i> ${esc(t(L('الفرق الذي تريد أن تراه', 'The difference you want to see')))}</h3>
                        <p>${r.goal ? `«${esc(r.goal)}»` : `<span class="reading-muted">${esc(t(L('لم تحدده بعد، وسنسألك عنه في أول حديث.', 'Not set yet. We will ask you in our first conversation.')))}</span>`}</p>
                    </div>
                    <div class="reading-block">
                        <h3><i class="fas fa-magnifying-glass"></i> ${esc(t(L('ما يستحق الفحص', 'Worth examining')))}</h3>
                        ${list(r.check)}
                    </div>
                    <div class="reading-block">
                        <h3><i class="fas fa-circle-question"></i> ${esc(t(L('ما نحتاج إلى معرفته', 'What we still need to know')))}</h3>
                        ${list(r.need)}
                        ${r.missing.length ? `<p class="reading-missing"><i class="fas fa-puzzle-piece"></i> ${esc(t(L('ينقص القراءة ما تخطيته: ', 'Missing from this reading (skipped): ')))}${esc(r.missing.join(sep()))}</p>` : ''}
                    </div>
                    <div class="reading-block reading-block--wide reading-start">
                        <span class="reading-pin" aria-hidden="true"><i class="fas fa-location-dot"></i></span>
                        <div>
                            <h3>${esc(t(L('نقطة البداية المقترحة', 'Suggested starting point')))}</h3>
                            <p>${esc(r.start)}</p>
                            ${r.notes.map((n) => `<p class="reading-muted">${esc(n)}</p>`).join('')}
                        </div>
                    </div>
                </div>

                <div class="reading-services">
                    <span>${esc(t(L('قد يرتبط لاحقًا بـ:', 'May later relate to:')))}</span>
                    ${r.services.map((s) => `<a href="services.html"><i class="fas ${s.icon}"></i> ${esc(t(s.label))}</a>`).join('')}
                </div>
                <p class="reading-limits"><i class="fas fa-circle-info"></i> ${esc(r.limits)}</p>
            </section>

            <section class="explore-next" aria-labelledby="nextTitle">
                <h2 class="explore-next-title" id="nextTitle">${esc(t(L('بعد قراءتك الأولية، ما الخطوة المناسبة لك؟', 'After your initial reading, what is the right next step for you?')))}</h2>
                <div class="explore-options has-desc explore-next-options" role="radiogroup">
                    ${NEXT.map((o) => `
                        <button type="button" class="explore-option ${choice === o.v ? 'is-selected' : ''}" data-next="${o.v}" role="radio" aria-checked="${choice === o.v}">
                            <span class="explore-option-icon"><i class="fas ${o.icon}"></i></span>
                            <span class="explore-option-text"><span class="explore-option-label">${esc(t(o.label))}</span><span class="explore-option-desc">${esc(t(o.desc))}</span></span>
                            <span class="explore-option-check" aria-hidden="true"><i class="fas fa-check"></i></span>
                        </button>`).join('')}
                </div>
                ${choice ? renderNextPanel(choice) : ''}
                <div class="explore-actions explore-reading-actions">
                    <button type="button" class="explore-link-btn" data-act="print"><i class="fas fa-file-arrow-down"></i> ${esc(t(L('حفظ القراءة PDF', 'Save reading as PDF')))}</button>
                    <button type="button" class="explore-link-btn" data-act="back"><i class="fas fa-pen"></i> ${esc(t(L('مراجعة الإجابات', 'Review answers')))}</button>
                    <button type="button" class="explore-link-btn" data-act="restart"><i class="fas fa-rotate-left"></i> ${esc(t(L('ابدأ رحلة جديدة', 'Start a new journey')))}</button>
                </div>
            </section>`;
    }

    function renderNextPanel(choice) {
        if (choice === 'read') {
            return `
                <div class="explore-next-panel">
                    <p>${esc(t(L('القراءة محفوظة على هذا الجهاز. يمكنك حفظها كملف PDF، والعودة لنا متى شئت؛ لن نرسل شيئًا.', 'Your reading is saved on this device. You can save it as a PDF and come back anytime; nothing is sent.')))}</p>
                    <button type="button" class="btn btn-primary" data-act="print"><i class="fas fa-file-arrow-down"></i> <span>${esc(t(L('حفظ القراءة PDF', 'Save reading as PDF')))}</span></button>
                </div>`;
        }
        const c = state.contact || {};
        const needEmail = choice === 'summary';
        const field = (key, icon, label, type, ph, required) => `
            <div class="form-group">
                <label for="ex_${key}" class="form-label">${esc(t(label))}${required ? ' *' : ''}</label>
                <div class="input-icon-wrapper">
                    <i class="fas ${icon}"></i>
                    <input type="${type}" id="ex_${key}" data-contact="${key}" class="form-input" value="${esc(c[key] || '')}" placeholder="${esc(ph)}" ${required ? 'required' : ''}>
                </div>
            </div>`;
        return `
            <div class="explore-next-panel">
                <p>${esc(t(L('بياناتك للتواصل فقط، وسترفق القراءة تلقائيًا مع طلبك.', 'Your details are only used to reach you; the reading is attached to your request automatically.')))}</p>
                <div class="form-grid">
                    ${field('name', 'fa-user', L('الاسم', 'Name'), 'text', t(L('الاسم الكريم', 'Your name')), true)}
                    ${field('phone', 'fa-phone', L('الجوال / واتساب', 'Phone / WhatsApp'), 'tel', '+966 / +20 ...', !needEmail)}
                    ${field('email', 'fa-envelope', L('البريد الإلكتروني', 'Email'), 'email', 'name@company.com', needEmail)}
                    ${field('company', 'fa-building', L('اسم الشركة (اختياري)', 'Company (optional)'), 'text', t(L('اسم شركتك', 'Company name')), false)}
                    <div class="form-group">
                        <label for="ex_branch" class="form-label">${esc(t(L('الفرع الأقرب', 'Nearest branch')))}</label>
                        <div class="input-icon-wrapper">
                            <i class="fas fa-location-dot"></i>
                            <select id="ex_branch" data-contact="branch" class="form-input form-select">
                                <option value="ksa" ${c.branch !== 'egypt' ? 'selected' : ''}>${esc(t(L('المملكة العربية السعودية', 'Saudi Arabia')))}</option>
                                <option value="egypt" ${c.branch === 'egypt' ? 'selected' : ''}>${esc(t(L('جمهورية مصر العربية', 'Egypt')))}</option>
                            </select>
                        </div>
                    </div>
                    <input type="text" data-contact="website" class="explore-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
                </div>
                <div class="explore-send">
                    ${needEmail ? '' : `<button type="button" class="btn btn-whatsapp" data-send="whatsapp"><i class="fab fa-whatsapp"></i> <span>${esc(t(L('أرسل عبر واتساب', 'Send via WhatsApp')))}</span></button>`}
                    <button type="button" class="btn ${needEmail ? 'btn-primary' : 'btn-outline-dark'}" data-send="email"><i class="fas fa-envelope"></i> <span>${esc(t(L('أرسل عبر البريد', 'Send via email')))}</span></button>
                </div>
                <p class="explore-send-status" role="status" hidden></p>
            </div>`;
    }

    // ─────────────────────────────────────────────────────────────
    // 10. EVENTS
    // ─────────────────────────────────────────────────────────────
    function bind() {
        root.querySelectorAll('.explore-card[data-q] .explore-option[data-v]').forEach((btn) => btn.addEventListener('click', () => pick(btn.dataset.v)));

        const textEl = root.querySelector('.explore-card[data-q] .explore-text');
        if (textEl && state.view === 'question') {
            textEl.addEventListener('input', () => {
                draft.text = textEl.value;
                const nextBtn = root.querySelector('[data-act="next"]');
                if (nextBtn) nextBtn.disabled = !canContinue();
            });
            textEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && textEl.tagName === 'INPUT' && canContinue()) { e.preventDefault(); tryContinue(); }
            });
        }

        root.querySelectorAll('[data-act]').forEach((btn) => btn.addEventListener('click', () => {
            const act = btn.dataset.act;
            if (act === 'next') tryContinue();
            else if (act === 'skip') commit(true);
            else if (act === 'back') back();
            else if (act === 'restart') startOver();
            else if (act === 'print') window.print();
            else if (act === 'resume') { state = resumeOffer; resumeOffer = null; draft = cloneAnswer(ans(state.current)); render('forward'); }
            else if (act === 'dismiss-resume') { resumeOffer = null; clearSaved(); render(); }
        }));

        root.querySelectorAll('[data-review]').forEach((btn) => btn.addEventListener('click', () => {
            const mode = btn.dataset.review;
            const extraEl = root.querySelector('#exploreExtra');
            if (extraEl) state.extra = extraEl.value.trim();
            if (mode === 'ok') { state.view = 'reading'; state.reviewMode = null; save(); render('forward'); return; }
            state.reviewMode = state.reviewMode === mode ? null : mode;
            render();
        }));

        root.querySelectorAll('[data-edit]').forEach((btn) => btn.addEventListener('click', () => {
            state.returnTo = 'q12';
            state.reviewMode = null;
            notice = null;
            goTo(btn.dataset.edit, 'back');
        }));

        root.querySelectorAll('[data-next]').forEach((btn) => btn.addEventListener('click', () => {
            readContact();
            state.next = btn.dataset.next;
            save();
            render();
            root.querySelector('.explore-next-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }));

        root.querySelectorAll('[data-contact]').forEach((el) => el.addEventListener('change', () => { readContact(); save(); }));
        root.querySelectorAll('[data-send]').forEach((btn) => btn.addEventListener('click', () => send(btn.dataset.send, btn)));
    }

    function pick(v) {
        const q = Q[state.current];
        clearTimeout(advanceTimer);
        if (q.multi) {
            if (q.exclusive && v === q.exclusive) draft.v = draft.v.includes(v) ? [] : [v];
            else {
                draft.v = draft.v.filter((x) => x !== q.exclusive);
                draft.v = draft.v.includes(v) ? draft.v.filter((x) => x !== v) : draft.v.concat(v);
            }
        } else {
            draft.v = v;
        }
        const textEl = root.querySelector('.explore-card .explore-text');
        if (textEl) draft.text = textEl.value;
        notice = null;
        render();

        // Single choice auto-advances, unless it opens a text field (e.g. "Other") or has a free-text part
        if (!q.multi && optionsOf(state.current).length && (!q.text || (q.text.when && q.text.when !== v))) {
            advanceTimer = setTimeout(() => commit(false), AUTO_ADVANCE_MS);
        } else if (q.text && q.text.when === v && !q.multi) {
            root.querySelector('.explore-card .explore-text')?.focus();
        }
    }

    let nudged = false;
    function tryContinue() {
        if (!canContinue()) return;
        const q = Q[state.current];
        const text = (draft.text || '').trim();
        // Very general description → ask once for one recent, concrete situation
        if (state.current === 'q03' && text.length < 25 && !nudged) {
            nudged = true;
            const n = root.querySelector('.explore-nudge');
            if (n) {
                n.textContent = t(L('هل يمكنك ذكر موقف واحد حدث مؤخرًا؟ التفاصيل الصغيرة تساعدنا كثيرًا. (يمكنك المتابعة كما هو)', 'Could you describe one situation that happened recently? Small details help a lot. (You can also continue as is.)'));
                n.hidden = false;
            }
            return;
        }
        nudged = false;
        if (q.multi && !q.text) draft.text = '';
        commit(false);
    }

    function readContact() {
        state.contact = state.contact || {};
        root.querySelectorAll('[data-contact]').forEach((el) => { state.contact[el.dataset.contact] = el.value.trim(); });
    }

    function setStatus(msg, ok) {
        const el = root.querySelector('.explore-send-status');
        if (!el) return;
        el.textContent = msg;
        el.className = `explore-send-status form-status-alert ${ok ? 'success' : 'error'}`;
        el.hidden = false;
    }

    function send(channel, btn) {
        readContact();
        save();
        const c = state.contact;
        const ar = lang() !== 'en';
        const needEmail = state.next === 'summary' || channel === 'email';
        if (!c.name || (!needEmail && !c.phone) || (needEmail && !/^\S+@\S+\.\S+$/.test(c.email || ''))) {
            setStatus(ar ? (needEmail ? 'يرجى كتابة الاسم وبريد إلكتروني صحيح.' : 'يرجى كتابة الاسم ورقم الجوال.') : (needEmail ? 'Please enter your name and a valid email.' : 'Please enter your name and phone number.'), false);
            return;
        }
        const r = buildReading();
        const choiceLabel = { session: ar ? 'حجز جلسة' : 'Book a session', contact: ar ? 'طلب تواصل' : 'Request a call', summary: ar ? 'استلام الملخص' : 'Email the summary' }[state.next];
        const branchName = c.branch === 'egypt' ? (ar ? 'جمهورية مصر العربية' : 'Egypt') : (ar ? 'المملكة العربية السعودية' : 'Saudi Arabia');

        if (channel === 'whatsapp') {
            const number = c.branch === 'egypt' ? '201289609100' : '966545469150';
            const head = ar
                ? `*طلب من رحلة «استكشف مع آثر»*\n*الطلب:* ${choiceLabel}\n*الاسم:* ${c.name}\n*الجوال:* ${c.phone}\n` + (c.company ? `*الشركة:* ${c.company}\n` : '') + (c.email ? `*البريد:* ${c.email}\n` : '')
                : `*Request from "Explore with Aathr"*\n*Request:* ${choiceLabel}\n*Name:* ${c.name}\n*Phone:* ${c.phone}\n` + (c.company ? `*Company:* ${c.company}\n` : '') + (c.email ? `*Email:* ${c.email}\n` : '');
            window.open(`https://wa.me/${number}?text=${encodeURIComponent(head + '\n' + readingAsText(r))}`, '_blank');
            setStatus(ar ? 'تم فتح واتساب ومعه قراءتك. أرسل الرسالة وسنرد عليك قريبًا.' : 'WhatsApp opened with your reading. Send the message and we will reply soon.', true);
            return;
        }

        const original = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>${ar ? 'جاري الإرسال...' : 'Sending...'}</span>`;
        fetch('send-email.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: c.name,
                company: c.company || '-',
                email: c.email || '-',
                phone: c.phone || '-',
                serviceName: `${choiceLabel} · ${r.trackLabel}`,
                branchKey: c.branch || 'ksa',
                branchName,
                message: readingAsText(r),
                answers: answersAsText(),
                website: c.website || '',
                source: 'explore',
                sendCopy: state.next === 'summary',
                lang: lang()
            })
        })
            .then((res) => res.json())
            .then((data) => {
                if (!data.success) throw new Error();
                const copyFailed = /copy failed/.test(data.message || '');
                if (state.next === 'summary' && !copyFailed) setStatus(ar ? `أرسلنا قراءتك إلى ${c.email}. إن لم تجدها، تحقق من مجلد الرسائل غير المرغوب فيها.` : `We sent your reading to ${c.email}. If you can't find it, check your spam folder.`, true);
                else if (copyFailed) setStatus(ar ? 'وصلنا طلبك، لكن تعذر إرسال النسخة إلى بريدك. سنرسلها لك يدويًا قريبًا.' : "We received your request, but couldn't email you a copy. We'll send it to you shortly.", true);
                else setStatus(ar ? 'وصلتنا قراءتك وطلبك. سيتواصل معك أحد مستشارينا خلال ساعات العمل.' : 'We received your reading and request. A consultant will be in touch during working hours.', true);
            })
            .catch(() => setStatus(ar ? 'تعذر الإرسال عبر البريد. جرّب واتساب أو حاول مرة أخرى.' : 'Could not send by email. Try WhatsApp or try again.', false))
            .finally(() => { btn.disabled = false; btn.innerHTML = original; });
    }

    // ─────────────────────────────────────────────────────────────
    // 11. INIT: ?start=<track> from the homepage, resume, language sync
    // ─────────────────────────────────────────────────────────────
    function init() {
        const params = new URLSearchParams(window.location.search);
        const start = params.get('start');
        const saved = load();
        const validStart = start && (TRACKS[start] || start === 'unknown');

        if (validStart) {
            state = freshState();
            state.answers.q01 = { v: [start], text: '' };
            state.history.push('q01');
            state.current = nextId('q01');
            history.replaceState(null, '', window.location.pathname);
            save();
        } else if (saved && (saved.history.length || saved.view !== 'question')) {
            resumeOffer = saved;
        }

        state.view = state.current === 'q12' ? 'review' : state.view;
        draft = cloneAnswer(ans(state.current));
        render();
    }

    new MutationObserver(() => { if (draft) render(); }).observe(htmlEl, { attributes: true, attributeFilter: ['lang'] });

    init();
})();
