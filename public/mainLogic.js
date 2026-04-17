
lucide.createIcons();

// UI Interactions
document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('hidden');
});

document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('mobile-menu').classList.add('hidden');
    });
});

function toggleFaq(item) {
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
}

let isYearly = false;
const pricingBtn = document.getElementById('pricing-toggle');
if (pricingBtn) {
    pricingBtn.addEventListener('click', () => {
        isYearly = !isYearly;
        const knob = document.getElementById('toggle-knob');
        const ml = document.getElementById('toggle-monthly-label');
        const yl = document.getElementById('toggle-yearly-label');
        const price = document.getElementById('premium-price');
        const period = document.getElementById('premium-period');
        if (isYearly) {
            knob.style.transform = 'translateX(28px)';
            ml.classList.replace('text-white', 'text-slate-400'); ml.classList.replace('font-semibold', 'font-medium');
            yl.classList.replace('text-slate-400', 'text-white'); yl.classList.replace('font-medium', 'font-semibold');
            price.textContent = 'Rp 659k'; period.textContent = '/tahun (Rp 55k/bln)';
        } else {
            knob.style.transform = 'translateX(0)';
            yl.classList.replace('text-white', 'text-slate-400'); yl.classList.replace('font-semibold', 'font-medium');
            ml.classList.replace('text-slate-400', 'text-white'); ml.classList.replace('font-medium', 'font-semibold');
            price.textContent = 'Rp 79k'; period.textContent = '/bulan';
        }
    });
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); } });
}, { threshold: 0.1 });
document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

// --- INTEGRASI PHP (REGISTER, LOGIN, UPDATE PROFILE) ---
let currentUser = null;

async function fetchUserHistory() {
    if (!currentUser) return;
    try {
        const res = await fetch('/api/history');
        const data = await res.json();
        if (data.status === 'success') {
            const formattedHistory = data.history.map(item => {
                let scores = [];
                let contentObj = item.content;
                if (item.type === 'interview') {
                    try {
                        contentObj = JSON.parse(item.content);
                    } catch (e) { }
                    scores = [item.score];
                }

                return {
                    sessionId: item.session_id,
                    type: item.type,
                    score: item.score,
                    scores: scores,
                    date: item.created_at,
                    detail: item.detail,
                    content: contentObj,
                    title: item.title
                };
            });
            formattedHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
            currentUser.history = formattedHistory;
            localStorage.setItem('lk_active_user_data', JSON.stringify(currentUser));
            updateDashboardStats();
        }
    } catch (e) {
        console.error("Gagal mengambil riwayat dari database:", e);
    }
}

function checkAuthState() {
    // Karena PHP menangani session/database, kita ambil data user aktif dari localStorage 
    // yang diset saat login sukses dari PHP.
    const storedUser = localStorage.getItem('lk_active_user_data');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        fetchUserHistory();
    }

    const guestControls = document.getElementById('nav-controls-guest');
    const userControls = document.getElementById('nav-controls-user');
    const mobileLogout = document.getElementById('mobile-menu-logout');

    if (currentUser) {
        if (guestControls) guestControls.classList.add('hidden');
        if (userControls) { userControls.classList.remove('hidden'); userControls.classList.add('flex'); }
        if (mobileLogout) { mobileLogout.classList.remove('hidden'); mobileLogout.classList.add('block'); }

        document.getElementById('dash-name-display').innerText = currentUser.name;
        document.getElementById('dash-email-display').innerText = currentUser.email;
        document.getElementById('dash-avatar').innerText = currentUser.name.charAt(0).toUpperCase();

        document.getElementById('prof-name').value = currentUser.name;
        document.getElementById('prof-email').value = currentUser.email;

        // Update Bottom CTA for logged in
        const regTag = document.getElementById('reg-section-tag');
        if (regTag) {
            regTag.innerText = 'DASHBOARD';
            document.getElementById('reg-section-title').innerHTML = `Halo, <span class="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">${currentUser.name}!</span>`;
            document.getElementById('reg-section-subtitle').innerText = 'Lanjutkan persiapan kariermu. Cek CV atau mulai simulasi interview sekarang.';
            const ctaBtn = document.getElementById('reg-section-btn');
            if (ctaBtn) {
                ctaBtn.setAttribute('onclick', 'showDashboard()');
                ctaBtn.innerHTML = '<span class="flex items-center justify-center gap-2"><i data-lucide="layout-dashboard" class="w-5 h-5"></i> Buka Dashboard</span>';
            }
        }

        const heroHeadline = document.getElementById('hero-headline');
        if (heroHeadline) {
            heroHeadline.innerHTML = `Selamat datang kembali,<br><span class="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">${currentUser.name}</span>`;
            document.getElementById('hero-subheadline').innerText = "Lanjutkan latihanmu sekarang, lihat progress, dan ambil sesi berikutnya di dashboard.";
            const btnWrap = document.getElementById('hero-subheadline').nextElementSibling;
            if (btnWrap) {
                const primaryBtn = btnWrap.querySelector('button');
                if (primaryBtn) {
                    primaryBtn.setAttribute('onclick', 'showDashboard()');
                    primaryBtn.innerHTML = '<span class="flex items-center justify-center gap-2"><i data-lucide="layout-dashboard" class="w-5 h-5"></i> Buka Dashboard</span>';
                    primaryBtn.classList.remove('animate-pulse-glow');
                }
            }
        }
        lucide.createIcons();
    } else {
        if (guestControls) guestControls.classList.remove('hidden');
        if (userControls) { userControls.classList.add('hidden'); userControls.classList.remove('flex'); }
        if (mobileLogout) { mobileLogout.classList.add('hidden'); mobileLogout.classList.remove('block'); }

        // Revert Bottom CTA for guest
        const regTag = document.getElementById('reg-section-tag');
        if (regTag) {
            regTag.innerText = 'Mulai Sekarang';
            document.getElementById('reg-section-title').innerHTML = 'Siap Raih <span class="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Karier Impianmu?</span>';
            document.getElementById('reg-section-subtitle').innerText = 'Daftar gratis dalam 30 detik. Tanpa kartu kredit.';
            const ctaBtn = document.getElementById('reg-section-btn');
            if (ctaBtn) {
                ctaBtn.setAttribute('onclick', "toggleAuthModal(true, 'register')");
                ctaBtn.innerHTML = '<span class="flex items-center justify-center gap-2"><i data-lucide="rocket" class="w-5 h-5"></i> Buat Akun Sekarang</span>';
            }
        }

        const heroHeadline = document.getElementById('hero-headline');
        if (heroHeadline) {
            heroHeadline.innerHTML = `CV Ditolak ATS?<br><span class="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Grogi Saat Interview?</span>`;
            document.getElementById('hero-subheadline').innerText = "Latihan interview dengan AI realistis & cek CV lolos ATS — kapan saja, di mana saja. Langkah pertamamu menuju karier impian, mulai sekarang.";
            const btnWrap = document.getElementById('hero-subheadline').nextElementSibling;
            if (btnWrap) {
                const primaryBtn = btnWrap.querySelector('button');
                if (primaryBtn) {
                    primaryBtn.setAttribute('onclick', "toggleAuthModal(true, 'register')");
                    primaryBtn.innerHTML = '<span class="flex items-center justify-center gap-2"><i data-lucide="zap" class="w-5 h-5"></i> Coba Gratis Sekarang</span>';
                    primaryBtn.classList.add('animate-pulse-glow');
                }
            }
        }
        lucide.createIcons();

        showLandingPage();
    }
}

