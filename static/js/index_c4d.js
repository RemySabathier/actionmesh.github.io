(function () {
  const setButtons = document.querySelectorAll('.set-button');
  const sets = document.querySelectorAll('.video-set');
  const rows = document.querySelectorAll('.video-row');

  /* ---------- Per-row synchronization ---------- */
  rows.forEach(row => {
    const rowVideos = Array.from(row.querySelectorAll('video'));
    let isSyncingRow = false;
    let lastSyncTime = 0;

    function syncFrom(master, eventType) {
      if (isSyncingRow) return;

      // Only sync if the row is in an active set
      const parentSet = row.closest('.video-set');
      if (!parentSet || !parentSet.classList.contains('active')) return;

      // Throttle timeupdate events to reduce CPU usage - aggressive for performance
      const now = Date.now();
      if (eventType === 'timeupdate' && now - lastSyncTime < 250) return;
      lastSyncTime = now;

      isSyncingRow = true;

      rowVideos.forEach(v => {
        if (v === master) return;

        // Skip videos that haven't been loaded yet or are being reset
        if (v.readyState === 0 || v.dataset.resetting === 'true') return;

        // Sync time - use a larger threshold for timeupdate to prevent jitter
        const threshold = eventType === 'timeupdate' ? 0.15 : 0.05;
        try {
          if (Math.abs(v.currentTime - master.currentTime) > threshold) {
            v.currentTime = master.currentTime;
          }
        } catch (e) {
          // Ignore bounds errors
        }

        // Sync play/pause
        if (master.paused && !v.paused) {
          v.pause();
        } else if (!master.paused && v.paused) {
          const p = v.play();
          if (p !== undefined) {
            p.catch(() => { });
          }
        }

        // Sync speed
        if (v.playbackRate !== master.playbackRate) {
          v.playbackRate = master.playbackRate;
        }
      });

      isSyncingRow = false;
    }

    rowVideos.forEach(v => {
      ['play', 'pause', 'seeking', 'seeked', 'ratechange'].forEach(ev => {
        v.addEventListener(ev, () => syncFrom(v, ev));
      });
      // Special handling for timeupdate with the event type
      v.addEventListener('timeupdate', () => syncFrom(v, 'timeupdate'));
    });
  });

  /* ---------- Set switching ---------- */
  function showSet(index) {
    sets.forEach(set => {
      const isTarget = set.dataset.set === String(index);
      if (isTarget) {
        set.classList.add('active');

        set.querySelectorAll('video').forEach(v => {
          // Lazy load the video if not yet loaded
          if (v.preload === 'none') {
            v.preload = 'metadata';
            // Set speed before loading
            const targetSpeed = window.VIDEO_SPEED_CONFIG?.consistent4d || 0.5;
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
        set.classList.remove('active');
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
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  setButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      showSet(btn.dataset.set);
    });
  });

  // Ensure Set 1 is visible on load
  showSet(1);
})();
