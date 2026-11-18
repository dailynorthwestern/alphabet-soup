const stack = document.querySelector<HTMLElement>(".slide-stack");

if (stack) {
  const pinned = stack.querySelectorAll<HTMLElement>("[data-pin]");
  const scenes = stack.querySelectorAll<HTMLElement>("[data-scene]");
  const siteHeader = document.querySelector<HTMLElement>(".site-header");
  const fadeDistance = 110;
  let pendingFrame = 0;

  stack.style.setProperty("--scene-fade-distance", `${fadeDistance}px`);

  function updateScenes() {
    // The parent starts at the scene's natural position and is unaffected by its translation.
    const distances = Array.from(
      scenes,
      (scene) => scene.parentElement?.getBoundingClientRect().top ?? 0
    );
    scenes.forEach((scene, index) => {
      const distance = distances[index];
      const approaching = distance > 0;
      const fading = approaching && distance < fadeDistance;
      scene.toggleAttribute("data-approaching", approaching);
      scene.style.setProperty(
        "--scene-opacity",
        fading ? String(1 - distance / fadeDistance) : "0"
      );
      scene.style.setProperty(
        "--scene-offset",
        fading ? `${-distance}px` : "0px"
      );
    });
  }

  function scheduleScenes() {
    if (pendingFrame) return;
    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = 0;
      updateScenes();
    });
  }

  const observer = new ResizeObserver((entries) => {
    for (const { target, borderBoxSize } of entries) {
      if (target instanceof HTMLElement) {
        const height = borderBoxSize[0]?.blockSize ?? target.offsetHeight;
        target.style.setProperty("--slide-height", `${height}px`);
      }
    }
    stack.dataset.scenesReady = "";
    updateScenes();
  });

  for (const slide of pinned) {
    observer.observe(slide, { box: "border-box" });
  }

  window.addEventListener("scroll", scheduleScenes, { passive: true });
  window.addEventListener("resize", scheduleScenes);
  window.addEventListener("pageshow", scheduleScenes);

  // Keep covered controls in the tab order and reveal their scene when focused.
  stack.addEventListener("focusin", ({ target }) => {
    if (!(target instanceof HTMLElement)) return;
    const slide = target.closest<HTMLElement>("[data-pin]");
    const track = slide?.parentElement;
    if (!slide || !track) return;

    requestAnimationFrame(() => {
      if (document.activeElement !== target) return;

      const bounds = target.getBoundingClientRect();
      const headerBottom = siteHeader?.getBoundingClientRect().bottom ?? 0;
      const viewportHeight = document.documentElement.clientHeight;
      const x = (bounds.left + bounds.right) / 2;
      const y = (bounds.top + bounds.bottom) / 2;
      if (
        y >= headerBottom &&
        y < viewportHeight &&
        document.elementFromPoint(x, y)?.closest("[data-slide]") === slide
      )
        return;

      const start = track.getBoundingClientRect().top + window.scrollY;
      const targetCenter = y - slide.getBoundingClientRect().top;
      const maxOffset = Math.max(0, slide.offsetHeight - viewportHeight);
      const offset = Math.max(
        0,
        Math.min(maxOffset, targetCenter - (headerBottom + viewportHeight) / 2)
      );
      window.scrollTo({ top: Math.ceil(start + offset), behavior: "instant" });
      updateScenes();
    });
  });
}
