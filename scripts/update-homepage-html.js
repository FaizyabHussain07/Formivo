function _focusFirstLink() {
  const focusable = Array.from(
    document.querySelectorAll<HTMLElement>(
      'button, a[href], [tabindex]:not([tabindex="-1"])'
    )
  );
  let first = focusable.find((el) => el.offsetParent !== null);
  if (!first) first = document.body;
  if (first instanceof HTMLElement) first.focus({ preventScroll: true });
}
function scrollToVideo(video: HTMLVideoElement) {
  video.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => {
    video.play().catch(() => {});
  }, 420);
}
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll<HTMLElement>('.cta-video');
  for (const card of cards) {
    const explorer = document.createElement('a');
    explorer.href = '#get-started-free';
    explorer.className = 'group inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-subtle px-4 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent-subtle/80 hover:text-accent-hover';
    explorer.innerHTML = `<svg class="size-3.5" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"/></svg> Explore the homepage`;
    explorer.title = "Go to the formivo homepage";
    explorer.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.getElementById('get-started-free');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    const textSlot = card.querySelector("h2, p, a");
    if (textSlot == null) continue;
    textSlot.before(explorer);
  }
  const videoBlockers = document.querySelectorAll<HTMLElement>('.video-blocker');
  for (const blocker of videoBlockers) {
    blocker.addEventListener('click', () => {
      const video = blocker.querySelector<HTMLVideoElement>('video');
      if (!video) return;
      scrollToVideo(video);
    });
    const video = blocker.querySelector<HTMLVideoElement>('video');
    if (!video) continue;
    video.addEventListener('click', () => {
      scrollToVideo(video);
    });
  }
  let raf: number | null = null;
  const observer = new MutationObserver(() => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      const added = document.querySelectorAll<HTMLElement>('.video-blocker:not([tabindex]):not([role])');
      added.forEach((node) => node.setAttribute('tabindex', '-1'));
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
});