function toggleAuthModal(show, mode = 'login') {
    const modal = document.getElementById('auth-modal');
    if (show) {
        modal.classList.remove('hidden'); modal.classList.add('flex');
        switchAuthMode(mode);
        document.querySelectorAll('input[type="text"]').forEach(i => {
            if (i.id.includes('password') || i.id === 'reg-password') i.type = 'password';
        });
        document.querySelectorAll('.icon-show').forEach(i => i.classList.remove('hidden'));
        document.querySelectorAll('.icon-hide').forEach(i => i.classList.add('hidden'));
    }
    else { modal.classList.add('hidden'); modal.classList.remove('flex'); }
}

function switchAuthMode(mode) {
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');

    if (mode === 'register') {
        formLogin.classList.add('hidden');
        formRegister.classList.remove('hidden');
        title.innerText = 'Buat Akun Baru';
        subtitle.innerText = 'Daftar gratis untuk mulai berlatih interview dan review CV.';
    } else {
        formRegister.classList.add('hidden');
        formLogin.classList.remove('hidden');
        title.innerText = 'Masuk ke Akun';
        subtitle.innerText = 'Mulai latihan interview dan cek ATS CV kamu.';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>`;
    btn.disabled = true;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const result = await response.json();

        if (result.status === 'success') {
            alert(result.message);
            switchAuthMode('login');
            e.target.reset();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menghubungi server database.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>`;
    btn.disabled = true;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json();

        if (result.status === 'success') {
            // Sesi Berhasil
            result.user.history = [];
            currentUser = result.user;
            localStorage.setItem('lk_active_user_data', JSON.stringify(result.user));

            toggleAuthModal(false);
            checkAuthState();
            showDashboard();
            fetchUserHistory();
            e.target.reset();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan koneksi ke server database.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function logout() {
    localStorage.removeItem('lk_active_user_data');
    currentUser = null;
    document.getElementById('mobile-menu').classList.add('hidden');
    checkAuthState();
}

function saveProfileProcess(e) {
    // Karena profil terkait database, idealnya ada update.php.
    // Tapi untuk sementara kita simpan perubahannya di localStorage (Sesi Aktif)
    if (e) e.preventDefault();

    const newName = document.getElementById('prof-name').value.trim();
    const newEmail = document.getElementById('prof-email').value.trim();

    currentUser.name = newName;
    currentUser.email = newEmail;
    localStorage.setItem('lk_active_user_data', JSON.stringify(currentUser));

    checkAuthState();

    const msg = document.getElementById('prof-save-msg');
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 3000);
}

function changePasswordProcess(e) {
    if (e) e.preventDefault();
    const oldPass = document.getElementById('prof-old-pass').value;
    const newPass = document.getElementById('prof-new-pass').value;
    const confirmPass = document.getElementById('prof-confirm-pass').value;

    if (!oldPass || !newPass || !confirmPass) {
        alert('Mohon isi semua text form password.');
        return;
    }

    if (newPass !== confirmPass) {
        alert('Konfirmasi password baru tidak sesuai.');
        return;
    }

    if (newPass.length < 6) {
        alert('Password baru harus minimal 6 karakter.');
        return;
    }

    // Simulasi sukses untuk frontend test
    // Idealnya call fetch() ke backend supabase endpoint /api/auth/update
    
    document.getElementById('prof-old-pass').value = '';
    document.getElementById('prof-new-pass').value = '';
    document.getElementById('prof-confirm-pass').value = '';

    const msg = document.getElementById('pass-save-msg');
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 3000);
}

// --- DASHBOARD NAVIGATION ---
function showLandingPage() {
    document.getElementById('landing-page-content').style.display = 'block';
    document.getElementById('dashboard-view').style.display = 'none';

    const navCenter = document.getElementById('nav-links-center');
    if (navCenter) navCenter.style.display = '';
}

function showDashboard() {
    if (!currentUser) return toggleAuthModal(true, 'login');
    document.getElementById('landing-page-content').style.display = 'none';
    document.getElementById('dashboard-view').style.display = 'block';

    const navCenter = document.getElementById('nav-links-center');
    if (navCenter) navCenter.style.display = 'none';

    switchTab('tab-progress');
}

function switchTab(tabId) {
    ['tab-progress', 'tab-ai', 'tab-interview', 'tab-profile'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
        const btn = document.getElementById('btn-' + id);
        btn.className = 'shrink-0 w-auto lg:w-full flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:py-3 rounded-xl hover:bg-white/5 text-slate-300 font-medium transition text-xs sm:text-sm snap-start';
    });
    document.getElementById(tabId).classList.remove('hidden');

    let activeColor = 'indigo';
    if (tabId === 'tab-interview') activeColor = 'purple';
    if (tabId === 'tab-progress') activeColor = 'emerald';
    if (tabId === 'tab-profile') activeColor = 'pink';

    const activeBtn = document.getElementById('btn-' + tabId);
    activeBtn.className = `shrink-0 w-auto lg:w-full flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:py-3 rounded-xl bg-${activeColor}-500/20 text-${activeColor}-300 font-medium transition text-xs sm:text-sm snap-start`;

    if (tabId === 'tab-progress') {
        setTimeout(() => {
            initProgressChart();
            updateDashboardStats();
        }, 100);
    }
}

