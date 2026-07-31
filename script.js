
/* ============ TEXT SPLITTING UTILITY ============ */
function splitText(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  const text = el.textContent.trim();
  el.innerHTML = '';
  text.split('').forEach(char => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.display = 'inline-block';
    el.appendChild(span);
  });
  return Array.from(el.querySelectorAll('span'));
}

gsap.registerPlugin(ScrollTrigger);

/* ============ LENIS SMOOTH SCROLL ============ */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

// Sync Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

/* ============ CUSTOM CURSOR (GSAP) ============ */
const cursor = document.getElementById('cursor');
if (window.innerWidth > 900 && cursor) {
  gsap.set(cursor, { xPercent: -50, yPercent: -50 });
  const xTo = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power3" });
  const yTo = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power3" });

  window.addEventListener('mousemove', (e) => {
    xTo(e.clientX);
    yTo(e.clientY);
  });

  // Cursor interactions
  const interactiveElements = document.querySelectorAll('a, button, .magnetic, [data-tilt]');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
  });
}

/* ============ MAGNETIC BUTTONS ============ */
document.querySelectorAll('.magnetic').forEach(el => {
  const xTo = gsap.quickTo(el, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
  const yTo = gsap.quickTo(el, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });
  
  el.addEventListener("mousemove", (e) => {
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    xTo(relX * 0.4);
    yTo(relY * 0.4);
  });
  el.addEventListener("mouseleave", () => {
    xTo(0);
    yTo(0);
  });
});

/* ============ 3D TILT CARDS ============ */
document.querySelectorAll('[data-tilt], .bento-card, .service-card').forEach(el => {
  el.addEventListener("mousemove", (e) => {
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    
    // CSS Variables for gradient glow effect
    el.style.setProperty('--mx', relX + 'px');
    el.style.setProperty('--my', relY + 'px');
    
    const rx = ((relY / rect.height) - 0.5) * -10;
    const ry = ((relX / rect.width) - 0.5) * 10;
    
    gsap.to(el, {
      rotationX: rx,
      rotationY: ry,
      transformPerspective: 1000,
      ease: "power2.out",
      duration: 0.4
    });
  });
  
  el.addEventListener("mouseleave", () => {
    gsap.to(el, {
      rotationX: 0,
      rotationY: 0,
      ease: "elastic.out(1, 0.3)",
      duration: 1.2
    });
  });
});

/* ============ MICRO-INTERACTIONS ============ */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mouseenter', () => gsap.to(btn, { scale: 1.03, duration: 0.3, ease: 'power2.out' }));
  btn.addEventListener('mouseleave', () => gsap.to(btn, { scale: 1, duration: 0.3, ease: 'power2.out' }));
  btn.addEventListener('mousedown', () => gsap.to(btn, { scale: 0.97, duration: 0.1 }));
  btn.addEventListener('mouseup', () => gsap.to(btn, { scale: 1.03, duration: 0.05 }));
});

/* ============ LOADING SEQUENCE ============ */
const loaderText = document.getElementById('loader-text');
const loaderPct = document.getElementById('loader-pct');
let loadProgress = { val: 0 };

// Ensure Hero elements are hidden before loader finishes
// Text splitting applied dynamically
const titleChars = [
  ...(splitText('#hero-title-1') || []),
  ...(splitText('#hero-title-2') || [])
];
gsap.set(titleChars, { y: 80, opacity: 0, rotateX: -90 });
gsap.set('.hero-greet, .hero-roles span, .hero-headline, .hero-desc, .hero-btns .btn, .hero-avail, .scroll-cue', { opacity: 0, y: 20 });
gsap.set('#nav', { yPercent: -150, opacity: 0 });
gsap.set('.portrait-frame', { scale: 0.95, opacity: 0 });

const loaderTl = gsap.timeline({
  onComplete: () => {
    document.body.style.overflow = 'auto'; // allow scroll if it was blocked
    playHeroIntro();
  }
});

