/**
 * شريان الاختناق: إغلاق مضيق هرمز ومآلات التجارة العالمية
 * نصوص برمجية تفاعلية نقية (Vanilla JS)
 * الالتزام بدستور العمل 3.8: منع alert()، ربط Web3Forms الحقيقي، والوصولية الكاملة
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initCustomHalo();
  initTelemetryCounters();
  initLightbox();
  initInteractiveMap();
  initWeb3Forms();
  initAmbientAudio();
  initPdfDownload();
});

/* ── 1. الظهور التدريجي للعناصر مع التمرير (Reveal on Scroll) ── */
function initScrollReveal() {
  const elementsToReveal = document.querySelectorAll('.reveal-on-scroll');
  if (!elementsToReveal.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.12
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  elementsToReveal.forEach(el => observer.observe(el));
}

/* ── 2. هالة التفاعل الذكية المضيئة بلون البطل (§5.6) ── */
function initCustomHalo() {
  const halo = document.querySelector('.custom-halo');
  if (!halo) return;

  // التحقق من أن الجهاز يدعم المؤشر الفأري وليس شاشة لمس
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;
  let isMoving = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isMoving) {
      halo.style.opacity = '1';
      isMoving = true;
    }
  });

  document.addEventListener('mouseleave', () => {
    halo.style.opacity = '0';
    isMoving = false;
  });

  function renderHalo() {
    currentX += (mouseX - currentX) * 0.15;
    currentY += (mouseY - currentY) * 0.15;
    halo.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    requestAnimationFrame(renderHalo);
  }
  requestAnimationFrame(renderHalo);
}

/* ── 3. عدادات الأرقام الإحصائية الحية ── */
function initTelemetryCounters() {
  const counterElements = document.querySelectorAll('.counter-value');
  if (!counterElements.length) return;

  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const targetNumber = parseFloat(target.getAttribute('data-target') || '0');
        const prefix = target.getAttribute('data-prefix') || '';
        const suffix = target.getAttribute('data-suffix') || '';
        const decimals = parseInt(target.getAttribute('data-decimals') || '0', 10);
        
        animateCounter(target, 0, targetNumber, 1600, prefix, suffix, decimals);
        obs.unobserve(target);
      }
    });
  }, { threshold: 0.2 });

  counterElements.forEach(el => counterObserver.observe(el));
}

function animateCounter(element, start, end, duration, prefix, suffix, decimals) {
  let startTime = null;
  function updateNumber(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    // دالة تخفيف تسارع سلسة
    const easeOutQuad = 1 - (1 - progress) * (1 - progress);
    const current = start + (end - start) * easeOutQuad;
    
    element.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    } else {
      element.textContent = `${prefix}${end.toFixed(decimals)}${suffix}`;
    }
  }
  requestAnimationFrame(updateNumber);
}

/* ── 4. نافذة التكبير البصري (Lightbox) مع دعم مفتاح Esc (§5.7.6) ── */
let lastFocusedElement = null;

