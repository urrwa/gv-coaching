/* HOMEPAGE — section choreography */
(function () {
  "use strict";
  /* ---------- Hero: play while the video is on screen ---------- */
  (function hero() {
    const section = document.querySelector("[data-hero]");
    const video = section?.querySelector("[data-hero-video]");
    if (!video) return;

    const button = section.querySelector("[data-hero-playback]");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = matchMedia("(max-width: 767px)");
    let paused = motion.matches || navigator.connection?.saveData === true;
    let visible = false;
    let showResume = paused;
    let pending = false;

    function updateButton() {
      button.textContent = video.paused ? "Video abspielen" : "Video pausieren";
      button.hidden = video.paused && !showResume;
    }

    function sync() {
      if (paused || !visible || document.hidden) {
        video.pause();
        updateButton();
        return;
      }
      if (!video.paused || pending) return;
      if (!video.hasAttribute("src")) {
        video.src = mobile.matches ? video.dataset.heroVideoMobile : video.dataset.heroVideo;
      }
      pending = true;
      video.play().catch((error) => {
        if (error.name === "NotAllowedError") {
          paused = true;
          showResume = true;
        }
      }).finally(() => {
        pending = false;
        updateButton();
      });
    }

    video.addEventListener("playing", () => {
      section.classList.add("is-video-ready");
      updateButton();
    });
    video.addEventListener("pause", updateButton);
    video.addEventListener("error", () => {
      section.classList.remove("is-video-ready");
      showResume = false;
      updateButton();
    });
    button.addEventListener("click", () => {
      paused = !video.paused;
      showResume = paused;
      sync();
    });
    motion.addEventListener("change", () => {
      if (!motion.matches) return;
      paused = true;
      showResume = true;
      sync();
    });
    document.addEventListener("visibilitychange", sync);
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: .15 }).observe(video);
    updateButton();
  })();

  function run() {
    const PM = window.PM, gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    const reduced = PM.reduced;


    /* ---------- Coach intro: text follows scrolling in both directions ---------- */
    (function coachCopy() {
      const head = document.querySelector('.coach-story__head');
      if (!head) return;
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        const title = head.querySelector('.coach-story__title');
        const intro = head.querySelector('.coach-story__intro');
        const titleWords = PM.splitWords(title);
        const introWords = PM.splitWords(intro);
        gsap.fromTo(head.querySelector('.coach-story__eyebrow'), { opacity: .2, y: 14 }, {
          opacity: 1, y: 0, ease: 'none', scrollTrigger: { trigger: head, start: 'top 92%', end: 'top 58%', scrub: .5 },
        });
        gsap.fromTo(titleWords, { yPercent: 105, opacity: .18 }, {
          yPercent: 0, opacity: 1, stagger: .12, ease: 'none',
          scrollTrigger: { trigger: title, start: 'top 90%', end: 'bottom 55%', scrub: .5 },
        });
        gsap.fromTo(introWords, { opacity: .22, y: 8 }, {
          opacity: 1, y: 0, stagger: .035, ease: 'none',
          scrollTrigger: { trigger: intro, start: 'top 88%', end: 'bottom 58%', scrub: .5 },
        });
      });
    })();

    /* ---------- Opening video: expand from a small rounded window ---------- */
    (function opening() {
      const hero = document.querySelector('.hero--reveal');
      if (!hero || reduced || (location.hash && location.hash !== '#start')) return;
      const open = () => {
        gsap.fromTo(hero.querySelector('.hero__stage'),
          { opacity: 0, clipPath: 'inset(42% 42% 42% 42% round 40px)' },
          { opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.25, ease: 'power3.inOut', clearProps: 'opacity,clipPath' });
        gsap.fromTo(hero.querySelectorAll('.hero__copy,.hero__entry,.hero__wordmark,.hero__coach-link'),
          { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .85, delay: .55, stagger: .08, ease: 'power2.out', clearProps: 'opacity,transform' });
      };
      if (PM.revealed) open(); else document.addEventListener('pm:reveal', open, { once: true });
    })();

    /* ---------- Cinematic coach portrait: full-bleed → pullback → grid ---------- */
    (function coachStory() {
      const section = document.querySelector('[data-coach-story]');
      if (!section) return;
      const journey = section.querySelector('.coach-story__journey');
      const main    = section.querySelector('[data-coach-main]');
      const image   = main.querySelector('img');
      const tiles   = [...section.querySelectorAll('[data-coach-tile]')];
      const name    = section.querySelector('.coach-story__name');
      const nameTag = section.querySelector('.coach-story__name > span'); // "Dein Coach" label
      const lines   = [...section.querySelectorAll('[data-coach-line]')];

      gsap.matchMedia().add('(prefers-reduced-motion: no-preference) and (min-height: 570px)', () => {
        const small   = () => window.innerWidth < 768;
        // Final tile size (grid cell)
        const tileW   = () => Math.min(window.innerWidth * (small() ? .29 : .18), small() ? Infinity : 245);
        const tileH   = () => tileW() * 1.2;
        const gap     = () => small() ? 14 : 30;
        // Mid-pullback card size (~56vw desktop, 86vw mobile) — matches thegrind.nl mid frame
        const midW    = () => Math.min(window.innerWidth * (small() ? .86 : .56), 760);
        const midH    = () => Math.min(window.innerHeight * .84, 820);
        // Full-bleed sizes
        const fullW   = () => window.innerWidth;
        const fullH   = () => window.innerHeight;

        section.classList.add('is-scroll-story');

        // Position main tile at centre; apply full-bleed initial state immediately
        gsap.set(main, {
          xPercent: -50, yPercent: -50, x: 0, y: 0,
          width: fullW, height: fullH, borderRadius: 0,
        });
        // Full-bleed: big text, bottom-left aligned, no "Dein Coach" label
        gsap.set(name, {
          fontSize: () => fullW() * (small() ? .10 : .075),
          textAlign: 'left',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: () => small() ? '0 20px 28px' : '0 48px 44px',
        });
        if (nameTag) gsap.set(nameTag, { autoAlpha: 0 });
        gsap.set(tiles, {
          xPercent: -50, yPercent: -50,
          x: (_,el) => Number(el.dataset.col) * (tileW() + gap()),
          y: (_,el) => Number(el.dataset.row) * (tileH() + gap()),
          autoAlpha: 0,
        });

        // Text lines: start with line 0 visible, others hidden below
        if (lines.length === 3) {
          gsap.set(lines, { autoAlpha: 0, yPercent: 100 });
          gsap.set(lines[0], { autoAlpha: 1, yPercent: 0 });
        }

        // Image: start desaturated with slight zoom
        gsap.set(image, { scale: 1.08, filter: 'grayscale(1) contrast(1.1) brightness(.92)' });

        const tl = gsap.timeline({ scrollTrigger: {
          trigger: journey, start: 'top top', end: 'bottom bottom',
          scrub: 1.0, invalidateOnRefresh: true,
        }});

        // ── PHASE A (0 → 1.0): Full-bleed portrait, text cycling ──────────────
        // Pad start of timeline so position 0 = portrait already full-bleed (set above)
        tl.to({}, { duration: 0.001 }, 0); // anchor

        // Text line cycling across the full-bleed phase
        // Line 0 "Dein Ziel." holds 0→0.30, then exits up
        tl.to(lines[0], { autoAlpha: 0, yPercent: -100, duration: .18, ease: 'power2.inOut' }, 0.32);
        // Line 1 "Meine Begleitung." enters, holds 0.42→0.68, exits
        tl.fromTo(lines[1],
          { autoAlpha: 0, yPercent: 100 },
          { autoAlpha: 1, yPercent: 0,   duration: .16, ease: 'power2.out' }, 0.44);
        tl.to(lines[1], { autoAlpha: 0, yPercent: -100, duration: .16, ease: 'power2.inOut' }, 0.68);
        // Line 2 "Gabriel Vogt." enters and stays
        tl.fromTo(lines[2],
          { autoAlpha: 0, yPercent: 100 },
          { autoAlpha: 1, yPercent: 0,   duration: .16, ease: 'power2.out' }, 0.78);

        // Subtle image motion during full-bleed: slow drift and gradual desaturation easing
        tl.to(image, { scale: 1.04, filter: 'grayscale(.6) contrast(1.05) brightness(.96)', duration: .55, ease: 'power1.inOut' }, 0.32);
        tl.to(image, { scale: 1.0,  filter: 'grayscale(.2) contrast(1.02) brightness(1.0)',  duration: .40, ease: 'power1.inOut' }, 0.78);

        // ── PHASE B (1.0 → 1.8): Pull back from full-bleed to mid card ────────
        // Portrait shrinks, corners appear, name font scales down proportionally
        tl.to(main, { width: midW, height: midH, borderRadius: () => small() ? 14 : 20, duration: .72, ease: 'power2.inOut' }, 1.0);
        tl.to(name, {
          fontSize: () => midW() * .26,
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          duration: .72, ease: 'power2.inOut',
        }, 1.0);
        // Restore the "Dein Coach" label as the card forms
        if (nameTag) tl.to(nameTag, { autoAlpha: 1, duration: .28, ease: 'power1.out' }, 1.3);
        // Image settles to colour as card forms
        tl.to(image, { scale: 1.0, filter: 'grayscale(0) contrast(1.0) brightness(1.0)', duration: .55, ease: 'power1.out' }, 1.1);

        // ── PHASE C (1.8 → 2.4): Shrink mid card → final tile size ───────────
        tl.to(main, { width: tileW, height: tileH, borderRadius: () => small() ? 10 : 14, duration: .56, ease: 'power2.inOut' }, 1.8);
        tl.to(name, { fontSize: () => tileW() * .26, duration: .56, ease: 'power2.inOut' }, 1.8);

        // ── PHASE D (2.4 → end): Staggered grid reveal ────────────────────────
        // Clip the scene so tiles stay inside viewport during grid phase
        tl.set(section.querySelector('.coach-story__scene'), { overflow: 'hidden' }, 2.35);

        // Sort tiles inside-out (centre first, edges last) — classic bloom reveal
        tiles.sort((a, b) => {
          const dist = el => Math.abs(Number(el.dataset.col)) + Math.abs(Number(el.dataset.row));
          return dist(a) - dist(b);
        }).forEach((tile, i) => {
          const at     = 2.42 + i * .05;
          const col    = Number(tile.dataset.col);
          const isEdge = Math.abs(col) === 2;

          // Pure scale + fade pop-in — no position offset (tiles already at grid coords)
          tl.fromTo(tile,
            { scale: .55, autoAlpha: 0 },
            {
              scale: 1, autoAlpha: isEdge ? .6 : 1,
              duration: .78, ease: 'back.out(1.4)',
            }, at)
          .fromTo(tile.querySelector('img'),
            { scale: 1.15 },
            { scale: 1, duration: .9, ease: 'power1.out' }, at);

          // Outer-column tiles get heavy blur — depth cue like reference
          if (isEdge) {
            tl.set(tile, { filter: 'blur(4px)' }, at + .78);
          }
        });

        // Tail: hold the grid for a beat
        tl.to({}, { duration: .28 });

        return () => { section.classList.remove('is-scroll-story'); };
      });
    })();

    /* ---------- Cinematic footer: portrait drift + content entrance ---------- */
    (function footerCinematic() {
      const footer = document.querySelector('[data-footer-cin]');
      if (!footer) return;
      const img = footer.querySelector('[data-footer-img]');
      const content = footer.querySelector('[data-footer-content]');
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        // Portrait: subtle scale zoom as footer scrolls into view
        if (img) {
          gsap.fromTo(img,
            { scale: 1.06, yPercent: 2 },
            { scale: 1.0, yPercent: -1.5, ease: 'none',
              scrollTrigger: { trigger: footer, start: 'top bottom', end: 'bottom top', scrub: 1.2 }
            }
          );
        }
        // Content: gentle entrance as footer arrives
        if (content) {
          gsap.fromTo(content,
            { autoAlpha: 0, y: 28 },
            { autoAlpha: 1, y: 0, duration: .9, ease: 'power2.out',
              scrollTrigger: { trigger: footer, start: 'top 80%', toggleActions: 'play none none reverse' }
            }
          );
        }
      });
    })();

    /* ---------- Hero depth: video and type travel at different speeds ---------- */
    (function heroDepth() {
      const hero = document.querySelector('.hero--cinema');
      if (!hero) return;
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(hero.querySelectorAll('.hero__media > img,.hero__media > video'), {
          scale: 1.08, yPercent: -2,
        }, { scale: 1.02, yPercent: 3, ease: 'none', scrollTrigger: {
          trigger: hero, start: 'top top', end: 'bottom top', scrub: .8,
        }});
        gsap.to(hero.querySelector('.hero__inner'), { y: -55, opacity: .35, ease: 'none', scrollTrigger: {
          trigger: hero, start: 'top top', end: 'bottom top', scrub: .8,
        }});
      });
    })();

    if (!reduced) {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(({ target, intersectionRatio }) => {
          if (intersectionRatio < 0.6) return;
          counterObserver.unobserve(target);
          const count = Number(target.dataset.trustCount);
          const value = { current: 0 };
          gsap.to(value, {
            current: count,
            duration: 2.2,
            ease: "none",
            onUpdate: () => { target.textContent = Math.floor(value.current); },
            onComplete: () => { target.textContent = count; },
          });
        });
      }, { threshold: 0.6 });
      document.querySelectorAll("[data-trust-count]").forEach((number) => {
        number.textContent = "0";
        counterObserver.observe(number);
      });
    }

    /* ---------- Problem: editorial redesign ---------- */
    (function problem() {

      /* ---- Text scramble utility ---- */
      const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&";
      function scrambleText(el, finalText, duration) {
        if (reduced) { el.textContent = finalText; return; }
        const len = finalText.length;
        let frame = 0;
        const totalFrames = Math.round(duration / 40); // ~40ms per tick
        const resolved = new Array(len).fill(false);
        const raf = { id: null };

        function tick() {
          frame++;
          // progressively lock characters from left as we approach end
          const lockProgress = frame / totalFrames;
          let result = "";
          for (let i = 0; i < len; i++) {
            if (finalText[i] === " ") { result += " "; continue; }
            if (finalText[i] === ".") { result += "."; continue; }
            if (finalText[i] === "Ä") { result += finalText[i]; continue; }
            if (finalText[i] === "Ö") { result += finalText[i]; continue; }
            if (finalText[i] === "Ü") { result += finalText[i]; continue; }
            if (resolved[i] || (i / len) < lockProgress * 1.4) {
              resolved[i] = true;
              result += finalText[i];
            } else {
              result += CHARS[Math.floor(Math.random() * CHARS.length)];
            }
          }
          el.textContent = result;
          if (frame < totalFrames) {
            raf.id = setTimeout(tick, 40);
          } else {
            el.textContent = finalText;
          }
        }
        tick();
        return raf;
      }

      /* ---- Star reveal on heading ---- */
      const star = document.querySelector(".problem__star");
      if (star) {
        ST.create({
          trigger: ".problem__heading-track",
          start: "top 70%",
          onEnter() { star.classList.add("is-visible"); },
          onLeaveBack() { star.classList.remove("is-visible"); }
        });
      }

      /* ---- Circle pop-in + scramble text on scroll-enter ---- */
      function revealCircle(inner, label, finalText) {
        inner.classList.add("is-revealed");
        if (label && finalText && !reduced) {
          setTimeout(() => scrambleText(label, finalText, 700), 220);
        }
      }

      document.querySelectorAll("[data-problem-circle]").forEach((cell) => {
        const inner = cell.querySelector(".problem__circle-inner");
        const label = cell.querySelector(".problem__circle-label");
        const finalText = label ? (label.dataset.scramble || label.textContent.trim()) : "";
        let activeScramble = null;

        /* Check if already in viewport on page load */
        const rect = cell.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) {
          /* already visible — reveal immediately with a small delay */
          setTimeout(() => revealCircle(inner, label, finalText), 400);
          return;
        }

        ST.create({
          trigger: cell,
          start: "top 80%",
          onEnter() {
            if (activeScramble) { clearTimeout(activeScramble.id); activeScramble = null; }
            revealCircle(inner, label, finalText);
          },
          onLeaveBack() {
            inner.classList.remove("is-revealed");
            if (activeScramble) { clearTimeout(activeScramble.id); activeScramble = null; }
            if (label && finalText) label.textContent = finalText;
          }
        });
      });

      /* ---- Scrubbed statement word-reveal ---- */
      const statEl = document.querySelector("[data-statement] .problem__statement-text");
      if (statEl && !reduced) {
        const words = PM.splitWords(statEl);
        gsap.from(words, {
          color: "#8793A3",
          stagger: 0.08,
          ease: "none",
          scrollTrigger: { trigger: statEl, start: "top 85%", end: "bottom 50%", scrub: 0.35 }
        });
      }

    })();

    /* ---------- Audience toggle ---------- */
    (function audience() {
      const toggle = document.querySelector(".audience__toggle");
      if (!toggle) return;
      const tabs = toggle.querySelectorAll("[data-audience-tab]");
      const panels = document.querySelectorAll("[data-audience-panel]");
      const imgs = document.querySelectorAll("[data-audience-img]");
      const activate = (key) => {
        if ((toggle.dataset.active || "yes") === key) return;
        toggle.dataset.active = key;
        tabs.forEach((tab) => {
          const active = tab.dataset.audienceTab === key;
          tab.classList.toggle("is-active", active);
          tab.setAttribute("aria-selected", String(active));
          tab.tabIndex = active ? 0 : -1;
        });
        imgs.forEach((img) => img.classList.toggle("is-active", img.dataset.audienceImg === key));
        panels.forEach((panel) => {
          const active = panel.dataset.audiencePanel === key;
          gsap.killTweensOf(panel.children);
          panel.hidden = !active;
          if (active && !reduced) {
            gsap.fromTo(panel.children, { opacity: 0, y: 10 }, {
              opacity: 1, y: 0, duration: 0.5, stagger: 0.055, ease: "power2.out", clearProps: "opacity,transform",
            });
          }
        });
        ST.refresh();
      };
      tabs.forEach((tab) => tab.addEventListener("click", () => activate(tab.dataset.audienceTab)));
      toggle.addEventListener("keydown", (e) => {
        if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
        e.preventDefault();
        const key = e.key === "Home" ? "yes" : e.key === "End" ? "no" : toggle.dataset.active === "no" ? "yes" : "no";
        activate(key);
        toggle.querySelector('[aria-selected="true"]').focus();
      });
    })();

    /* ---------- G5: pinned horizontal journey ---------- */
    (function g5() {
      const section = document.querySelector("[data-g5]");
      if (!section) return;
      const pin = section.querySelector(".g5__pin");
      const track = section.querySelector("[data-g5-track]");
      const stages = section.querySelectorAll("[data-g5-stage]");
      const navBtns = section.querySelectorAll("[data-g5-go]");
      const nodes = section.querySelectorAll(".g5__node");
      const line = section.querySelector("[data-g5-line]");
      let active = -1;
      let pinned = null;
      const setActive = (index) => {
        if (index === active) return;
        active = index;
        navBtns.forEach((button, i) => {
          button.classList.toggle("is-active", i === index);
          if (i === index) button.setAttribute("aria-current", "step");
          else button.removeAttribute("aria-current");
        });
        nodes.forEach((node, i) => node.classList.toggle("is-active", i <= index));
      };
      setActive(0);
      gsap.matchMedia().add({
        horizontal: "(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)",
        vertical: "(width < 1024px), (height < 700px), (prefers-reduced-motion: reduce)",
      }, ({ conditions }) => {
        if (!conditions.horizontal) {
          stages.forEach((stage, i) => ST.create({
            trigger: stage, start: "top 60%", end: "bottom 60%",
            onEnter: () => setActive(i), onEnterBack: () => setActive(i),
          }));
          return;
        }
        section.classList.add("is-horizontal");
        const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);
        const tween = gsap.to(track, {
          x: () => -distance(), ease: "none",
          onUpdate() {
            const progress = this.progress();
            setActive(Math.round(progress * (stages.length - 1)));
            line.style.strokeDashoffset = String(1000 * (1 - progress));
          },
          scrollTrigger: {
            trigger: pin, start: "top top", end: () => "+=" + distance(),
            pin: true, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true,
          },
        });
        pinned = tween.scrollTrigger;
        return () => {
          pinned = null;
          section.classList.remove("is-horizontal");
          line.style.removeProperty("stroke-dashoffset");
        };
      });
      navBtns.forEach((button, i) => button.addEventListener("click", () => {
        if (pinned) {
          const target = pinned.start + (pinned.end - pinned.start) * i / (stages.length - 1);
          if (PM.lenis) PM.scrollTo(target, { offset: 0, duration: 1.1 });
          else window.scrollTo({ top: target, behavior: "smooth" });
        } else {
          setActive(i);
          PM.scrollTo(stages[i], { offset: -90 });
        }
      }));
    })();

    /* ---------- Process: pinned step transitions ---------- */
    (function process() {
      const section = document.getElementById("ablauf");
      if (!section) return;
      const scroll = section.querySelector(".process__scroll");
      const stage = section.querySelector(".process__stage");
      const status = section.querySelector(".process__status");
      const current = status.querySelector("[data-process-current]");
      const total = status.querySelector("[data-process-total]");
      const cards = [...stage.querySelectorAll(".pcard")];
      const format = (number) => String(number).padStart(2, "0");

      gsap.matchMedia().add("(prefers-reduced-motion: no-preference) and (min-height: 570px)", () => {
        let active = -1;
        function render(progress) {
          const phase = Math.max(.5, Math.min(cards.length - .5, progress * cards.length));
          const step = Math.floor(phase);
          cards.forEach((card, index) => {
            const offset = index + .5 - phase;
            const blend = Math.max(0, Math.min(1, (Math.abs(offset) - .32) / .36));
            const fade = blend * blend * (3 - 2 * blend);
            card.style.setProperty("--process-opacity", String(1 - fade));
            card.style.setProperty("--process-shift", `${Math.sign(offset) * fade * 22}px`);
          });
          if (active === step) return;
          cards[active]?.classList.remove("is-current");
          cards[step].classList.add("is-current");
          current.textContent = format(step + 1);
          active = step;
        }

        section.classList.add("is-scroll-driven");
        scroll.style.setProperty("--process-steps", cards.length);
        total.textContent = format(cards.length);
        status.hidden = false;
        render(0);
        ST.create({
          trigger: scroll,
          start: () => `top ${getComputedStyle(stage).top}`,
          end: () => `+=${scroll.offsetHeight - stage.offsetHeight}`,
          onUpdate: ({ progress }) => render(progress),
          onRefresh: ({ progress }) => render(progress),
        });

        return () => {
          section.classList.remove("is-scroll-driven");
          status.hidden = true;
          scroll.style.removeProperty("--process-steps");
          cards.forEach((card) => {
            card.classList.remove("is-current");
            card.style.removeProperty("--process-opacity");
            card.style.removeProperty("--process-shift");
          });
        };
      });
    })();

    /* ---------- Coaching reveal: sticky overlap + corner-radius scrub ---------- */
    (function coachingReveal() {
      const wrapper   = document.querySelector('.coaching-reveal');
      const section   = document.querySelector('.services-bento');
      const preceding = wrapper && wrapper.previousElementSibling; // coach-story section
      if (!wrapper || !section || !preceding || reduced) return;

      /* Starting radius values */
      const radiusStart = window.matchMedia('(min-width: 700px)').matches ? 64 : 32;

      /* 1. Pin the preceding section in place while the new one slides over it */
      ST.create({
        trigger: wrapper,
        start: 'top bottom',   /* when wrapper top hits viewport bottom, start pinning */
        end: () => `+=${section.offsetHeight * 0.65}`, /* release after partial overlap */
        pin: preceding,
        pinSpacing: false,
        anticipatePin: 1,
        id: 'coaching-pin',
      });

      /* 2. Scrub corner radius from radiusStart → 0 as section top reaches viewport top */
      gsap.set(section, { '--bento-radius': `${radiusStart}px` });

      ST.create({
        trigger: section,
        start: 'top bottom',   /* section enters viewport from bottom */
        end: 'top top',        /* section top reaches viewport top → radius = 0 */
        scrub: true,
        onUpdate(self) {
          const r = radiusStart * (1 - self.progress);
          section.style.setProperty('--bento-radius', `${r.toFixed(2)}px`);
          section.style.borderRadius = `${r.toFixed(2)}px ${r.toFixed(2)}px 0 0`;
        },
        onLeave() {
          section.style.borderRadius = '0 0 0 0';
        },
        onEnterBack() {
          /* radius will re-animate as user scrolls back */
        },
      });

      /* 3. Subtle card content reveal (opacity + small y lift) */
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        const cards = section.querySelectorAll('.services-bento__card');
        cards.forEach((card, i) => {
          gsap.fromTo(card,
            { opacity: 0.4, y: 24 },
            {
              opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
              scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' },
              delay: i * 0.07,
            }
          );
        });
      });
    })();

    /* ---------- Final CTA: mask reveal ---------- */
    (function finalCta() {
      const sec = document.querySelector("[data-final]");
      const media = sec && sec.querySelector("[data-final-media]");
      if (!media || reduced) return;
      const img = media.querySelector("img");
      gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 85%", end: "top 15%", scrub: 0.6 } })
        .to(media, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none" }, 0)
        .to(img, { scale: 1, ease: "none" }, 0);
      gsap.to(img, { yPercent: 8, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true } });
    })();
  }
  if (window.PM && window.PM.ready) run(); else document.addEventListener("pm:ready", run, { once: true });
})();

