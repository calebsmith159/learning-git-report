/*
 * Learning Git: animated SVG scenes for each concept.
 *
 * Each <figure data-viz="name"> gets a paused GSAP timeline built by scenes[name].
 * Timelines play once when scrolled into view and can be replayed with the button.
 *
 * Rule of thumb inside a scene: the FIRST tween on an element that starts hidden
 * is a fromTo (so it is hidden before the timeline plays); later changes use .to().
 */

gsap.defaults({ ease: "power2.out", duration: 0.6 });

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Helpers shared by every scene ---------- */
function createKit(svg, captionEl) {
    const $ = gsap.utils.selector(svg);
    const targets = (t) => (typeof t === "string" ? $(t) : gsap.utils.toArray(t));
    const tl = gsap.timeline({ paused: true });
    const steps = [];
    const resetters = [];

    return {
        tl,
        $,
        steps,
        resetters,

        // Updates the caption under the visual at this point in the timeline.
        step(text, position) {
            steps.push(text);
            tl.call(() => { captionEl.textContent = text; }, null, position);
        },

        show(t, position, vars = {}) {
            tl.fromTo(targets(t), { opacity: 0 }, { opacity: 1, duration: 0.4, ...vars }, position);
        },

        pop(t, position, vars = {}) {
            tl.fromTo(
                targets(t),
                { opacity: 0, scale: 0, transformOrigin: "50% 50%" },
                { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)", ...vars },
                position
            );
        },

        drop(t, position, vars = {}) {
            tl.fromTo(targets(t), { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.45, ...vars }, position);
        },

        // Draws a stroked path from start to end using stroke-dashoffset.
        // The extra gap keeps round line caps from showing as dots before the path draws.
        draw(t, position, vars = {}) {
            targets(t).forEach((el, i) => {
                const length = el.getTotalLength();
                tl.fromTo(
                    el,
                    { strokeDasharray: `${length} ${length + 20}`, strokeDashoffset: length + 10 },
                    { strokeDashoffset: 0, duration: 0.8, ease: "power1.inOut", ...vars },
                    i === 0 ? position : "<"
                );
            });
        },

        // Typewriter effect for an SVG <text> element.
        type(t, position, duration = 1.2) {
            const el = targets(t)[0];
            const full = el.textContent;
            const progress = { chars: 0 };
            const clear = () => { el.textContent = ""; };
            if (!prefersReducedMotion) clear();
            resetters.push(clear);
            tl.fromTo(progress, { chars: 0 }, {
                chars: full.length,
                duration,
                ease: "none",
                onUpdate: () => { el.textContent = full.slice(0, Math.round(progress.chars)); },
            }, position);
        },

        // Moves an element sideways by dx while lifting it up (or down, if lift < 0) in an arc.
        arc(t, dx, lift, position, duration = 1.1) {
            const els = targets(t);
            tl.to(els, { x: dx, duration, ease: "power1.inOut" }, position)
                .to(els, { y: -lift, duration: duration / 2, ease: "sine.out" }, "<")
                .to(els, { y: 0, duration: duration / 2, ease: "sine.in" }, `<${duration / 2}`);
        },
    };
}

