/**
 * Video Playback Speed Configuration by Section
 *
 * Configure playback speed for videos in different sections of the page.
 * Speed values: 1.0 = normal, 0.5 = half speed, 1.5 = 1.5x speed, 2.0 = double speed, etc.
 *
 * To change the speed for a specific section, simply update the corresponding value below.
 */

const VIDEO_SPEED_CONFIG = {
  // Video carousel section
  carousel: 0.7,
  // Application Platforms section (navigation)
  platforms: 0.5,
  // Consistent4D Benchmark section (video-to-4D)
  consistent4d: 0.5,
  // DAVIS Video-to-4D section
  davis: 0.5,
  // Image+text-to-4D section
  img_to_4d: 0.5,
  // Text-to-4D section
  txt_to_4d: 0.5,
  // 3D+text-to-4D section
  mesh_to_4d: 0.5,
  // Long sequence section
  longseq: 0.8,
  // Motion transfer/retargeting section
  retargetting: 0.5,
  // Limitations section
  limitations: 0.5,
  // Default speed for any other videos
  default: 1.0
};

// Apply the playback speeds to videos based on their section
(function () {
  function setVideoSpeed(video, speed) {
    video.playbackRate = speed;
  }

function applyVideoSpeeds() {
    // Video carousel section
    document.querySelectorAll('.video-carousel-container video').forEach(v => {
      setVideoSpeed(v, VIDEO_SPEED_CONFIG.carousel);
    });

    // Application Platforms section
    document.querySelectorAll('.application-platforms video').forEach(v => {
      setVideoSpeed(v, VIDEO_SPEED_CONFIG.platforms);
    });

    // Consistent4D section - using class selector since no ID is set
    document.querySelectorAll('.video-table video').forEach(v => {
      setVideoSpeed(v, VIDEO_SPEED_CONFIG.consistent4d);
    });

    // DAVIS section
    document.querySelectorAll('#io-grid video').forEach(v => {
      setVideoSpeed(v, VIDEO_SPEED_CONFIG.davis);
    });

    // Image-to-4D section
    document.querySelectorAll('#img-to-4d-grid video').forEach(v => {
      setVideoSpeed(v, VIDEO_SPEED_CONFIG.img_to_4d);
    });

    // Text-to-4D section
    document.querySelectorAll('#txt-to-4d-grid video').forEach(v => {
      setVideoSpeed(v, VIDEO_SPEED_CONFIG.txt_to_4d);
    });

    // Mesh-to-4D section (3D+text-to-4D)
    document.querySelectorAll('#mesh-to-4d-grid video').forEach(v => {
      setVideoSpeed(v, VIDEO_SPEED_CONFIG.mesh_to_4d);
    });

    // Long sequence section
    document.querySelectorAll('#longseq-grid video').forEach(v => {
      setVideoSpeed(v, VIDEO_SPEED_CONFIG.longseq);
    });

    // Retargeting section
    document.querySelectorAll('#retargetting-grid video').forEach(v => {
      setVideoSpeed(v, VIDEO_SPEED_CONFIG.retargetting);
    });

    // Limitations section
    document.querySelectorAll('.limitations-video-table video').forEach(v => {
      setVideoSpeed(v, VIDEO_SPEED_CONFIG.limitations);
    });

    // Apply default speed to any other videos not in the above sections
    const allVideos = document.querySelectorAll('video');
    const sectionVideos = new Set([
      ...document.querySelectorAll('.video-carousel-container video'),
      ...document.querySelectorAll('.application-platforms video'),
      ...document.querySelectorAll('.video-table video'),
      ...document.querySelectorAll('#io-grid video'),
      ...document.querySelectorAll('#img-to-4d-grid video'),
      ...document.querySelectorAll('#txt-to-4d-grid video'),
      ...document.querySelectorAll('#mesh-to-4d-grid video'),
      ...document.querySelectorAll('#longseq-grid video'),
      ...document.querySelectorAll('#retargetting-grid video'),
      ...document.querySelectorAll('.limitations-video-table video')
    ]);

    allVideos.forEach(v => {
      if (!sectionVideos.has(v)) {
        setVideoSpeed(v, VIDEO_SPEED_CONFIG.default);
      }
    });
  }

  // Apply speeds when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyVideoSpeeds();
      setupVideoControlsHover();
      setupObserver();
    });
  } else {
    applyVideoSpeeds();
    setupVideoControlsHover();
    setupObserver();
  }

  // Debounce helper to reduce excessive function calls
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Store observer reference for cleanup
  let mutationObserver = null;

  // Setup MutationObserver for dynamically loaded videos
  function setupObserver() {
    // Disconnect previous observer if it exists
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }

    // Only set up observer if we have the necessary containers
    const gridContainers = document.querySelectorAll(
      '.video-carousel-container, .application-platforms, .video-table, #io-grid, #img-to-4d-grid, #txt-to-4d-grid, ' +
      '#mesh-to-4d-grid, #longseq-grid, #retargetting-grid, .limitations-video-table'
    );

    if (gridContainers.length === 0) {
      // No grid containers found yet, retry after a short delay
      setTimeout(setupObserver, 100);
      return;
    }

    // Debounced callback to avoid excessive re-processing
    const debouncedCallback = debounce(() => {
      applyVideoSpeeds();
      setupVideoControlsHover();
    }, 200); // Wait 200ms after last mutation before processing

    // Create new observer
    mutationObserver = new MutationObserver(debouncedCallback);

    // Observe only specific grid containers, not the entire document
    gridContainers.forEach(container => {
      mutationObserver.observe(container, {
        childList: true,  // Watch for added/removed children
        subtree: true     // Watch descendants
      });
    });
  }

  // Cleanup function (can be called if needed to stop observations)
  window.cleanupVideoObserver = function () {
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }
  };

  // Setup hover-based controls visibility for all videos
  function setupVideoControlsHover() {
    document.querySelectorAll('video').forEach(video => {
      // Skip if already setup
      if (video.dataset.controlsSetup) return;
      video.dataset.controlsSetup = 'true';

      // Remove controls by default
      video.removeAttribute('controls');

      // Use a flag to prevent rapid toggling
      let isHovering = false;

      // Show controls on mouse enter
      video.addEventListener('mouseenter', () => {
        if (isHovering) return;
        isHovering = true;
        video.setAttribute('controls', 'controls');
      });

      // Hide controls on mouse leave
      video.addEventListener('mouseleave', () => {
        if (!isHovering) return;
        isHovering = false;
        video.removeAttribute('controls');
      });
    });
  }
})();