// --- PAYMENT MODAL LOGIC ---
let currentSessionId = null;

function toggleBundleModal(show) {
    if (!currentUser) {
        toggleAuthModal(true, 'register');
        return;
    }
    const modal = document.getElementById('bundle-modal');
    if (show) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function proceedToPaymentFromBundle() {
    const selected = document.querySelector('input[name="bundle_choice"]:checked').value;
    const [planName, priceStr] = selected.split('|');
    toggleBundleModal(false);
    handlePurchase('Bundle ' + planName, priceStr);
}

function handlePurchase(planName, priceStr) {
    if (!currentUser) {
        toggleAuthModal(true, 'register');
        return;
    }
    if (planName === 'Premium' && isYearly) {
        priceStr = 'Rp 659.000';
    }
    if (planName === 'Gratis') {
        showDashboard();
        return;
    }
    document.getElementById('pay-plan-name').innerText = 'Paket ' + planName;
    document.getElementById('pay-plan-price').innerText = priceStr;
    togglePaymentModal(true);
}

function togglePaymentModal(show) {
    const modal = document.getElementById('payment-modal');
    if (show) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

async function processPayment(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-process-payment');
    const planName = document.getElementById('pay-plan-name').innerText.replace('Paket ', '');
    const amountStr = document.getElementById('pay-plan-price').innerText.replace(/[^0-9]/g, '');
    const amount = parseInt(amountStr, 10);

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> <span>Memproses...</span>`;

    try {
        const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan_name: planName, amount: amount, status: 'success' })
        });

        if (!response.ok) throw new Error('Transaction failed');

        btn.innerHTML = `<i data-lucide="check-circle" class="w-5 h-5"></i> <span>Pembayaran Berhasil!</span>`;
        btn.classList.replace('from-indigo-600', 'from-emerald-500');
        btn.classList.replace('to-purple-600', 'to-teal-500');
        lucide.createIcons();

        setTimeout(() => {
            togglePaymentModal(false);
            btn.disabled = false;
            btn.innerHTML = originalText;
            btn.className = "cta-btn w-full py-3 rounded-xl text-sm font-bold flex justify-center items-center gap-2 mt-auto shrink-0";
            showDashboard();
            alert("Pembayaran berhasil disimulasikan dan disimpan ke database. Akun Anda telah ditingkatkan!");
        }, 1500);

    } catch (error) {
        console.error(error);
        alert("Gagal memproses pembayaran ke database.");
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function togglePassword(inputId, btnEl) {
    const input = document.getElementById(inputId);
    const iconShow = btnEl.querySelector('.icon-show');
    const iconHide = btnEl.querySelector('.icon-hide');

    if (input.type === "password") {
        input.type = "text";
        iconShow.classList.add('hidden');
        iconHide.classList.remove('hidden');
    } else {
        input.type = "password";
        iconShow.classList.remove('hidden');
        iconHide.classList.add('hidden');
    }
}

function toggleHistoryModal(show) {
    const modal = document.getElementById('history-modal');
    if (show) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

let currentViewedHistoryIndex = null;

function viewHistoryDetail(index) {
    if (!currentUser || !currentUser.history || !currentUser.history[index]) return;
    currentViewedHistoryIndex = index;
    const item = currentUser.history[index];

    const titleEl = document.getElementById('history-modal-title');
    const dateEl = document.getElementById('history-modal-date');
    const scoreEl = document.getElementById('history-modal-score');
    const bodyEl = document.getElementById('history-modal-body');

    const d = new Date(item.date);
    dateEl.innerText = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ' • ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    scoreEl.innerText = item.score;

    if (item.type === 'cv') {
        titleEl.innerText = 'Hasil Koreksi CV AI';
        scoreEl.className = 'text-2xl font-bold text-indigo-400';

        if (item.content) {
            bodyEl.innerHTML = `<div class="markdown-body text-sm max-w-none">${marked.parse(item.content)}</div>`;
        } else {
            bodyEl.innerHTML = `<p class="text-slate-400 text-center italic">Konten detail tidak tersedia untuk riwayat lama ini.</p>`;
        }
    } else if (item.type === 'interview') {
        titleEl.innerText = 'Riwayat Simulasi Interview';
        scoreEl.className = 'text-2xl font-bold text-purple-400';

        if (item.content && Array.isArray(item.content)) {
            let chatHtml = `<div class="space-y-4">`;
            item.content.forEach(msg => {
                if (msg.role === 'system') return;
                const isUser = msg.role === 'user';
                const align = isUser ? 'justify-end' : 'justify-start';
                const bg = isUser ? 'bg-purple-600/20 border-purple-500/30 text-white' : 'bg-slate-800/80 border-white/10 text-slate-200';
                const icon = isUser ? '<i data-lucide="user" class="w-4 h-4 text-purple-400"></i>' : '<i data-lucide="bot" class="w-4 h-4 text-indigo-400"></i>';

                chatHtml += `
                        <div class="flex ${align}">
                            <div class="max-w-[90%] sm:max-w-[85%] flex gap-2 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}">
                                <div class="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0 border border-white/10">
                                    ${icon}
                                </div>
                                <div class="p-3 sm:p-4 rounded-xl border ${bg} markdown-body text-xs sm:text-sm shadow-lg overflow-hidden">
                                    ${marked.parse(msg.content)}
                                </div>
                            </div>
                        </div>
                    `;
            });
            chatHtml += `</div>`;
            bodyEl.innerHTML = chatHtml;
        } else {
            bodyEl.innerHTML = `<p class="text-slate-400 text-center italic">Konten chat tidak tersedia untuk riwayat lama ini.</p>`;
        }
    }

    if (item.type === 'interview') {
        document.getElementById('history-modal-footer').classList.remove('hidden');
    } else {
        document.getElementById('history-modal-footer').classList.add('hidden');
    }

    lucide.createIcons();
    toggleHistoryModal(true);
}

function resumeInterviewFromHistory() {
    if (currentViewedHistoryIndex === null) return;
    const item = currentUser.history[currentViewedHistoryIndex];
    if (!item || item.type !== 'interview') return;

    toggleHistoryModal(false);
    showDashboard();
    switchTab('tab-interview');

    document.getElementById('interview-setup').classList.add('hidden');
    document.getElementById('interview-chat-container').classList.remove('hidden');
    document.getElementById('interview-chat-container').classList.add('flex');

    const roleDetail = item.detail || "Posisi: Umum";
    const roleStr = roleDetail.replace('Posisi: ', '').trim();
    document.getElementById('chat-role-indicator').innerText = `HR - ${roleStr}`;

    currentSessionId = item.sessionId;
    interviewMessages = item.content || [];
    
    renderChat();
}

// --- DASHBOARD DATA & HISTORY LOGIC ---
function updateDashboardStats() {
    if (!currentUser) return;
    if (!currentUser.history) currentUser.history = [];

    const history = currentUser.history;
    const cvs = history.filter(h => h.type === 'cv');
    const ints = history.filter(h => h.type === 'interview');

    const avgCv = cvs.length ? Math.round(cvs.reduce((sum, h) => sum + h.score, 0) / cvs.length) : 0;
    const avgInt = ints.length ? Math.round(ints.reduce((sum, h) => sum + h.score, 0) / ints.length) : 0;

    const uniqueSessions = new Set(ints.map(h => h.sessionId));
    const total = cvs.length + uniqueSessions.size;

    document.getElementById('stat-avg-cv').innerText = avgCv;
    document.getElementById('stat-avg-int').innerText = avgInt;
    document.getElementById('stat-total').innerText = total;

    const listContainer = document.getElementById('history-list');
    const emptyState = document.getElementById('history-empty');

    if (total === 0) {
        listContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        listContainer.classList.remove('hidden');
        listContainer.innerHTML = '';

        const historyWithIndex = history.map((item, index) => ({ ...item, originalIndex: index }));
        const recent = historyWithIndex.reverse().slice(0, 5);

        recent.forEach(item => {
            const isCv = item.type === 'cv';
            const icon = isCv ? 'file-check' : 'mic';
            const color = isCv ? 'indigo' : 'purple';
            const title = isCv ? 'Koreksi CV AI' : 'Simulasi Interview';

            const d = new Date(item.date);
            const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ', ' +
                d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

            listContainer.innerHTML += `
                    <div onclick="viewHistoryDetail(${item.originalIndex})" class="bg-slate-900/50 hover:bg-slate-800/80 cursor-pointer rounded-xl p-4 border border-white/5 flex items-center justify-between gap-3 animate-fade-up transition">
                        <div class="flex items-center gap-3 overflow-hidden">
                            <div class="w-10 h-10 rounded-full bg-${color}-500/20 text-${color}-400 flex items-center justify-center shrink-0">
                                <i data-lucide="${icon}" class="w-5 h-5"></i>
                            </div>
                            <div class="truncate">
                                <h4 class="font-bold text-sm text-white truncate">${title}</h4>
                                <p class="text-xs text-slate-400 truncate">${item.detail} • ${dateStr}</p>
                            </div>
                        </div>
                        <div class="shrink-0 text-right">
                            <div class="text-lg font-bold text-${color}-400">${item.score}</div>
                            <div class="text-[10px] text-slate-500 uppercase tracking-wider">Skor</div>
                        </div>
                    </div>
                `;
        });
        lucide.createIcons();
    }

    if (window.progressChartInstance) {
        const cvScores = cvs.slice(-6).map(c => c.score);
        const intScores = ints.slice(-6).map(i => i.score);
        const maxLen = Math.max(cvScores.length, intScores.length, 1);

        const chartLabels = [];
        for (let i = 0; i < maxLen; i++) {
            chartLabels.push('Sesi ' + (i + 1));
        }

        window.progressChartInstance.data.labels = chartLabels;
        window.progressChartInstance.data.datasets[0].data = cvScores;
        window.progressChartInstance.data.datasets[1].data = intScores;
        window.progressChartInstance.update();
    }
}

async function clearHistory() {
    if (!currentUser || !currentUser.history || currentUser.history.length === 0) return;
    if (confirm("Apakah Anda yakin ingin menghapus seluruh riwayat latihan? Data ini tidak dapat dikembalikan.")) {
        try {
            await fetch('/api/history', { method: 'DELETE' });
            currentUser.history = [];
            localStorage.setItem('lk_active_user_data', JSON.stringify(currentUser));
            updateDashboardStats();
            alert("Riwayat berhasil dihapus.");
        } catch (e) {
            alert("Gagal menghapus riwayat dari database.");
        }
    }
}

function initProgressChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    if (window.progressChartInstance) return;

    const isMobile = window.innerWidth < 768;

    window.progressChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Sesi 1'],
            datasets: [
                {
                    label: 'Skor CV',
                    data: [],
                    borderColor: '#818cf8',
                    backgroundColor: 'rgba(129, 140, 248, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: isMobile ? 2 : 4
                },
                {
                    label: 'Skor Interview',
                    data: [],
                    borderColor: '#c084fc',
                    backgroundColor: 'rgba(192, 132, 252, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: isMobile ? 2 : 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8', font: { size: isMobile ? 10 : 12 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', font: { size: isMobile ? 10 : 12 } }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#e2e8f0',
                        boxWidth: isMobile ? 10 : 40,
                        font: { family: "'Outfit', sans-serif", size: isMobile ? 10 : 12 }
                    }
                }
            }
        }
    });
}



// --- CV DROPZONE & EXTRACTION ---
let extractedCvText = "";

window.handleFileInput = function (e) {
    if (e.target.files && e.target.files[0]) {
        processFile(e.target.files[0]);
    }
};

async function processFile(file) {
    if (!file) return;

    // Validasi Ukuran (Maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB!");
        return;
    }

    const nameDisplay = document.getElementById('file-name-display');
    if (nameDisplay) nameDisplay.innerText = file.name;

    const btnAnalyze = document.getElementById('btn-analyze');
    if (btnAnalyze) {
        btnAnalyze.disabled = false;
        btnAnalyze.classList.remove('cursor-not-allowed', 'bg-slate-800', 'text-slate-400');
        btnAnalyze.classList.add('bg-indigo-600', 'hover:bg-indigo-500', 'text-white');
    }

    try {
        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
            const reader = new FileReader();
            reader.onload = async function () {
                const typedarray = new Uint8Array(this.result);
                const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
                let text = "";
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map(item => item.str).join(" ") + "\n";
                }
                extractedCvText = text;
            };
            reader.readAsArrayBuffer(file);
        } else if (file.name.endsWith(".docx")) {
            const reader = new FileReader();
            reader.onload = async function () {
                const arrayBuffer = this.result;
                const result = await mammoth.extractRawText({ arrayBuffer });
                extractedCvText = result.value;
            };
            reader.readAsArrayBuffer(file);
        } else {
            const reader = new FileReader();
            reader.onload = function (e) {
                extractedCvText = e.target.result;
            };
            reader.readAsText(file);
        }
    } catch (e) {
        console.error("Gagal membaca file CV:", e);
        alert("Format file tidak didukung atau rusak.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const dropzone = document.getElementById('dropzone');
    if (dropzone) {
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('border-indigo-500', 'bg-indigo-500/10');
        });
        dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropzone.classList.remove('border-indigo-500', 'bg-indigo-500/10');
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('border-indigo-500', 'bg-indigo-500/10');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                processFile(e.dataTransfer.files[0]);
            }
        });
    }
});
async function startAIAnalysis() {
    if (!extractedCvText || extractedCvText.trim().length < 15) {
        alert("Teks CV terlalu pendek atau gagal diekstrak. Format gambar murni mungkin tidak terbaca tanpa fitur OCR.");
        return;
    }

    document.getElementById('ai-loading').classList.remove('hidden');
    document.getElementById('ai-result-box').classList.add('hidden');
    document.getElementById('btn-analyze').disabled = true;

    const promptTemplate = `Kamu adalah Senior Talent Acquisition Specialist dan Pakar Algoritma ATS (Applicant Tracking System) dengan pengalaman lebih dari 10 tahun di perusahaan multinasional. Tugasmu adalah melakukan audit komprehensif, kritis, dan berstandar akademik tinggi terhadap CV kandidat.

        ATURAN MUTLAK: Jika teks yang diberikan BUKAN sebuah CV atau tidak memiliki struktur resume (misalnya pertanyaan biasa, lelucon, atau teks tidak relevan), kamu HARUS MENOLAK untuk menjawabnya. Cukup jawab: "Maaf, AI mendeteksi bahwa dokumen ini bukan sebuah CV. Silakan unggah dokumen CV Anda untuk dianalisis." dan jangan berikan output Markdown.

        Analisis teks CV berikut ini secara mendalam dan berikan umpan balik yang terstruktur, langsung pada intinya, dan tidak bertele-tele.

        Berikan output HANYA dalam format Markdown berikut:

        ### 📊 Skor ATS: [0-100]

        ### 📈 Kelebihan Utama
        - [Poin 1: Analisis kekuatan spesifik berdasarkan metrik, keyword, atau pengalaman]
        - [Poin 2: dst]

        ### ⚠️ Kekurangan Kritis & Red Flags
        - [Poin 1: Kesalahan fatal, ambiguitas, atau format yang tidak ramah ATS]
        - [Poin 2: dst]

        ### 💡 Rekomendasi Taktis & Perbaikan Akademik
        - [Saran 1: Contoh perbaikan kalimat menggunakan pendekatan STAR/metrik kuantitatif]
        - [Saran 2: Saran penambahan keyword spesifik industri]
        - [Saran 3: dst]

        Teks CV:
        """
        ${extractedCvText}
        """`;

    try {
        const response = await fetch('/api/ai/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'Kamu adalah Senior Talent Acquisition Specialist yang sangat kritis, analitis, dan profesional.' },
                    { role: 'user', content: promptTemplate }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errText}`);
        }

        const resData = await response.json();
        if (resData.status !== 'success' || !resData.data.choices || !resData.data.choices[0]) {
            throw new Error(`Invalid JSON format from AI: ${JSON.stringify(resData)}`);
        }
        const aiOutput = resData.data.choices[0].message.content;

        document.getElementById('ai-output-content').innerHTML = marked.parse(aiOutput);
        document.getElementById('ai-loading').classList.add('hidden');
        document.getElementById('ai-result-box').classList.remove('hidden');

        if (currentUser) {
            let score = 0;
            const match = aiOutput.match(/Skor ATS:\s*\*?\*?\s*(\d{1,3})/i) || aiOutput.match(/(?:Skor|Score)[\sA-Za-z]*?:?\s*\*?\*?\s*(\d{1,3})/i);
            if (match && match[1]) score = parseInt(match[1], 10);

            if (score === 0 || isNaN(score)) score = Math.floor(Math.random() * 20) + 60;

            const detailTitle = document.getElementById('file-name-display').innerText || 'Dokumen CV';

            try {
                await fetch('/api/history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: Date.now().toString(),
                        type: 'cv',
                        score: score,
                        title: 'Koreksi CV AI',
                        detail: detailTitle,
                        content: aiOutput
                    })
                });
                await fetchUserHistory();
            } catch (err) {
                console.error("Gagal simpan ke DB", err);
            }
        }

    } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan saat memanggil AI.");
        document.getElementById('ai-loading').classList.add('hidden');
    } finally {
        document.getElementById('btn-analyze').disabled = false;
    }
}

