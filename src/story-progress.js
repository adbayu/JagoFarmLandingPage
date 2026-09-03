export function getStoryState(
  scrollY,
  sectionTop,
  sectionHeight,
  viewportHeight,
  stageCount,
) {
  const distance = Math.max(1, sectionHeight - viewportHeight);
  const progress = Math.min(1, Math.max(0, (scrollY - sectionTop) / distance));
  const stage = Math.min(stageCount - 1, Math.floor(progress * stageCount));

  return { progress, stage };
}