loaderTl.to(loadProgress, {
  val: 100,
  duration: 1.0,
  ease: "power2.inOut",
  onUpdate: () => {
    if (loaderPct) loaderPct.innerText = Math.floor(loadProgress.val) + "%";
    const fill = document.getElementById('loader-fill');
    if (fill) fill.style.width = loadProgress.val + "%";
    if (loadProgress.val > 40 && loaderText && loaderText.innerText !== "Loading Experience...") {
      loaderText.innerText = "Loading Experience...";
    }
  }
})
.to('#loader', { opacity: 0, duration: 0.05, ease: "power2.inOut" }, "+=0.1")
.set('#loader', { display: 'none' });

/* ============ HERO INTRO ============ */
function playHeroIntro() {
  const tl = gsap.timeline();
  
  tl.to('#nav', { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 0);
  tl.to('.hero-greet', { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 0.1);
  tl.to(titleChars, { y: 0, opacity: 1, rotateX: 0, duration: 0.5, ease: 'power4.out', stagger: 0.015 }, 0.15);
  tl.to('.hero-headline', { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 0.3);
  tl.to('.hero-desc', { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 0.4);
  tl.to('.hero-roles span', { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', stagger: 0.04 }, 0.5);
  tl.to('.hero-btns .btn', { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', stagger: 0.06 }, 0.6);
  tl.to('.hero-avail, .scroll-cue', { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 0.7);
  tl.to('.portrait-frame', { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.2)' }, 0.3);
  
  gsap.to('.portrait-frame', { y: -15, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 });
  gsap.to('.hero-logo-bg', { rotation: 3, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 });
  gsap.to('#frame-canvas', { opacity: 1, duration: 1, ease: 'power2.inOut' }, 0);
}

/* ============ PREMIUM VIEWPORT ANIMATIONS ============ */
const animatedSections = document.querySelectorAll('section:not(#hero)');

animatedSections.forEach(section => {
  const elementsToAnimate = section.querySelectorAll('.eyebrow, .sec-title, .sec-sub, .about-lead, .about-body p, .about-tag-row span, .vision-quote, .stat-cell, .bento-card, .proj-visual, .proj-tag, .proj-title, .proj-desc, .proj-meta, .proj-stack, .proj-links, .building-card, .stack-cat, .t-item, .service-card, .compare-col, .beyond-quote, .beyond-body p, .beyond-tags span, .beyond-visual, .contact-head, .contact-info a, .form-card, .stack-bar-fill, .stat-num, .btn');
  
  gsap.set(elementsToAnimate, { opacity: 0, y: 24 });
  gsap.set(section.querySelectorAll('.proj-visual, .beyond-visual'), { scale: 0.95, y: 30 });

  ScrollTrigger.create({
    trigger: section,
    start: "top 110%", // Triggers well before entering the viewport (approx 100-200ms early)
    once: true,
    onEnter: () => {
      const tl = gsap.timeline();
      
      tl.to(elementsToAnimate, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.2, // Ultra-fast duration
        ease: 'power3.out',
        stagger: 0.015, // Immediate cascading
        clearProps: "transform"
      });
      
      // Counter animations
      section.querySelectorAll('.stat-num').forEach(el => {
        const count = el.getAttribute('data-count');
        const suffix = el.getAttribute('data-suffix') || '';
        if (count) {
          gsap.fromTo(el, { innerHTML: 0 }, {
            innerHTML: count,
            duration: 0.8, // Snappy counting
            ease: "power2.out",
            snap: { innerHTML: 1 },
            onUpdate: function() { el.innerHTML = Math.round(this.targets()[0].innerHTML) + suffix; }
          });
        }
      });
      
      // Tech stack bar animations
      section.querySelectorAll('.stack-bar-fill').forEach(bar => {
        gsap.from(bar, { width: '0%', duration: 0.6, ease: "power4.out" }); // Removed delay completely
      });
    }
  });
});

// Tech Stack Bars Grow
// (Removed as requested)

// Timeline Progress Line (Scrub)
gsap.to('.timeline', {
  scrollTrigger: { trigger: '.timeline', start: "top 90%", end: "bottom 50%", scrub: 1 },
  '--tl-h': '100%',
  ease: "none"
});

/* ============ MOBILE DRAWER ============ */
const burger = document.getElementById('burger');
const drawer = document.getElementById('drawer');
const drawerClose = document.getElementById('drawer-close');
const drawerLinks = document.querySelectorAll('.drawer-link');
const drawerSocials = document.querySelectorAll('.drawer-socials a');
const drawerResume = document.querySelector('.drawer-resume');

function openDrawer() {
  if (!drawer) return;
  drawer.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Sync active state with current scroll position
  const scrollY = window.scrollY;
  const allSections = document.querySelectorAll('section');
  let activeId = '';
  allSections.forEach(sec => {
    const top = sec.offsetTop - 200;
    const bottom = top + sec.offsetHeight;
    if (scrollY >= top && scrollY < bottom) activeId = sec.id;
  });
  drawerLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + activeId) link.classList.add('active');
  });

  // GSAP staggered entrance for links
  gsap.fromTo(drawerLinks,
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out', delay: 0.1 }
  );
  // Close button spin-in
  gsap.fromTo(drawerClose,
    { opacity: 0, scale: 0.8, rotation: -90 },
    { opacity: 1, scale: 1, rotation: 0, duration: 0.4, ease: 'back.out(1.7)', delay: 0.05 }
  );
  // Social icons fade in
  gsap.fromTo(drawerSocials,
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out', delay: 0.35 }
  );
  // Resume button fade in
  if (drawerResume) {
    gsap.fromTo(drawerResume,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', delay: 0.5 }
    );
  }
}

function closeDrawer() {
  if (!drawer) return;
  drawer.classList.remove('open');
  document.body.style.overflow = '';
}

if (burger && drawer && drawerClose) {
  burger.addEventListener('click', openDrawer);
  drawerClose.addEventListener('click', closeDrawer);
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) closeDrawer();
  });
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => closeDrawer());
  });
}