/* ---------- One scene per concept ---------- */
const scenes = {
    repository({ step, pop, drop, draw, show }) {
        step("Start with an ordinary project folder", 0);
        pop(".r-folder", 0, { ease: "back.out(1.4)", duration: 0.6 });
        drop(".r-file", "+=0.1", { stagger: 0.15 });

        step("git init adds a hidden .git folder, and Git starts tracking every change", "+=0.5");
        pop(".r-git", "<");
        pop(".r-track", "+=0.2", { stagger: 0.15 });

        step("Push it to a host like GitHub so others can see, clone and contribute", "+=0.8");
        draw(".r-link", "<", { duration: 0.6 });
        show(".r-link-label", "<");
        pop(".r-cloud", "-=0.2", { ease: "back.out(1.4)", duration: 0.6 });
        show(".r-hosts", "+=0.1");
    },

    clone({ tl, $, step, show, pop, draw, type, arc }) {
        step("The repository lives on GitHub", 0);
        show(".cl-remote", 0);
        pop(".cl-src", "-=0.1", { stagger: 0.12 });
        show(".cl-local", "+=0.1");

        step("Run git clone with the repo's URL", "+=0.4");
        type(".cl-cmd", "<", 1.4);

        step("Every file and the full commit history are copied to your machine", "+=0.3");
        tl.addLabel("fly");
        show(".cl-fly", "fly", { duration: 0.1 });
        $(".cl-fly").forEach((el, i) => arc(el, 332, 50, `fly+=${i * 0.15}`, 1));
        draw(".cl-edge-local", "fly+=0.9", { duration: 0.6 });
        show(".cl-hash-local", "-=0.2", { stagger: 0.08 });

        step("Your copy remembers where it came from: a remote named “origin”", "+=0.4");
        draw(".cl-origin", "<");
        show(".cl-origin-label", "-=0.3");
    },

    branch({ step, pop, draw, show }) {
        step("main holds the stable, shipped code", 0);
        draw(".b-main-line", 0, { duration: 1 });
        pop(".b-main-c1", "-=0.6", { stagger: 0.15 });
        pop(".b-main-pill", "-=0.2");

        step("git switch -c feature/navbar starts a parallel timeline", "+=0.5");
        draw(".b-feat-line", "<", { duration: 1 });
        pop(".b-feat-pill", "-=0.3");

        step("Commit freely on the branch while main stays untouched", "+=0.3");
        pop(".b-feat-c", "<", { stagger: 0.35 });
        show(".b-note", "-=0.3");

        step("Meanwhile, main can keep moving too", "+=0.5");
        pop(".b-main-c2", "<", { stagger: 0.35 });
    },

    commit({ tl, $, step, pop, show, draw, drop }) {
        step("You edit a file and Git notices what changed", 0);
        pop(".cm-file", 0, { ease: "back.out(1.5)" });
        tl.fromTo($(".cm-hl"), { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.5, stagger: 0.25 }, "+=0.2");

        step("git add moves the changes into the staging area", "+=0.6");
        show(".cm-add", "<");
        tl.to($(".cm-file"), { x: 210, duration: 0.9, ease: "power2.inOut" }, "<");

        step("git commit takes a snapshot of everything staged…", "+=0.5");
        show(".cm-commit-label", "<");
        tl.to($(".cm-file"), { x: 460, scale: 0.15, opacity: 0, duration: 0.8, ease: "power2.in" }, "<");
        tl.fromTo($(".cm-flash"), { opacity: 0 }, { opacity: 0.75, duration: 0.08, yoyo: true, repeat: 1 }, "-=0.15");
        draw(".cm-edge", "<", { duration: 0.4 });
        pop(".cm-new", "-=0.1");

        step("…and saves it forever with a unique ID and your message", "+=0.3");
        drop(".cm-msg", "<");
    },

    "push-pull"({ step, show, pop, draw, arc }) {
        step("Your laptop and GitHub start in sync", 0);
        show(".pp-card", 0, { stagger: 0.1 });

        step("You make a new commit on your laptop", "+=0.6");
        draw(".pp-seg-local-c", "<", { duration: 0.4 });
        pop(".pp-local-c", "-=0.1");

        step("git push uploads it to GitHub", "+=0.6");
        show(".pp-push-pill", "<");
        show(".pp-push-fly", "<", { duration: 0.01 });
        arc(".pp-push-fly", 332, 70, "<", 1.2);
        draw(".pp-seg-remote-c", "-=0.3", { duration: 0.3 });

        step("A teammate pushes commit D to GitHub", "+=0.6");
        draw(".pp-seg-remote-d", "<", { duration: 0.4 });
        pop(".pp-remote-d", "-=0.1");

        step("git pull downloads it and merges it into your copy", "+=0.6");
        show(".pp-pull-pill", "<");
        show(".pp-pull-fly", "<", { duration: 0.01 });
        arc(".pp-pull-fly", -332, -70, "<", 1.2);
        draw(".pp-seg-local-d", "-=0.3", { duration: 0.3 });
    },

    diff({ tl, $, step, show, pop }) {
        step("The same file on two different branches", 0);
        show(".df-panel", 0, { stagger: 0.15 });
        show(".df-code", "-=0.2", { stagger: 0.15 });

        step("git diff compares them line by line", "+=0.4");
        tl.fromTo($(".df-scan"), { opacity: 0, y: 0 }, { opacity: 0.9, duration: 0.2 }, "<");
        tl.addLabel("scan");
        tl.to($(".df-scan"), { y: 134, duration: 1.6, ease: "none" }, "scan");
        show(".df-del", "scan+=0.65", { duration: 0.3 });
        show(".df-add1", "scan+=0.65", { duration: 0.3 });
        show(".df-add2", "scan+=1.2", { duration: 0.3 });
        tl.to($(".df-scan"), { opacity: 0, duration: 0.2 });

        step("Red lines were removed, green lines were added, and everything else is unchanged", "<");

        step("Summary: 2 additions, 1 deletion", "+=1");
        pop(".df-summary", "<", { ease: "back.out(1.6)" });
    },

    merge({ tl, $, step, draw, pop, show }) {
        step("Work happened on both main and the feature branch", 0);
        draw(".m-main-a", 0);
        draw(".m-feat", "-=0.4");
        pop(".m-c", "-=0.3", { stagger: 0.1 });
        pop(".m-pill", "-=0.2", { stagger: 0.1 });

        step("From main, run git merge feature/navbar", "+=0.6");
        draw(".m-join", "<", { duration: 0.9 });
        draw(".m-main-b", "<", { duration: 0.9 });

        step("A merge commit ties both histories together, and nothing is lost", "+=0.1");
        pop(".m-merge", "<");
        show(".m-ring", "<", { opacity: 0.9, duration: 0.01 });
        tl.to($(".m-ring"), { opacity: 0, scale: 2.6, transformOrigin: "50% 50%", duration: 0.9 }, "<");
        show(".m-note", "-=0.5");
    },

    rebase({ tl, $, step, draw, pop, show, arc }) {
        step("feature branched from B, but main has moved on (E, F)", 0);
        draw(".rb-main", 0);
        draw(".rb-old-path", "-=0.4");
        pop(".rb-c", "-=0.3", { stagger: 0.08 });
        pop(".rb-pill", "-=0.2", { stagger: 0.1 });

        step("git rebase main lifts your commits off their old base…", "+=0.7");
        tl.to($(".rb-old"), { y: -18, opacity: 0.3, duration: 0.5, stagger: 0.1 }, "<");
        tl.to($(".rb-old-path"), { opacity: 0.2, duration: 0.5 }, "<");

        step("…and replays them on top of the latest main as new commits C′ and D′", "+=0.5");
        draw(".rb-new-path", "<", { duration: 0.8 });
        tl.addLabel("replay", "<0.3");
        show(".rb-new", "replay", { duration: 0.2 });
        $(".rb-new").forEach((el, i) => arc(el, 200, 30, `replay+=${i * 0.25}`, 1));
        tl.to($(".rb-feat-pill"), { x: 200, duration: 1, ease: "power2.inOut" }, "replay");

        step("Result: one straight line of history, as if you'd started today", "+=0.7");
        tl.to($(".rb-old, .rb-old-path"), { opacity: 0, duration: 0.5 }, "<");
    },

    "merge-conflict"({ tl, $, step, drop, draw, pop, show }) {
        step("Both branches changed the same line of index.html", 0);
        drop(".cf-card", 0, { stagger: 0.2 });

        step("git merge can't guess which version you want, so it stops", "+=0.7");
        draw(".cf-arrow", "<", { duration: 0.6 });
        pop(".cf-file", "-=0.2", { ease: "back.out(1.3)" });
        pop(".cf-bad", "-=0.1");

        step("Git marks both versions between <<<<<<< and >>>>>>>", "+=0.2");
        show(".cf-line", "<", { stagger: 0.18 });

        step("You edit the file to what it should be and delete the markers…", "+=1.2");
        tl.to($(".cf-line"), { opacity: 0, x: -10, duration: 0.35, stagger: 0.06 }, "<");
        show(".cf-resolved", "-=0.1");

        step("…then git add and git commit to finish the merge", "+=0.8");
        tl.to($(".cf-bad"), { opacity: 0, scale: 0.6, duration: 0.3 }, "<");
        pop(".cf-good", "<0.15");
    },

    "pull-request"({ tl, $, step, show, pop, draw, drop }) {
        step("You open a PR: “please review and merge my branch”", 0);
        show(".pr-card", 0);
        show(".pr-head", "-=0.1", { stagger: 0.1 });
        pop(".pr-open", "<");
        draw(".pr-g-main, .pr-g-feat", "-=0.1");
        pop(".pr-g-c", "-=0.3", { stagger: 0.1 });
        show(".pr-btn", "<");

        step("Teammates review the diff and leave comments", "+=0.6");
        drop(".pr-row1", "<");

        step("You push a fix, and the PR updates automatically", "+=1");
        drop(".pr-row2", "<");
        pop(".pr-g-c2", "<0.2");

        step("Automated checks pass and a reviewer approves", "+=1");
        drop(".pr-row3", "<");

        step("Merge! The branch lands on main", "+=1");
        tl.to($(".pr-btn"), { scale: 0.94, transformOrigin: "50% 50%", duration: 0.1, yoyo: true, repeat: 1 }, "<");
        show(".pr-btn-merged", ">", { duration: 0.3 });
        tl.to($(".pr-open"), { opacity: 0, duration: 0.3 }, "<");
        show(".pr-merged", "<", { duration: 0.3 });
        draw(".pr-g-join", "<", { duration: 0.6 });
        pop(".pr-g-merge", "-=0.1");
    },

    issue({ tl, $, step, drop, show, pop, draw }) {
        step("An issue is a ticket: a bug, a feature request, or a task", 0);
        drop(".iss-type", 0, { stagger: 0.12 });

        step("This one is a bug, with clear steps to reproduce", "+=0.6");
        tl.to($(".iss-type-other"), { opacity: 0.25, duration: 0.3 }, "<");
        show(".iss-card", "<");
        show(".iss-body", "-=0.1", { stagger: 0.12 });
        show(".iss-open", "<");

        step("Labels and an assignee help everyone triage and track it", "+=0.6");
        pop(".iss-label", "<", { stagger: 0.12 });
        drop(".iss-assignee", "-=0.1");

        step("A pull request says “Fixes #42” to link the work", "+=1");
        tl.to($(".iss-type"), { opacity: 0, y: -10, duration: 0.3 }, "<");
        draw(".iss-link", "-=0.05", { duration: 0.4 });
        tl.fromTo($(".iss-pr"), { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.5 }, "-=0.1");

        step("When the PR merges, the issue closes automatically", "+=1");
        pop(".iss-pr-merged", "<");
        tl.to($(".iss-open"), { opacity: 0, duration: 0.25 }, "<0.3");
        show(".iss-closed", "<", { duration: 0.3 });
    },
};

