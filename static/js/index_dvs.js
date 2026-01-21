/**
 * Script for the DAVIS video-to-4D section
 * Handles set switching and pair synchronization (Input ↔ Ours)
 */

(function () {
  const grid = document.getElementById('io-grid');
  if (!grid) return; // safety: do nothing if the block isn't on the page

  const setButtons = document.querySelectorAll('.io-set-button');
  const sets = grid.querySelectorAll('.io-video-set');
  const rows = grid.querySelectorAll('.io-video-row');

  /* ---------- Per-pair video synchronization (Input ↔ Ours) ---------- */
  rows.forEach(row => {
    const rowVideos = Array.from(row.querySelectorAll('video'));

    // Create pairs: [0,1], [2,3] (Input, Ours)
    const pairs = [];
    for (let i = 0; i < rowVideos.length; i += 2) {
      if (i + 1 < rowVideos.length) {
        pairs.push([rowVideos[i], rowVideos[i + 1]]);
      }
    }

    // Sync each pair independently
    pairs.forEach(pair => {
      let isSyncingPair = false;
      let lastSyncTime = 0;

      function syncPair(master, eventType) {
        if (isSyncingPair) return;

        // Only sync if the row is in an active set
        const parentSet = row.closest('.io-video-set');
        if (!parentSet || !parentSet.classList.contains('io-active')) return;

        // Throttle timeupdate events to reduce CPU usage
        const now = Date.now();
        if (eventType === 'timeupdate' && now - lastSyncTime < 250) return;
        lastSyncTime = now;

        isSyncingPair = true;

        const slave = pair.find(v => v !== master);
        if (!slave) {
          isSyncingPair = false;
          return;
        }

        // Skip if slave is being reset or not loaded
        if (slave.readyState === 0 || slave.dataset.resetting === 'true') {
          isSyncingPair = false;
          return;
        }

        // Sync time - use a larger threshold for timeupdate to prevent jitter
        const threshold = eventType === 'timeupdate' ? 0.15 : 0.05;
        try {
          if (Math.abs(slave.currentTime - master.currentTime) > threshold) {
            slave.currentTime = master.currentTime;
          }
        } catch (e) {
          // Ignore out-of-range errors
        }

        // Sync play/pause state
        if (master.paused && !slave.paused) {
          slave.pause();
        } else if (!master.paused && slave.paused) {
          const p = slave.play();
          if (p !== undefined) {
            p.catch(() => {});
          }
        }

        // Sync playback speed
        if (slave.playbackRate !== master.playbackRate) {
          slave.playbackRate = master.playbackRate;
        }

        isSyncingPair = false;
      }

      pair.forEach(v => {
        ['play', 'pause', 'seeking', 'seeked', 'ratechange'].forEach(ev => {
          v.addEventListener(ev, () => syncPair(v, ev));
        });
        // Throttled timeupdate with event type
        v.addEventListener('timeupdate', () => syncPair(v, 'timeupdate'));
      });
    });
  });

  /* ---------- Set switching + autoplay ---------- */
  function showSet(index) {
    sets.forEach(set => {
      const isTarget = set.dataset.set === String(index);
      if (isTarget) {
        set.classList.add('io-active');

        // Autoplay videos in the newly shown set
        set.querySelectorAll('video').forEach(v => {
          // Lazy load the video if not yet loaded
          if (v.preload === 'none') {
            v.preload = 'metadata';
            // Set speed before loading
            const targetSpeed = window.VIDEO_SPEED_CONFIG?.davis || 0.5;
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
        set.classList.remove('io-active');
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
        btn.classList.add('io-active');
      } else {
        btn.classList.remove('io-active');
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
