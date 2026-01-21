(function () {
  const limitationsTable = document.querySelector('.limitations-video-table');
  if (!limitationsTable) return; // safety: do nothing if the block isn't on the page

  const videoRow = limitationsTable.querySelector('.limitations-video-row');
  if (!videoRow) return;

  const allVideos = Array.from(videoRow.querySelectorAll('video'));

  /* ---------- Pair-by-pair synchronization ---------- */
  // Group videos into pairs: [input1, output1], [input2, output2], [input3, output3]
  for (let i = 0; i < allVideos.length; i += 2) {
    const inputVideo = allVideos[i];
    const outputVideo = allVideos[i + 1];

    if (!inputVideo || !outputVideo) continue;

    const pairVideos = [inputVideo, outputVideo];
    let isSyncingPair = false;

    function syncFrom(master) {
      if (isSyncingPair) return;
      isSyncingPair = true;

      pairVideos.forEach(v => {
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

      isSyncingPair = false;
    }

    pairVideos.forEach(v => {
      ['play', 'pause', 'seeking', 'seeked', 'ratechange', 'timeupdate'].forEach(ev => {
        v.addEventListener(ev, () => syncFrom(v));
      });
    });
  }
})();