/* ================================================================
   EVERYDAY PLAN — scroll-triggered word flip
   ================================================================ */
(function howItWorks() {
  const section = document.querySelector('.how-it-works');
  if (!section) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        section.classList.add('is-visible');
        obs.disconnect();
      }
    });
  }, { threshold: 0.15 });
  obs.observe(section);
})();

/* ================================================================
   INFOGRAPHIC CARDS — Fortschritt + Ernährung
   IntersectionObserver: start when visible, pause when off-screen
   ================================================================ */
(function infographicCards() {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- FORTSCHRITT ---- */
  (function fortschrittCard() {
    const card = document.querySelector('[data-infographic="fortschritt"]');
    if (!card) return;

    const arcDrawn   = card.querySelector('.arc-drawn');
    const steps      = card.querySelectorAll('.infographic__step');
    const pauseBtn   = card.querySelector('[data-pause-infographic="fortschritt"]');

    let paused   = false;
    let stepIdx  = -1;
    let stepTimer = null;

    const STEP_TIMES = [0, 2200, 4400]; // ms offset within 7000ms cycle

    function activateStep(idx) {
      steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    }

    function runStepSequence() {
      if (paused || reduced) return;
      STEP_TIMES.forEach((t, i) => {
        setTimeout(() => {
          if (!paused) activateStep(i);
        }, t);
      });
      // reset after arc loop (7s)
      setTimeout(() => {
        if (!paused) activateStep(-1);
      }, 6500);
    }

    function startAnimation() {
      if (reduced) {
        // Static: arc fully drawn, all steps visible
        if (arcDrawn) {
          arcDrawn.style.strokeDashoffset = '0';
          arcDrawn.style.opacity = '1';
        }
        steps.forEach(s => s.classList.add('is-active'));
        return;
      }
      if (arcDrawn) arcDrawn.classList.add('is-animating');
      runStepSequence();
      // repeat step sequence every 7s to match keyframe loop
      stepTimer = setInterval(runStepSequence, 7000);
    }

    function stopAnimation() {
      if (arcDrawn) arcDrawn.classList.remove('is-animating');
      clearInterval(stepTimer);
      activateStep(-1);
    }

    function togglePause() {
      paused = !paused;
      if (paused) {
        stopAnimation();
        pauseBtn && pauseBtn.setAttribute('aria-label', 'Animation fortsetzen');
        pauseBtn && (pauseBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><polygon points="3,2 10,6 3,10" fill="currentColor"/></svg>');
        pauseBtn && pauseBtn.setAttribute('data-paused', 'true');
      } else {
        startAnimation();
        pauseBtn && pauseBtn.setAttribute('aria-label', 'Animation pausieren');
        pauseBtn && (pauseBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><rect x="2" y="2" width="3" height="8" rx="1" fill="currentColor"/><rect x="7" y="2" width="3" height="8" rx="1" fill="currentColor"/></svg>');
        pauseBtn && pauseBtn.removeAttribute('data-paused');
      }
    }

    if (pauseBtn) pauseBtn.addEventListener('click', togglePause);

    // IntersectionObserver: play when >=30% visible, stop when off-screen
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !paused) {
          startAnimation();
        } else if (!e.isIntersecting && !paused) {
          stopAnimation();
        }
      });
    }, { threshold: 0.3 });
    obs.observe(card);
  })();

  /* ---- ERNÄHRUNG ---- */
  (function ernaehrungCard() {
    const card = document.querySelector('[data-infographic="ernaehrung"]');
    if (!card) return;

    const ring       = card.querySelector('.plate-ring-outer');
    const labels     = card.querySelectorAll('.plate-label');
    const contexts   = card.querySelectorAll('.context-panel');
    const pauseBtn   = card.querySelector('[data-pause-infographic="ernaehrung"]');

    let paused    = false;
    let timers    = [];

    // Staggered reveal timings (ms)
    const LABEL_TIMES   = [600, 1400, 2200];
    const CONTEXT_TIMES = [3000, 4200];
    const CYCLE = 9000; // full loop

    function clearTimers() {
      timers.forEach(t => clearTimeout(t));
      timers = [];
    }

    function hideAll() {
      labels.forEach(l  => l.classList.remove('is-visible'));
      contexts.forEach(c => c.classList.remove('is-visible'));
    }

    function runCycle() {
      if (paused || reduced) return;
      hideAll();
      LABEL_TIMES.forEach((t, i) => {
        const tid = setTimeout(() => {
          if (!paused && labels[i]) labels[i].classList.add('is-visible');
        }, t);
        timers.push(tid);
      });
      CONTEXT_TIMES.forEach((t, i) => {
        const tid = setTimeout(() => {
          if (!paused && contexts[i]) contexts[i].classList.add('is-visible');
        }, t);
        timers.push(tid);
      });
      // fade out before reset
      const fadeOut = setTimeout(() => {
        if (!paused) hideAll();
      }, CYCLE - 700);
      timers.push(fadeOut);
    }

    let cycleInterval = null;

    function startAnimation() {
      if (reduced) {
        labels.forEach(l  => l.classList.add('is-visible'));
        contexts.forEach(c => c.classList.add('is-visible'));
        if (ring) ring.classList.add('is-animating');
        return;
      }
      if (ring) ring.classList.add('is-animating');
      runCycle();
      cycleInterval = setInterval(runCycle, CYCLE);
    }

    function stopAnimation() {
      if (ring) ring.classList.remove('is-animating');
      clearTimers();
      clearInterval(cycleInterval);
      hideAll();
    }

    function togglePause() {
      paused = !paused;
      if (paused) {
        stopAnimation();
        pauseBtn && pauseBtn.setAttribute('aria-label', 'Animation fortsetzen');
        pauseBtn && (pauseBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><polygon points="3,2 10,6 3,10" fill="currentColor"/></svg>');
        pauseBtn && pauseBtn.setAttribute('data-paused', 'true');
      } else {
        startAnimation();
        pauseBtn && pauseBtn.setAttribute('aria-label', 'Animation pausieren');
        pauseBtn && (pauseBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><rect x="2" y="2" width="3" height="8" rx="1" fill="currentColor"/><rect x="7" y="2" width="3" height="8" rx="1" fill="currentColor"/></svg>');
        pauseBtn && pauseBtn.removeAttribute('data-paused');
      }
    }

    if (pauseBtn) pauseBtn.addEventListener('click', togglePause);

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !paused) {
          startAnimation();
        } else if (!e.isIntersecting && !paused) {
          stopAnimation();
        }
      });
    }, { threshold: 0.3 });
    obs.observe(card);
  })();

})();