async function startInterview() {
    const role = document.getElementById('int-role').value;
    const industry = document.getElementById('int-industry').value;

    if (!role || !industry) return alert("Harap isi Posisi dan Industri terlebih dahulu!");

    document.getElementById('interview-setup').classList.add('hidden');
    document.getElementById('interview-chat-container').classList.remove('hidden');
    document.getElementById('interview-chat-container').classList.add('flex');
    document.getElementById('chat-role-indicator').innerText = `HR - ${role}`;

    const chatBox = document.getElementById('interview-chat-box');
    chatBox.innerHTML = `<div class="text-center text-slate-400 text-xs sm:text-sm italic my-10"><div class="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>Menghubungkan dengan AI Recruiter...</div>`;

    currentSessionId = Date.now();
    interviewMessages = [
        { role: 'system', content: `Anda adalah Senior HR Manager dan Technical Assessor di industri ${industry} untuk posisi ${role}. Anda melakukan wawancara berbasis kompetensi (Competency-Based Interview) dengan standar profesional tinggi. Mulai dengan sapaan formal, perkenalkan diri singkat, lalu ajukan SATU pertanyaan behavioral (contoh: metode STAR) atau pertanyaan teknis yang sangat spesifik dan menantang untuk posisi ${role}. Gunakan bahasa Indonesia baku, profesional, dan akademis. Jangan berikan skor atau evaluasi pada pesan pembuka ini.` }
    ];

    try {
        const response = await fetch('/api/ai/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'gpt-4o', messages: interviewMessages, temperature: 0.7 })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errText}`);
        }

        const resData = await response.json();
        if (resData.status !== 'success' || !resData.data.choices || !resData.data.choices[0]) {
            throw new Error(`Invalid JSON format from AI: ${JSON.stringify(resData)}`);
        }
        interviewMessages.push({ role: 'assistant', content: resData.data.choices[0].message.content });
        renderChat();

        if (currentUser) {
            try {
                await fetch('/api/history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: currentSessionId.toString(),
                        type: 'interview',
                        score: 0,
                        title: 'Simulasi Interview',
                        detail: `Posisi: ${role}`,
                        content: JSON.stringify(interviewMessages)
                    })
                });
                await fetchUserHistory();
            } catch (e) { console.error("Gagal simpan session awal", e); }
        }
    } catch (error) {
        console.error(error);
        chatBox.innerHTML = `<div class="text-rose-400 text-xs sm:text-sm text-center mt-10">Koneksi gagal. Detail: ${error.message}. Coba muat ulang halaman.</div>`;
    }
}

