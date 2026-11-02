// Tungi / kunduzgi rejim
// Bu qism sahifa chizilishidan oldin ishlaydi, shuning uchun ekran "miltillamaydi"
const root = document.documentElement;

function getSavedTheme() {
  try { return localStorage.getItem("theme"); } catch (e) { return null; }
}

function saveTheme(theme) {
  try { localStorage.setItem("theme", theme); } catch (e) {}
}

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  const btn = document.getElementById("themeToggle");
  if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
}

// Standart holatda yorug' rejim; foydalanuvchi tungi rejimni tanlagan bo'lsa, o'sha eslab qolinadi
applyTheme(getSavedTheme() || "light");

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const btn = document.getElementById("themeToggle");
  applyTheme(root.getAttribute("data-theme"));
  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    saveTheme(next);
    // Ikonkani aylantirish (ketma-ket bosilganda ham qayta ishlaydi)
    btn.classList.remove("spin");
    void btn.offsetWidth;
    btn.classList.add("spin");
  });

  // Skroll qilganda elementlarni silliq ko'rsatish
  const revealItems = document.querySelectorAll(
    ".hero-grid > div, .section-head, .stat, .about-photo, .about-item, .service, .step, .contact-box"
  );
  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    revealItems.forEach(el => {
      // Yonma-yon kartalar birin-ketin chiqadi
      const index = [...el.parentElement.children].indexOf(el);
      el.style.setProperty("--d", index * 0.12 + "s");
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  // Raqamlar 0 dan sanab chiqadi
  const counters = document.querySelectorAll("[data-count]");
  const runCounter = el => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / 1400, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => counterObserver.observe(el));
  } else {
    counters.forEach(runCounter);
  }

  // "Men — ..." yozuvi yozilib-o'chib turadi
  const typed = document.getElementById("typed");
  const words = ["iqtisod magistranti", "kitobxon", "stol tennisi sevuvchi", "kelajak dasturchisi"];
  if (reduceMotion) {
    typed.textContent = words[0];
  } else {
    let w = 0, c = 0, deleting = false;
    const type = () => {
      const word = words[w];
      typed.textContent = word.slice(0, c);
      let delay = deleting ? 40 : 85;
      if (!deleting && c === word.length) { deleting = true; delay = 1400; }
      else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 350; }
      else c += deleting ? -1 : 1;
      setTimeout(type, delay);
    };
    type();
  }

  // Footerdagi yilni avtomatik yangilash
  document.getElementById("year").textContent = new Date().getFullYear();

  // Menyudagi faol bo'limni belgilash va skroll chizig'i
  const links = document.querySelectorAll(".nav-links a");
  const sections = [...links].map(link => document.querySelector(link.getAttribute("href")));
  const progress = document.getElementById("progress");

  window.addEventListener("scroll", () => {
    const y = window.scrollY + 120;
    sections.forEach((section, i) => {
      const active = section.offsetTop <= y && section.offsetTop + section.offsetHeight > y;
      links[i].classList.toggle("active", active);
    });
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? scrollY / max : 0) + ")";
  }, { passive: true });
});
