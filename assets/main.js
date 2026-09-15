document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const themeToggle = document.querySelector(".theme-toggle");
  const themeColor = document.querySelector("#theme-color");

  const applyTheme = (theme, remember = false) => {
    root.dataset.theme = theme;
    const dark = theme === "dark";

    if (themeToggle) {
      const label = `Switch to ${dark ? "light" : "dark"} theme`;
      themeToggle.setAttribute("aria-label", label);
      themeToggle.setAttribute("title", label);
      themeToggle.setAttribute("aria-pressed", String(dark));
    }

    if (themeColor) themeColor.setAttribute("content", dark ? "#1c1c1a" : "#faf9f6");

    if (remember) {
      try { localStorage.setItem("theme", theme); } catch (_error) {}
    }
  };

  applyTheme(root.dataset.theme || "light");

  themeToggle?.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
  });

  document.querySelectorAll(".prose pre").forEach((pre) => {
    let container = pre.parentElement;

    if (!container.classList.contains("highlight")) {
      container = document.createElement("div");
      pre.before(container);
      container.append(pre);
    }

    container.classList.add("code-block");

    const button = document.createElement("button");
    button.className = "copy-code";
    button.type = "button";
    button.textContent = "Copy";
    button.setAttribute("aria-label", "Copy code to clipboard");

    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(pre.innerText);
        button.textContent = "Copied";
        window.setTimeout(() => { button.textContent = "Copy"; }, 1600);
      } catch (_error) {
        button.textContent = "Select and copy";
      }
    });

    container.append(button);
  });

  const resumeLinks = [...document.querySelectorAll(".resume-toc a")];
  const resumeSections = resumeLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (resumeSections.length && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        resumeLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: "-25% 0px -65%", threshold: 0 });

    resumeSections.forEach((section) => sectionObserver.observe(section));
  }
});
