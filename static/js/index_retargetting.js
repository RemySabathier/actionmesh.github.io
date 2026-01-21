(function () {
  const grid = document.getElementById('retargetting-grid');
  if (!grid) return; // safety: do nothing if the block isn't on the page

  const rows = grid.querySelectorAll('.retargetting-video-row');

  /* ---------- Per-row video synchronization ---------- */
  rows.forEach(row => {
    const rowVideos = Array.from(row.querySelectorAll('video'));
    let isSyncingRow = false;

    function syncFrom(master) {
      if (isSyncingRow) return;
      isSyncingRow = true;

      rowVideos.forEach(v => {
        if (v === master) return;

        // Sync time
        try {
          if (Math.abs(v.currentTime - master.currentTime) > 0.05) {
            v.currentTime = master.currentTime;
          }
        } catch (e) {
          // Ignore out-of-range errors
        }

        // Sync play/pause state
        if (master.paused && !v.paused) {
          v.pause();
        } else if (!master.paused && v.paused) {
          const p = v.play();
          if (p !== undefined) {
            p.catch(() => {});
          }
        }

        // Sync playback speed
        if (v.playbackRate !== master.playbackRate) {
          v.playbackRate = master.playbackRate;
        }
      });

      isSyncingRow = false;
    }

    rowVideos.forEach(v => {
      ['play', 'pause', 'seeking', 'seeked', 'ratechange', 'timeupdate'].forEach(ev => {
        v.addEventListener(ev, () => syncFrom(v));
      });
    });
  });

  /* ---------- Autoplay all videos on load ---------- */
  grid.querySelectorAll('video').forEach(v => {
    v.muted = true; // required for autoplay in most browsers
    const p = v.play();
    if (p !== undefined) {
      p.catch(() => {
        // ignore autoplay errors
      });
    }
  });
})();
