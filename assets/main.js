document.addEventListener("DOMContentLoaded", () => {
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
});