/* ============ NAV ACTIVE STATE & HIDE ============ */
const nav = document.getElementById('nav');
let lastY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if(y > lastY && y > 150) { if (nav) nav.classList.add('nav-hidden'); }
  else { if (nav) nav.classList.remove('nav-hidden'); }
  lastY = y;
});

const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section');
sections.forEach(sec => {
  ScrollTrigger.create({
    trigger: sec,
    start: "top 50%",
    end: "bottom 50%",
    onToggle: self => {
      if(self.isActive) {
        navLinks.forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
        if(activeLink) activeLink.classList.add('active');
      }
    }
  });
});

/* ============ BACK TO TOP ============ */
const toTop = document.getElementById('totop');
if (toTop) {
  toTop.addEventListener('click', () => {
    lenis.scrollTo(0, { duration: 0.2 });
  });
}

/* ============ CONTACT FORM (Web3Forms API) ============ */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = contactForm.querySelector('.submit-btn');
    if (!btn) return;

    const originalText = btn.innerText;
    btn.innerText = 'Sending...';
    btn.disabled = true;
    gsap.to(btn, { scale: 0.98, duration: 0.2 });

    try {
      const formData = new FormData(contactForm);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();

      if (result.success) {
        btn.innerText = '✓ Message Sent!';
        gsap.to(btn, { scale: 1, backgroundColor: '#3ddc84', duration: 0.3 });
        contactForm.reset();
        setTimeout(() => {
          btn.innerText = originalText;
          btn.disabled = false;
          gsap.to(btn, { backgroundColor: '', clearProps: 'backgroundColor', duration: 0.3 });
        }, 4000);
      } else {
        throw new Error(result.message || 'Something went wrong');
      }
    } catch (err) {
      btn.innerText = '✕ Failed — Try Again';
      gsap.to(btn, { scale: 1, backgroundColor: '#ef4444', duration: 0.3 });
      setTimeout(() => {
        btn.innerText = originalText;
        btn.disabled = false;
        gsap.to(btn, { backgroundColor: '', clearProps: 'backgroundColor', duration: 0.3 });
      }, 3000);
    }
  });
}

