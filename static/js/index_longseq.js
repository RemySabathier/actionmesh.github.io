/**
 * Script for the long sequence video section
 * Handles pair synchronization (Input/Output pairs)
 * Note: No set switching - all videos are always visible
 */

(function () {
    const grid = document.getElementById('longseq-grid');
    if (!grid) return; // safety: do nothing if the block isn't on the page

    const rows = grid.querySelectorAll('.longseq-video-row');

    /* ---------- Per-pair video synchronization (Input/Output pairs) ---------- */
    rows.forEach(row => {
        const rowVideos = Array.from(row.querySelectorAll('video'));

        // Create pairs: [0,1], [2,3] (Input, Output)
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

                // Aggressive throttling for long videos - 250ms minimum interval
                const now = Date.now();
                if (eventType === 'timeupdate' && now - lastSyncTime < 250) return;
                lastSyncTime = now;

                isSyncingPair = true;

                const slave = pair.find(v => v !== master);
                if (!slave) {
                    isSyncingPair = false;
                    return;
                }

                // Skip if slave is not loaded yet
                if (slave.readyState === 0) {
                    isSyncingPair = false;
                    return;
                }

                // Sync time - use larger threshold for long videos to reduce jitter
                const threshold = eventType === 'timeupdate' ? 0.3 : 0.05;
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
                        p.catch(() => { });
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
})();
