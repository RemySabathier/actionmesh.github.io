/**
 * Script for the image+text-to-4D video grid section
 * Handles set switching between different video sets
 * Note: Synchronization is disabled for this section
 */

(function () {
  const grid = document.getElementById('img-to-4d-grid');
  if (!grid) return; // safety: do nothing if the block isn't on the page

  const setButtons = document.querySelectorAll('.img-to-4d-set-button');
  const sets = grid.querySelectorAll('.img-to-4d-video-set');

  /* ---------- Set switching + autoplay ---------- */
  function showSet(index) {
    sets.forEach(set => {
      const isTarget = set.dataset.set === String(index);
      if (isTarget) {
        set.classList.add('img-to-4d-active');

        // Autoplay videos in the newly shown set
        set.querySelectorAll('video').forEach(v => {
          // Lazy load the video if not yet loaded
          if (v.preload === 'none') {
            v.preload = 'metadata';
            // Set speed before loading
            const targetSpeed = window.VIDEO_SPEED_CONFIG?.img_to_4d || 0.5;
            v.playbackRate = targetSpeed;

            // Wait for metadata to load before playing
            v.addEventListener('loadedmetadata', function onLoaded() {
              v.removeEventListener('loadedmetadata', onLoaded);
              v.playbackRate = targetSpeed; // Set again after metadata loads
              v.muted = true;
              const p = v.play();
              if (p !== undefined) {
                p.catch(() => {});
              }
            }, { once: true });

            v.load();
          } else {
            // Video already loaded, just play it
            v.muted = true;
            const p = v.play();
            if (p !== undefined) {
              p.catch(() => {});
            }
          }
        });

      } else {
        set.classList.remove('img-to-4d-active');
        // Pause videos in hidden sets and reset to first frame
        set.querySelectorAll('video').forEach(v => {
          // Mark as resetting to prevent sync conflicts
          v.dataset.resetting = 'true';
          v.pause();
          v.currentTime = 0;
          // Clear the flag after a short delay
          setTimeout(() => {
            v.dataset.resetting = 'false';
          }, 100);
        });
      }
    });

    setButtons.forEach(btn => {
      if (btn.dataset.set === String(index)) {
        btn.classList.add('img-to-4d-active');
      } else {
        btn.classList.remove('img-to-4d-active');
      }
    });
  }

  setButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      showSet(btn.dataset.set);
    });
  });

  // Show Set 1 by default on load
  showSet(1);
})();
