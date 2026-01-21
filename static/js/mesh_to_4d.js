/**
 * Script for the 3D+text-to-4D video grid section
 * Handles set switching between different video sets
 * Note: Synchronization is disabled for this section
 */

(function () {
    // Select all set buttons
    const buttons = document.querySelectorAll('.mesh-to-4d-set-button');
    // Select all video sets
    const sets = document.querySelectorAll('.mesh-to-4d-video-set');

    function showSet(targetSet) {
        // Hide all sets and pause their videos
        sets.forEach((s) => {
            if (s.getAttribute('data-set') === targetSet) {
                s.classList.add('mesh-to-4d-active');

                // Autoplay videos in the newly shown set
                s.querySelectorAll('video').forEach(v => {
                    // Lazy load the video if not yet loaded
                    if (v.preload === 'none') {
                        v.preload = 'metadata';
                        // Set speed before loading
                        const targetSpeed = window.VIDEO_SPEED_CONFIG?.mesh_to_4d || 0.5;
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
                s.classList.remove('mesh-to-4d-active');
                // Pause videos in hidden sets and reset to first frame
                s.querySelectorAll('video').forEach(v => {
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

        // Update button states
        buttons.forEach((b) => {
            if (b.getAttribute('data-set') === targetSet) {
                b.classList.add('mesh-to-4d-active');
            } else {
                b.classList.remove('mesh-to-4d-active');
            }
        });
    }

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            // Get the set number from data-set attribute
            const targetSet = btn.getAttribute('data-set');
            showSet(targetSet);
        });
    });

    // Initialize Set 1 on page load
    showSet('1');
})();