/* ---------- Wire up every figure ---------- */
const timelines = new Map();

const playWhenVisible = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const tl = timelines.get(entry.target);
        if (tl && tl.progress() === 0) tl.play();
        playWhenVisible.unobserve(entry.target);
    });
}, { threshold: 0.5 });

document.querySelectorAll("[data-viz]").forEach((figure) => {
    const build = scenes[figure.dataset.viz];
    if (!build) return;

    const caption = figure.querySelector(".viz-caption");
    const bar = figure.querySelector(".viz-progress span");
    const kit = createKit(figure.querySelector("svg"), caption);
    build(kit);

    const { tl, steps, resetters } = kit;
    tl.eventCallback("onUpdate", () => {
        bar.style.transform = `scaleX(${tl.progress()})`;
    });

    figure.querySelector(".replay").addEventListener("click", () => {
        resetters.forEach((reset) => reset());
        caption.textContent = steps[0];
        tl.restart();
    });

    timelines.set(figure, tl);

    if (prefersReducedMotion) {
        // Show the finished state; Replay still lets people watch it on demand.
        tl.progress(1);
        caption.textContent = steps[steps.length - 1];
        bar.style.transform = "scaleX(1)";
    } else {
        caption.textContent = steps[0];
        playWhenVisible.observe(figure);
    }
});

/* ---------- Highlight the current concept in the sticky nav ---------- */
const chipBar = document.querySelector(".chips-inner");
const chips = [...chipBar.querySelectorAll("a")];

const trackSection = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const active = chips.find((chip) => chip.hash === `#${entry.target.id}`);
        chips.forEach((chip) => {
            chip.classList.toggle("is-active", chip === active);
            if (chip === active) chip.setAttribute("aria-current", "true");
            else chip.removeAttribute("aria-current");
        });
        if (active) {
            chipBar.scrollTo({
                left: active.offsetLeft - chipBar.clientWidth / 2 + active.clientWidth / 2,
                behavior: prefersReducedMotion ? "auto" : "smooth",
            });
        }
    });
}, { rootMargin: "-40% 0px -55% 0px" });

document.querySelectorAll(".concept").forEach((section) => trackSection.observe(section));
