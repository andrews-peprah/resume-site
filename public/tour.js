/* Lightweight guided tour. Shows one contextual coach-mark per page pointing at
   the next thing to click, and rings that element. Advances as the visitor
   navigates (each page knows its own step). Dismissible; remembered via
   localStorage so it only runs for first-time visitors. No libraries. */
(function () {
  try { if (localStorage.getItem("tour:done")) return; } catch (e) {}
  const page = document.body.dataset.page;

  const STEPS = {
    "pages/home":         { sel: ".cards a", place: "top",    pin: "Tour · 1 / 5",
      text: "👋 First time here? Take the 60-second tour. Start with my career — click <b>Experience</b>." },
    "experiences/index":  { sel: ".xp-list a", place: "bottom", pin: "Tour · 2 / 5",
      text: "Open any role — a <b>globe</b> flies to where I worked and drops a pin." },
    "experiences/show":   { sel: ".pager", place: "top", pin: "Tour · 3 / 5",
      text: "Travel my career with <b>Prev / Next</b> — the globe flies along. When ready, hit <b>Languages</b> in the nav." },
    "languages/index":    { sel: 'nav .links a[href="/writing"]', place: "bottom", pin: "Tour · 4 / 5",
      text: "That's my full stack &amp; tools. Last stop — my <b>Writing</b>." },
    "posts/index":        { sel: ".post-list a", place: "bottom", pin: "Tour · 5 / 5",
      text: "Read how I self-hosted this site's private network." },
    "posts/show":         { final: true,
      text: "🎉 That's the tour — thanks for exploring! This site runs on Rails, over a homemade Tailscale mesh." }
  };

  const step = STEPS[page];
  if (!step) return;

  let pop = null, target = null;

  function cleanup() {
    if (pop) pop.remove();
    if (target) target.classList.remove("tour-ring");
    window.removeEventListener("scroll", reposition, true);
    window.removeEventListener("resize", reposition);
    pop = null; target = null;
  }
  function finish() { try { localStorage.setItem("tour:done", "1"); } catch (e) {} cleanup(); }

  function centerBottom() {
    const pr = pop.getBoundingClientRect();
    pop.style.left = Math.round((window.innerWidth - pr.width) / 2) + "px";
    pop.style.top = Math.round(window.innerHeight - pr.height - 28) + "px";
  }
  function reposition() {
    if (!pop || !target) return;
    const r = target.getBoundingClientRect(), pr = pop.getBoundingClientRect();
    let left = r.left + r.width / 2 - pr.width / 2;
    let top = step.place === "top" ? r.top - pr.height - 14 : r.bottom + 14;
    left = Math.max(12, Math.min(left, window.innerWidth - pr.width - 12));
    top = Math.max(12, Math.min(top, window.innerHeight - pr.height - 12));
    pop.style.left = Math.round(left) + "px";
    pop.style.top = Math.round(top) + "px";
  }

  function build() {
    pop = document.createElement("div");
    pop.className = "tour-pop";
    pop.innerHTML =
      '<div class="pin">' + (step.final ? "Tour · done" : step.pin) + '</div>' +
      '<div class="txt">' + step.text + '</div>' +
      '<div class="row">' +
        (step.final ? '<span></span>' : '<button class="skip" type="button">Skip tour</button>') +
        '<button class="ok" type="button">' + (step.final ? "Finish" : "Got it") + '</button>' +
      '</div>';
    document.body.appendChild(pop);

    pop.querySelector(".ok").addEventListener("click", () => { step.final ? finish() : cleanup(); });
    const skip = pop.querySelector(".skip");
    if (skip) skip.addEventListener("click", finish);

    if (!step.final) target = document.querySelector(step.sel);
    if (target) {
      target.classList.add("tour-ring");
      target.scrollIntoView({ block: "center", behavior: "smooth" });
      reposition();
      setTimeout(reposition, 400);
      window.addEventListener("scroll", reposition, true);
      window.addEventListener("resize", reposition);
    } else {
      centerBottom();
      window.addEventListener("resize", centerBottom);
    }
  }

  setTimeout(build, 650);   // let the entrance animations settle first
})();
