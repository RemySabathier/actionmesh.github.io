/**
 * 4D Viewer Play/Pause Controls
 * Controls timeScale and play/pause buttons for model-viewer elements
 */

const TARGET_FPS = 12;
const ORIGINAL_FPS = 30;
const TIME_SCALE = TARGET_FPS / ORIGINAL_FPS;

document.querySelectorAll('model-viewer').forEach(function(viewer) {
  // Set timeScale when model is ready
  viewer.addEventListener('load', function() {
    viewer.timeScale = TIME_SCALE;
  });

  // Also try on scene-graph-ready for animations
  viewer.addEventListener('scene-graph-ready', function() {
    viewer.timeScale = TIME_SCALE;
  });
});

document.querySelectorAll('.playPauseBtn').forEach(function(btn) {
  const viewerId = btn.getAttribute('data-viewer');
  const viewer = document.getElementById(viewerId);
  let isPlaying = true;

  if (viewer) {
    btn.addEventListener('click', function() {
      isPlaying = !isPlaying;
      if (isPlaying) {
        viewer.play();
        btn.textContent = '⏸ Pause';
      } else {
        viewer.pause();
        btn.textContent = '▶ Play';
      }
    });
  }
});