function initLightbox() {
  const lightbox = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  const mediaFrames = document.querySelectorAll('.media-frame');

  if (!lightbox || !lightboxImg || !mediaFrames.length) return;

  mediaFrames.forEach(frame => {
    frame.addEventListener('click', () => {
      const img = frame.querySelector('.chapter-img');
      const caption = frame.parentElement.querySelector('.media-caption');
      if (!img) return;

      lastFocusedElement = frame;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';
      lightboxCaption.textContent = caption ? caption.textContent : '';

      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      closeBtn.focus();
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    document.body.style.overflow = '';
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-container')) {
      closeLightbox();
    }
  });

  // إغلاق عبر زر Esc واستعادة التركيز (§5.7.6)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

/* ── 5. الخريطة الملاحية التفاعلية ── */
function initInteractiveMap() {
  const hotPoints = document.querySelectorAll('.map-interactive-point');
  const infoTitle = document.getElementById('mapInfoTitle');
  const infoText = document.getElementById('mapInfoText');

  if (!hotPoints.length || !infoTitle || !infoText) return;

  hotPoints.forEach(pt => {
    pt.addEventListener('mouseenter', () => {
      const title = pt.getAttribute('data-title');
      const desc = pt.getAttribute('data-desc');
      if (title) infoTitle.textContent = title;
      if (desc) infoText.textContent = desc;

      hotPoints.forEach(p => p.classList.remove('active-point'));
      pt.classList.add('active-point');
    });

    pt.addEventListener('click', () => {
      const title = pt.getAttribute('data-title');
      const desc = pt.getAttribute('data-desc');
      if (title) infoTitle.textContent = title;
      if (desc) infoText.textContent = desc;
    });
  });
}

/* ── 6. نموذج التوثيق السحابي الحقيقي (Web3Forms) (§4.10) ── */
function initWeb3Forms() {
  const form = document.getElementById('strategicInquiryForm');
  const submitBtn = document.getElementById('submitFormBtn');
  const feedback = document.getElementById('formFeedback');

  if (!form || !submitBtn || !feedback) return;

  let lastSubmitTime = 0;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // فحص حقل المصيدة المخفي botcheck لمنع السبام (§4.10.5)
    const botcheck = form.querySelector('input[name="botcheck"]');
    if (botcheck && botcheck.value.trim() !== '') {
      console.warn('Bot detected. Submission dropped.');
      return;
    }

    // منع الإرسال المتكرر بفارق زمني 30 ثانية
    const now = Date.now();
    if (now - lastSubmitTime < 30000) {
      showFeedback('يرجى الانتظار نصف دقيقة قبل إرسال استفسار جديد.', 'error');
      return;
    }

    const formData = new FormData(form);
    const originalBtnText = submitBtn.innerHTML;

    // تعطيل الزر وإظهار مؤشر المعالجة دون استخدام alert() (§4.10.2)
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>جاري إرسال التوثيق...</span>';
    feedback.className = 'form-feedback';
    feedback.style.display = 'none';

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      const result = await response.json();

      if (response.status === 200 && result.success) {
        lastSubmitTime = Date.now();
        form.reset();
        showFeedback('تم استلام رسالتكم بنجاح، وسيتم الرد على البريد المسجل.', 'success');
      } else {
        const errorMsg = result.message || 'تعذر إرسال النموذج، يرجى المحاولة بعد قليل.';
        showFeedback(errorMsg, 'error');
      }
    } catch (err) {
      showFeedback('تعذر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

  function showFeedback(message, type) {
    feedback.textContent = message;
    feedback.className = `form-feedback ${type}`;
    feedback.style.display = 'block';
  }
}

/* ── 7. المؤثر الصوتي الهادئ (أعماق البحر والرادار التوثيقي) ── */
function initAmbientAudio() {
  const audioBtn = document.getElementById('audioToggleBtn');
  if (!audioBtn) return;

  let audioCtx = null;
  let isPlaying = false;
  let noiseNode = null;
  let gainNode = null;

  audioBtn.addEventListener('click', () => {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isPlaying) {
      startAmbientSound();
      audioBtn.classList.add('playing');
      audioBtn.setAttribute('aria-label', 'كتم الصوت التوثيقي');
      audioBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      `;
      isPlaying = true;
    } else {
      stopAmbientSound();
      audioBtn.classList.remove('playing');
      audioBtn.setAttribute('aria-label', 'تشغيل الصوت التوثيقي');
      audioBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      `;
      isPlaying = false;
    }
  });

  function startAmbientSound() {
    if (!audioCtx) return;
    // توليد ضوضاء وردية ناعمة تحاكي أعماق المحيط
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.96 * b1 + white * 0.11;
      b2 = 0.86 * b2 + white * 0.25;
      data[i] = (b0 + b1 + b2) * 0.04;
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    // مرشح تمرير منخفض للترددات العميقة
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, audioCtx.currentTime);

    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 2);

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseNode.start(0);
  }

  function stopAmbientSound() {
    if (gainNode && audioCtx) {
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
      setTimeout(() => {
        if (noiseNode) {
          noiseNode.stop();
          noiseNode.disconnect();
          noiseNode = null;
        }
      }, 850);
    }
  }
}

/* ── 8. تفعيل طباعة وتحميل التقرير الاستراتيجي بصيغة PDF ── */
function initPdfDownload() {
  const pdfButtons = [document.getElementById('navPdfBtn'), document.getElementById('heroPdfBtn')];
  
  pdfButtons.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      // إغلاق أي نوافذ منبثقة أو وسائط نشطة قبل فتح نافذة الطباعة
      const modal = document.getElementById('lightboxModal');
      if (modal && modal.classList.contains('active')) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
      }

      // استدعاء نافذة الطباعة وحفظ الـ PDF التوثيقي
      window.print();
    });
  });
}