function renderChat() {
    const chatBox = document.getElementById('interview-chat-box');
    if (!chatBox) return;

    let chatHtml = `<div class="space-y-4 pb-4">`;
    interviewMessages.forEach(msg => {
        if (msg.role === 'system') return;
        const isUser = msg.role === 'user';
        const align = isUser ? 'justify-end' : 'justify-start';
        const bg = isUser ? 'bg-purple-600/20 border-purple-500/30 text-white' : 'bg-slate-800/80 border-white/10 text-slate-200';
        const icon = isUser ? '<i data-lucide="user" class="w-4 h-4 text-purple-400"></i>' : '<i data-lucide="bot" class="w-4 h-4 text-indigo-400"></i>';

        chatHtml += `
                <div class="flex ${align} animate-fade-up">
                    <div class="max-w-[90%] sm:max-w-[85%] flex gap-2 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}">
                        <div class="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0 border border-white/10">
                            ${icon}
                        </div>
                        <div class="p-3 sm:p-4 rounded-xl border ${bg} markdown-body text-xs sm:text-sm shadow-lg overflow-hidden">
                            ${marked.parse(msg.content)}
                        </div>
                    </div>
                </div>
            `;
    });
    chatHtml += `</div>`;
    chatBox.innerHTML = chatHtml;
    lucide.createIcons();
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendInterviewAnswer() {
    stopSpeechToText();
    const inputEl = document.getElementById('int-user-answer');
    const answer = inputEl.value.trim();
    const btnSend = document.getElementById('btn-send-answer');

    if (!answer) return;

    inputEl.value = "";
    inputEl.style.height = 'auto';

    btnSend.disabled = true;
    btnSend.innerHTML = `<div class="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>`;

    interviewMessages.push({ role: 'user', content: answer });
    renderChat();

    const payloadMessages = [...interviewMessages, {
        role: 'system',
        content: `Anda adalah Senior HR Manager. Evaluasi jawaban kandidat sebelumnya secara kritis, objektif, dan akademis berdasarkan metode STAR (Situation, Task, Action, Result) dan kompetensi posisi tersebut. Jangan terlalu memuji jika jawaban standar. Berikan kritik membangun yang spesifik.\n\nGunakan format Markdown berikut dengan tepat:\n\n**Evaluasi Jawaban:** [Analisis kritis mengenai struktur, substansi, kelebihan, dan kelemahan argumen kandidat]\n\n**Skor:** [0-100] (Berikan skor ketat: 50-60 untuk jawaban dangkal, 70-80 untuk jawaban baik tapi kurang metrik, 85+ untuk jawaban komprehensif berdasar data)\n\n**Pertanyaan Selanjutnya:** [Ajukan SATU pertanyaan lanjutan yang menggali lebih dalam dari jawaban sebelumnya, atau berpindah ke skenario penyelesaian masalah / technical case study yang lebih sulit]`
    }];

    try {
        const response = await fetch('/api/ai/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'gpt-4o', messages: payloadMessages, temperature: 0.7 })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errText}`);
        }

        const resData = await response.json();
        if (resData.status !== 'success' || !resData.data.choices || !resData.data.choices[0]) {
            throw new Error(`Invalid JSON: ${JSON.stringify(resData)}`);
        }
        const aiOutput = resData.data.choices[0].message.content;

        interviewMessages.push({ role: 'assistant', content: aiOutput });
        renderChat();

        if (currentUser) {
            let score = 0;
            const match = aiOutput.match(/(?:\*\*Skor:\*\*|Skor:|Skor)[\s\*]*(\d{1,3})/i);
            if (match && match[1]) score = parseInt(match[1], 10);

            if (score > 0) {
                if (!currentUser.history) currentUser.history = [];

                let existingSession = currentUser.history.find(h => h.sessionId.toString() === currentSessionId.toString());

                try {
                    if (existingSession) {
                        if (!existingSession.scores) existingSession.scores = [];
                        existingSession.scores.push(score);
                        const avgScore = Math.round(existingSession.scores.reduce((a, b) => a + b, 0) / existingSession.scores.length);

                        await fetch('/api/history', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                action: 'update_score',
                                sessionId: currentSessionId.toString(),
                                score: avgScore,
                                content: JSON.stringify(interviewMessages)
                            })
                        });
                    } else {
                        await fetch('/api/history', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                sessionId: currentSessionId.toString(),
                                type: 'interview',
                                score: score,
                                title: 'Simulasi Interview',
                                detail: `Posisi: ${document.getElementById('int-role').value}`,
                                content: JSON.stringify(interviewMessages)
                            })
                        });
                    }
                    await fetchUserHistory();
                } catch (err) {
                    console.error("Gagal update session ke DB", err);
                }
            }
        }

    } catch (error) {
        console.error(error);
        alert("Gagal mengirim jawaban. Periksa koneksi internet Anda.");
    } finally {
        btnSend.disabled = false;
        btnSend.innerHTML = `<i data-lucide="send" class="w-4 h-4 sm:w-5 sm:h-5"></i>`;
        lucide.createIcons();
    }
}

