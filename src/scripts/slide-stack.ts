const stack = document.querySelector<HTMLElement>(".slide-stack");

if (stack) {
  const pinned = stack.querySelectorAll<HTMLElement>("[data-pin]");
  const cards = stack.querySelectorAll<HTMLElement>("[data-card-fade]");
  const siteHeader = document.querySelector<HTMLElement>(".site-header");
  const fadeDistance = 110;
  const entryOpacity = 0.6;
  let pendingFrame = 0;

  function updateCardFades() {
    const viewportBottom = document.documentElement.clientHeight;
    const tops = Array.from(cards, (card) => card.getBoundingClientRect().top);
    cards.forEach((card, index) => {
      const entered = viewportBottom - tops[index];
      const progress = Math.max(0, Math.min(1, entered / fadeDistance));
      const opacity = entryOpacity + (1 - entryOpacity) * progress;
      card.style.setProperty("--card-opacity", String(opacity));
    });
  }

  function scheduleCardFades() {
    if (pendingFrame) return;
    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = 0;
      updateCardFades();
    });
  }

  const observer = new ResizeObserver((entries) => {
    for (const { target, borderBoxSize } of entries) {
      if (target instanceof HTMLElement) {
        const height = borderBoxSize[0]?.blockSize ?? target.offsetHeight;
        target.style.setProperty("--slide-height", `${height}px`);
        target.dataset.measured = "";
      }
    }
    updateCardFades();
  });

  for (const slide of pinned) {
    observer.observe(slide, { box: "border-box" });
  }

  window.addEventListener("scroll", scheduleCardFades, { passive: true });
  window.addEventListener("resize", scheduleCardFades);
  window.addEventListener("pageshow", scheduleCardFades);

  // Keep covered controls in the tab order and reveal their scene when focused.
  stack.addEventListener("focusin", ({ target }) => {
    if (!(target instanceof HTMLElement)) return;
    const slide = target.closest<HTMLElement>("[data-pin][data-measured]");
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
      updateCardFades();
    });
  });
}
