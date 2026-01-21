/**
 * 4D GLB Viewer Component
 *
 * Usage in any HTML file:
 *
 * 1. Include model-viewer script in your HTML head:
 *    <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"></script>
 *
 * 2. Import and use createGlbViewer:
 *    <script type="module">
 *      import { createGlbViewer } from './glb-viewer.js';
 *      createGlbViewer(document.getElementById('container'), {
 *        src: 'your-model.glb',
 *        showControls: true
 *      });
 *    </script>
 */

export function createGlbViewer(container, options = {}) {
  const {
    src,
    exposure = 1,
    shadowIntensity = 0,
    cameraOrbit = '30deg 60deg 2.5m',
    fieldOfView = '30deg',
    showControls = true,
    autoplay = true,
    ar = true,
    neutralLighting = true,
    animationPlaybackRate = 0.27
  } = options;

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;';

  // Create model-viewer element
  const viewer = document.createElement('model-viewer');
  viewer.setAttribute('src', src);
  viewer.setAttribute('camera-controls', '');
  viewer.setAttribute('shadow-intensity', shadowIntensity);
  viewer.setAttribute('exposure', exposure);
  viewer.setAttribute('camera-orbit', cameraOrbit);
  viewer.setAttribute('field-of-view', fieldOfView);
  viewer.setAttribute('touch-action', 'pan-y');

  if (neutralLighting) viewer.setAttribute('neutral-lighting', '');
    if (autoplay) viewer.setAttribute('autoplay', '');
    viewer.setAttribute('animation-playback-rate', animationPlaybackRate);
  if (ar) {
    viewer.setAttribute('ar', '');
    viewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
  }

  viewer.style.cssText = 'flex:1;width:100%;background:#333;border-radius:12px;';
  wrapper.appendChild(viewer);

  // Create controls if enabled
  if (showControls) {
    const controls = document.createElement('div');
    controls.style.cssText = 'display:flex;justify-content:center;gap:10px;padding:15px;';

    const playPauseBtn = document.createElement('button');
    playPauseBtn.textContent = '⏸ Pause';
    playPauseBtn.style.cssText = 'padding:12px 32px;font-size:16px;cursor:pointer;background:#4a9eff;color:white;border:none;border-radius:8px;font-weight:bold;';

    let isPlaying = autoplay;
    playPauseBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        viewer.play();
        playPauseBtn.textContent = '⏸ Pause';
      } else {
        viewer.pause();
        playPauseBtn.textContent = '▶ Play';
      }
    });

    controls.appendChild(playPauseBtn);
    wrapper.appendChild(controls);
  }

  container.appendChild(wrapper);

  return viewer;
}