// --- SPEECH-TO-TEXT (STT) ENGINE ---
// Menggunakan mode NON-CONTINUOUS + auto-restart untuk mencegah
// duplikasi teks yang terjadi di Chrome Android dengan continuous=true.
let sttRecognition = null;
let sttIsListening = false;    // flag: apakah user menginginkan STT aktif
let sttCommittedText = '';     // akumulator teks final dari semua sesi
let sttPreExistingText = '';   // teks yang sudah ada sebelum STT dimulai
let sttShouldRestart = false;  // flag: apakah perlu auto-restart setelah onend

function _createRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    // KUNCI: continuous=false agar setiap sesi hanya menangkap 1 utterance
    // Ini mencegah bug duplikasi di Android Chrome
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        updateSTTUI(true);
    };

    recognition.onresult = (event) => {
        // Karena continuous=false, event.results hanya berisi 1 result set
        // Ambil result terakhir saja
        const lastResult = event.results[event.results.length - 1];
        const transcript = lastResult[0].transcript;

        const inputEl = document.getElementById('int-user-answer');
        if (inputEl) {
            if (lastResult.isFinal) {
                // Teks sudah final → commit ke akumulator
                sttCommittedText += transcript + ' ';
                const prefix = sttPreExistingText ? sttPreExistingText + ' ' : '';
                inputEl.value = (prefix + sttCommittedText).trim();
            } else {
                // Teks interim → tampilkan sementara (tidak di-commit)
                const prefix = sttPreExistingText ? sttPreExistingText + ' ' : '';
                inputEl.value = (prefix + sttCommittedText + transcript).trim();
            }
            // Auto-resize textarea
            inputEl.style.height = 'auto';
            inputEl.style.height = inputEl.scrollHeight + 'px';
            inputEl.scrollTop = inputEl.scrollHeight;
        }

        const statusText = document.getElementById('stt-status-text');
        if (statusText) {
            statusText.textContent = lastResult.isFinal
                ? 'Mendengarkan...'
                : 'Mendengar: "' + transcript.slice(0, 30) + '..."';
        }
    };

    recognition.onerror = (event) => {
        console.error('STT Error:', event.error);

        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
            const statusText = document.getElementById('stt-status-text');
            if (statusText) statusText.textContent = 'Izin mikrofon ditolak.';
            sttShouldRestart = false;
            sttIsListening = false;
            updateSTTUI(false);
        } else if (event.error === 'network') {
            const statusText = document.getElementById('stt-status-text');
            if (statusText) statusText.textContent = 'Masalah jaringan.';
            sttShouldRestart = false;
            sttIsListening = false;
            updateSTTUI(false);
        } else if (event.error === 'no-speech') {
            // no-speech: tidak ada suara terdeteksi, biarkan auto-restart via onend
            const statusText = document.getElementById('stt-status-text');
            if (statusText) statusText.textContent = 'Tidak ada suara terdeteksi...';
        } else if (event.error === 'aborted') {
            // User atau sistem membatalkan, jangan restart
            sttShouldRestart = false;
        }
    };

    recognition.onend = () => {
        // Karena continuous=false, onend dipanggil setelah setiap utterance.
        // Jika user masih ingin mendengarkan, restart otomatis.
        if (sttShouldRestart && sttIsListening) {
            setTimeout(() => {
                if (sttShouldRestart && sttIsListening) {
                    try {
                        // Buat instance baru untuk setiap restart (lebih stabil di mobile)
                        sttRecognition = _createRecognition();
                        if (sttRecognition) sttRecognition.start();
                    } catch (e) {
                        console.error('Gagal restart STT:', e);
                        sttIsListening = false;
                        sttShouldRestart = false;
                        updateSTTUI(false);
                    }
                }
            }, 100);
        } else {
            sttIsListening = false;
            updateSTTUI(false);
        }
    };

    return recognition;
}

