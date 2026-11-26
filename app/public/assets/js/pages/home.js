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
          fontSize: () => fullW() * (small() ? .22 : .17),
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
        // Sort tiles OUTSIDE-IN so outermost edges pop first (like thegrind reference)
        tiles.sort((a, b) => {
          const dist = el => Math.abs(Number(el.dataset.col)) + Math.abs(Number(el.dataset.row));
          return dist(b) - dist(a); // descending = edges first
        }).forEach((tile, i) => {
          const at     = 2.38 + i * .042;
          const col    = Number(tile.dataset.col);
          const row    = Number(tile.dataset.row);
          const isEdge = Math.abs(col) === 2;

          // Entry direction: tiles fly in FROM the edges of the frame
          const fromX = col * (tileW() + gap()) * 0.35;
          const fromY = row * (tileH() + gap()) * 0.25;

          // Spring pop-in with scale + position offset + fade
          tl.fromTo(tile,
            { scale: .5, autoAlpha: 0, x: `+=${fromX}`, y: `+=${fromY}` },
            {
              scale: 1, autoAlpha: isEdge ? .6 : 1,
              x: `+=0`, y: `+=0`,
              duration: .92, ease: 'back.out(1.6)',
            }, at)
          .fromTo(tile.querySelector('img'),
            { scale: 1.18 },
            { scale: 1, duration: 1.1, ease: 'power1.out' }, at);

          // Outer-column tiles get heavy blur — depth cue like reference
          if (isEdge) {
            tl.set(tile, { filter: 'blur(4px)' }, at + .92);
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

    /* ---------- Problem: image swap ---------- */
    (function problem() {
      const rows = document.querySelectorAll("[data-problem]");
      const imgs = document.querySelectorAll("[data-problem-img]");
      const cap = document.querySelector("[data-problem-caption]");
      if (!rows.length) return;
      const setActive = (id) => {
        rows.forEach((r) => r.classList.toggle("is-active", r.dataset.problem === id));
        imgs.forEach((im) => im.classList.toggle("is-active", im.dataset.problemImg === id));
        const row = Array.from(rows).find((r) => r.dataset.problem === id);
        if (cap && row) cap.textContent = row.dataset.caption || "";
      };
      setActive("1");
      rows.forEach((r) => {
        r.addEventListener("mouseenter", () => setActive(r.dataset.problem));
        r.addEventListener("focusin", () => setActive(r.dataset.problem));
        ST.create({ trigger: r, start: "top 55%", end: "bottom 55%", onEnter: () => setActive(r.dataset.problem), onEnterBack: () => setActive(r.dataset.problem) });
      });
    })();

    /* ---------- Problem: scrubbed statement ---------- */
    (function statement() {
      const el = document.querySelector("[data-statement] .problem__statement-text");
      if (!el || reduced) return;
      const words = PM.splitWords(el);
      gsap.from(words, { color: "#8793A3", stagger: 0.08, ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 50%", scrub: 0.35 } });
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
