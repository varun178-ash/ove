/* ==========================================================================
   OVE CHESS PRACTICE PLATFORM - HOMEPAGE INTERACTIONS (app.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Pure Vanilla JS Modal Toggle for "ABOUT"
  const aboutBtn = document.getElementById('nav-about');
  const aboutModal = document.getElementById('about-modal');
  const closeBtn = document.getElementById('modal-close');

  if (aboutBtn && aboutModal && closeBtn) {
    aboutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      aboutModal.classList.add('open');
    });

    closeBtn.addEventListener('click', () => {
      aboutModal.classList.remove('open');
    });

    aboutModal.addEventListener('click', (e) => {
      if (e.target === aboutModal) {
        aboutModal.classList.remove('open');
      }
    });
  }

  // Smooth Ambient Chessboard Highlight Movement for Hero Background
  (function initAmbientBoard() {
    const highlight = document.getElementById('board-highlight');
    const trail = document.getElementById('board-trail');
    if (!highlight) return;

    let curCol = 4;
    let curRow = 4;

    function applyPosition(el, col, row) {
      el.style.transform = `translate(${col * 100}%, ${row * 100}%)`;
    }

    applyPosition(highlight, curCol, curRow);
    if (trail) {
      applyPosition(trail, curCol, curRow);
    }

    const moveTypes = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1],
      [-1, -1], [-1, 1], [1, -1], [1, 1], [0, 1], [0, -1], [1, 0], [-1, 0],
      [-2, -2], [-2, 2], [2, -2], [2, 2], [0, 2], [0, -2], [2, 0], [-2, 0],
      [0, 3], [0, -3], [3, 0], [-3, 0], [3, 3], [-3, -3]
    ];

    function pickNextSquare() {
      const validDeltas = moveTypes.filter(([dc, dr]) => {
        const nextC = curCol + dc;
        const nextR = curRow + dr;
        return nextC >= 0 && nextC <= 7 && nextR >= 0 && nextR <= 7;
      });

      let nextCol, nextRow;
      if (validDeltas.length > 0 && Math.random() < 0.85) {
        const [dc, dr] = validDeltas[Math.floor(Math.random() * validDeltas.length)];
        nextCol = curCol + dc;
        nextRow = curRow + dr;
      } else {
        do {
          nextCol = Math.floor(Math.random() * 8);
          nextRow = Math.floor(Math.random() * 8);
        } while (nextCol === curCol && nextRow === curRow);
      }

      if (trail) {
        applyPosition(trail, curCol, curRow);
        trail.style.opacity = '0.7';
        setTimeout(() => {
          trail.style.opacity = '0';
        }, 1200);
      }

      curCol = nextCol;
      curRow = nextRow;
      applyPosition(highlight, curCol, curRow);

      const nextDelay = 2600 + Math.random() * 800;
      setTimeout(pickNextSquare, nextDelay);
    }

    setTimeout(pickNextSquare, 2200);
  })();
});