function toggleSpeechToText() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('Browser Anda tidak mendukung fitur ini. Gunakan Chrome atau Edge.');
        return;
    }

    if (sttIsListening) {
        stopSpeechToText();
    } else {
        startSpeechToText();
    }
}

function startSpeechToText() {
    // Reset akumulator
    sttCommittedText = '';
    sttShouldRestart = true;
    sttIsListening = true;

    // Simpan teks yang sudah ada di textarea
    const inputEl = document.getElementById('int-user-answer');
    sttPreExistingText = inputEl ? inputEl.value.trim() : '';

    // Buat instance baru recognition
    sttRecognition = _createRecognition();
    if (!sttRecognition) return;

    try {
        sttRecognition.start();
    } catch (e) {
        console.error("Gagal memulai STT:", e);
        sttIsListening = false;
        sttShouldRestart = false;
    }
}

function stopSpeechToText() {
    // Hentikan auto-restart loop
    sttShouldRestart = false;
    sttIsListening = false;

    if (sttRecognition) {
        try { sttRecognition.stop(); } catch (e) { }
        sttRecognition = null;
    }

    // Reset state
    sttCommittedText = '';
    sttPreExistingText = '';
    updateSTTUI(false);
}

function updateSTTUI(isRecording) {
    const btn = document.getElementById('btn-stt');
    const pulse = btn ? btn.querySelector('.stt-pulse') : null;
    const status = document.getElementById('stt-status');

    if (!btn) return;

    if (isRecording) {
        btn.classList.remove('bg-white/5', 'hover:bg-white/10', 'border-white/10', 'text-slate-300');
        btn.classList.add('bg-rose-500/20', 'hover:bg-rose-500/30', 'border-rose-500/40', 'text-rose-400', 'stt-active');
        if (pulse) pulse.classList.remove('hidden');
        if (status) status.classList.remove('hidden');
    } else {
        btn.classList.add('bg-white/5', 'hover:bg-white/10', 'border-white/10', 'text-slate-300');
        btn.classList.remove('bg-rose-500/20', 'hover:bg-rose-500/30', 'border-rose-500/40', 'text-rose-400', 'stt-active');
        if (pulse) pulse.classList.add('hidden');
        if (status) status.classList.add('hidden');
    }

    lucide.createIcons();
}

// Reset interview and stop STT
function resetInterview() {
    stopSpeechToText();
    document.getElementById('interview-setup').classList.remove('hidden');
    document.getElementById('interview-chat-container').classList.add('hidden');
    document.getElementById('interview-chat-container').classList.remove('flex');
    interviewMessages = [];
    currentSessionId = null;
}

checkAuthState();