/* ============ HERO PARTICLE CANVAS ============ */
const canvas = document.getElementById('particle-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  resize();
  window.addEventListener('resize', resize);
  
  let mouseX = 0.5, mouseY = 0.3;
  const hero = document.getElementById('hero');
  if (hero) {
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      mouseX = (e.clientX - r.left) / r.width;
      mouseY = (e.clientY - r.top) / r.height;
    });
  }
  
  const particles = Array.from({length: window.innerWidth < 700 ? 25 : 50}, () => ({
    x: Math.random(), y: Math.random(), r: Math.random() * 1.5 + 0.5,
    vx: (Math.random() - 0.5) * 0.0005, vy: (Math.random() - 0.5) * 0.0005, o: Math.random() * 0.4 + 0.1
  }));
  
  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    const gx = mouseX * W, gy = mouseY * H;
    const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(W, H) * 0.5);
    grad.addColorStop(0, 'rgba(30,111,217,0.12)');
    grad.addColorStop(1, 'rgba(30,111,217,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > 1) p.vx *= -1;
      if(p.y < 0 || p.y > 1) p.vy *= -1;
      const px = p.x * W, py = p.y * H;
      const d = Math.hypot(px - gx, py - gy);
      const boost = d < 200 ? (1 - d/200) * 0.5 : 0;
      ctx.beginPath();
      ctx.arc(px, py, p.r + boost * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(85,194,255,${p.o + boost})`;
      ctx.fill();
    });
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
}

/* ============ SCROLL-DRIVEN IMAGE SEQUENCE BACKGROUND ============ */
(function() {
  const frameCanvas = document.getElementById('frame-canvas');
  if (!frameCanvas) return;
  const fctx = frameCanvas.getContext('2d');

  const TOTAL_FRAMES = 240;
  const FRAME_PATH = 'ezgif-6f5d7959efda172b-jpg/ezgif-frame-';
  const frames = [];
  let loadedCount = 0;
  let currentFrame = 0;
  let canvasReady = false;

  // Resize canvas to fill viewport
  function resizeFrameCanvas() {
    frameCanvas.width = window.innerWidth;
    frameCanvas.height = window.innerHeight;
    drawFrame(currentFrame);
  }

  // Draw a single frame with cover-fit + dark overlay
  function drawFrame(index) {
    const img = frames[index];
    if (!img || !img.complete || !img.naturalWidth) return;

    const cw = frameCanvas.width;
    const ch = frameCanvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // Cover-fit calculation
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    // Always center horizontally
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    fctx.clearRect(0, 0, cw, ch);
    fctx.drawImage(img, dx, dy, dw, dh);

    // Dark overlay for text readability
    fctx.fillStyle = 'rgba(5, 5, 5, 0.55)';
    fctx.fillRect(0, 0, cw, ch);
  }

  // Pad frame number to 3 digits
  function padNum(n) {
    return String(n).padStart(3, '0');
  }

  // Preload all frames
  function preloadFrames() {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = FRAME_PATH + padNum(i) + '.jpg';
      img.onload = () => {
        loadedCount++;
        // Draw frame 1 as soon as it loads
        if (i === 1 && !canvasReady) {
          canvasReady = true;
          resizeFrameCanvas();
        }
        // Setup ScrollTrigger once all frames are loaded
        if (loadedCount === TOTAL_FRAMES) {
          setupScrollAnimation();
        }
      };
      frames[i - 1] = img;
    }
  }

  // GSAP ScrollTrigger: map scroll position to frame index
  function setupScrollAnimation() {
    const frameObj = { frame: 0 };

    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => {
        const raw = self.progress * (TOTAL_FRAMES - 1);
        const targetFrame = Math.round(raw);
        if (targetFrame !== currentFrame) {
          currentFrame = targetFrame;
          requestAnimationFrame(() => drawFrame(currentFrame));
        }
      }
    });
  }

  // Start hidden, fade in once first frame loads
  frameCanvas.style.opacity = '0';

  window.addEventListener('resize', resizeFrameCanvas);
  preloadFrames();
})();
