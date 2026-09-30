/* ==========================================================================
   OVE CHESS - PLAYABLE BOARD
   ========================================================================== */

const PIECE_SVGS = {
  p: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="20" r="9"></circle>
      <path d="M24 30h16l4 9H20l4-9z"></path>
      <path d="M18 42h28v7H18z"></path>
    </svg>
  `,

  r: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M19 15h7v7h6v-7h7v7h6v-7h4v13H45v17h5v6H14v-6h5V28h-4V15h4z"></path>
      <path d="M23 34h18v11H23z"></path>
    </svg>
  `,

  n: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M20 49h29v-6h-6c2-7 1-15-4-21-3-4-8-7-14-7h-7v8h7c4 0 6 2 7 5-7 1-12 5-14 11-1 3-1 6 2 10z"></path>
      <circle cx="35" cy="22" r="2.5"></circle>
    </svg>
  `,

  b: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 11c-6 0-10 5-10 11 0 5 3 9 7 12l-8 12h22l-8-12c4-3 7-7 7-12 0-6-4-11-10-11z"></path>
      <path d="M19 46h26v7H19z"></path>
      <path d="M27 18l10 12"></path>
    </svg>
  `,

  q: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="18" cy="15" r="4"></circle>
      <circle cx="32" cy="11" r="4"></circle>
      <circle cx="46" cy="15" r="4"></circle>
      <path d="M16 20l6 19h20l6-19-10 7-6-11-6 11-10-7z"></path>
      <path d="M21 43h22v6H21z"></path>
    </svg>
  `,

  k: `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M29 9h6v7h7v6h-7v6h9l5 17H15l5-17h9v-6h-7v-6h7V9z"></path>
      <path d="M14 46h36v7H14z"></path>
    </svg>
  `
};


/* ==========================================================================
   DEMONSTRATION POSITION
   ========================================================================== */

const DEFAULT_SETUP = {
  // BLACK BACK RANK
  a8: { color: "black", type: "r" },
  b8: { color: "black", type: "n" },
  c8: { color: "black", type: "b" },
  d8: { color: "black", type: "q" },
  e8: { color: "black", type: "k" },
  f8: { color: "black", type: "b" },
  g8: { color: "black", type: "n" },
  h8: { color: "black", type: "r" },

  // BLACK PAWNS
  a7: { color: "black", type: "p" },
  b7: { color: "black", type: "p" },
  c7: { color: "black", type: "p" },
  d7: { color: "black", type: "p" },
  e7: { color: "black", type: "p" },
  f7: { color: "black", type: "p" },
  g7: { color: "black", type: "p" },
  h7: { color: "black", type: "p" },

  // WHITE PAWNS
  a2: { color: "white", type: "p" },
  b2: { color: "white", type: "p" },
  c2: { color: "white", type: "p" },
  d2: { color: "white", type: "p" },
  e2: { color: "white", type: "p" },
  f2: { color: "white", type: "p" },
  g2: { color: "white", type: "p" },
  h2: { color: "white", type: "p" },

  // WHITE BACK RANK
  a1: { color: "white", type: "r" },
  b1: { color: "white", type: "n" },
  c1: { color: "white", type: "b" },
  d1: { color: "white", type: "q" },
  e1: { color: "white", type: "k" },
  f1: { color: "white", type: "b" },
  g1: { color: "white", type: "n" },
  h1: { color: "white", type: "r" }
};

/* ==========================================================================
   BOARD CONFIGURATION
   ========================================================================== */

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

let boardState = clonePosition(DEFAULT_SETUP);
let selectedSquare = null;
let moveHistory = [];
let halfmoveClock = 0;
let positionHistory = [];

let castlingRights = {
  whiteKing: true,
  whiteQueen: true,
  blackKing: true,
  blackQueen: true
};

let playerTurn = true;
let engineThinking = false;

let currentDifficulty =
  new URLSearchParams(window.location.search).get("difficulty") ||
  "intermediate";


/* ==========================================================================
   DOM REFERENCES
   ========================================================================== */

let boardElement;
let statusPrimary;
let statusSecondary;
let difficultyButton;
let historyList;


/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  boardElement = document.getElementById("chessboard");
  statusPrimary = document.getElementById("status-primary");
  statusSecondary = document.getElementById("status-secondary");
  difficultyButton = document.getElementById("difficulty-btn");
  historyList = document.getElementById("move-history-list");

  if (!boardElement) {
    console.error("OVE: #chessboard was not found.");
    return;
  }

  setupDifficultyButtons();
  setupActionButtons();

  updateDifficultyUI();

  positionHistory = [getPositionKey()];
  
  updateStatus("Your turn", "Make your move.");
  renderBoard();
  updateMoveHistory();
});


/* ==========================================================================
   HELPERS
   ========================================================================== */

function clonePosition(position) {
  return JSON.parse(JSON.stringify(position));
}

function isPiece(piece) {
  return piece && typeof piece === "object";
}
function getPositionKey() {
  const pieces = files.map(file =>
    Array.from({ length: 8 }, (_, i) => {
      const square = `${file}${i + 1}`;
      const piece = boardState[square];

      if (!piece) return "";

      return `${square}${piece.color[0]}${piece.type}`;
    }).join("|")
  ).join("/");

  return `${pieces}|${playerTurn ? "white" : "black"}|${JSON.stringify(castlingRights)}`;
}

/* ==========================================================================
   BOARD RENDERING
   ========================================================================== */

function renderBoard() {
  if (!boardElement) return;

  boardElement.innerHTML = "";

  for (let rankIndex = 0; rankIndex < ranks.length; rankIndex++) {
    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {

      const file = files[fileIndex];
      const rank = ranks[rankIndex];
      const squareName = `${file}${rank}`;

      const square = document.createElement("div");

      const isLight = (rankIndex + fileIndex) % 2 === 0;

      square.className = `square ${isLight ? "light" : "dark"}`;
      square.dataset.square = squareName;
      square.setAttribute("role", "gridcell");
      square.setAttribute("aria-label", squareName);

      /* Coordinates */
      if (fileIndex === 0) {
        const rankLabel = document.createElement("span");
        rankLabel.className = "coord-rank";
        rankLabel.textContent = rank;
        square.appendChild(rankLabel);
      }

      if (rankIndex === ranks.length - 1) {
        const fileLabel = document.createElement("span");
        fileLabel.className = "coord-file";
        fileLabel.textContent = file;
        square.appendChild(fileLabel);
      }

      /* Piece */
      const pieceData = boardState[squareName];

      if (isPiece(pieceData)) {
        const piece = document.createElement("div");

        piece.className = `piece ${pieceData.color}`;

        const svg = PIECE_SVGS[pieceData.type];

        if (svg) {
          piece.innerHTML = svg;
          square.appendChild(piece);
        }
      }

      /* Selected square */
      if (selectedSquare === squareName) {
        square.classList.add("selected");
      }


/* Checkmate king */
if (
  pieceData &&
  pieceData.type === "k" &&
  isCheckmate(pieceData.color)
) {
  square.style.background = "#d32f2f";

  if (pieceData.color === "black") {
    showCheckmatePopup("white");
  } else {
    showCheckmatePopup("black");
  }
}


      square.addEventListener("click", () => {
        handleSquareClick(squareName);
      });

      boardElement.appendChild(square);
    }
  }
}


/* ==========================================================================
   SQUARE CLICK / MOVE HANDLING
   ========================================================================== */

function handleSquareClick(squareName) {

  if (engineThinking || !playerTurn) {
    return;
  }

  const clickedPiece = boardState[squareName];

  /* Nothing selected yet */
  if (!selectedSquare) {

    if (!clickedPiece || clickedPiece.color !== "white") {
      return;
    }

    selectedSquare = squareName;
    renderBoard();

    return;
  }

  /* Clicking the same square deselects it */
  if (selectedSquare === squareName) {
    selectedSquare = null;
    renderBoard();
    return;
  }

  /* Selecting another white piece */
  if (clickedPiece && clickedPiece.color === "white") {
    selectedSquare = squareName;
    renderBoard();
    return;
  }

  const from = selectedSquare;
  const to = squareName;

  applyMove(from, to);
}


/* ==========================================================================
   APPLY MOVE
   ========================================================================== */


function isLegalMove(from, to) {
  const piece = boardState[from];

  if (!piece) return false;

  const target = boardState[to];

  // Cannot capture your own piece
  if (target && target.color === piece.color) {
    return false;
  }

  const fromFile = files.indexOf(from[0]);
  const fromRank = Number(from[1]);

  const toFile = files.indexOf(to[0]);
  const toRank = Number(to[1]);

  const fileDiff = toFile - fromFile;
  const rankDiff = toRank - fromRank;

  // PAWN
  if (piece.type === "p") {
    const direction = piece.color === "white" ? 1 : -1;
    const startingRank = piece.color === "white" ? 2 : 7;

    // One square forward
    if (
      fileDiff === 0 &&
      rankDiff === direction &&
      !target
    ) {
      return true;
    }

    // Two squares from starting position
    if (
      fileDiff === 0 &&
      rankDiff === direction * 2 &&
      fromRank === startingRank &&
      !target
    ) {
      const middleSquare =
        `${files[fromFile]}${fromRank + direction}`;

      return !boardState[middleSquare];
    }

    // Diagonal capture
    if (
      Math.abs(fileDiff) === 1 &&
      rankDiff === direction &&
      target &&
      target.color !== piece.color
    ) {
      return true;
    }

    return false;
  }

  // KNIGHT
  if (piece.type === "n") {
    return (
      (Math.abs(fileDiff) === 2 && Math.abs(rankDiff) === 1) ||
      (Math.abs(fileDiff) === 1 && Math.abs(rankDiff) === 2)
    );
  }

  // KING
  if (piece.type === "k") {
    return (
      Math.abs(fileDiff) <= 1 &&
      Math.abs(rankDiff) <= 1
    );
  }

  // ROOK
  if (piece.type === "r") {
    if (fileDiff !== 0 && rankDiff !== 0) {
      return false;
    }

    return isPathClear(
      fromFile,
      fromRank,
      toFile,
      toRank
    );
  }

  // BISHOP
  if (piece.type === "b") {
    if (
      Math.abs(fileDiff) !== Math.abs(rankDiff)
    ) {
      return false;
    }

    return isPathClear(
      fromFile,
      fromRank,
      toFile,
      toRank
    );
  }

  // QUEEN
  if (piece.type === "q") {
    const straight =
      fileDiff === 0 || rankDiff === 0;

    const diagonal =
      Math.abs(fileDiff) === Math.abs(rankDiff);

    if (!straight && !diagonal) {
      return false;
    }

    return isPathClear(
      fromFile,
      fromRank,
      toFile,
      toRank
    );
  }

  return false;
}


function isPathClear(
  fromFile,
  fromRank,
  toFile,
  toRank
) {
  const fileStep =
    Math.sign(toFile - fromFile);

  const rankStep =
    Math.sign(toRank - fromRank);

  let currentFile = fromFile + fileStep;
  let currentRank = fromRank + rankStep;

  while (
    currentFile !== toFile ||
    currentRank !== toRank
  ) {
    const square =
      `${files[currentFile]}${currentRank}`;

    if (boardState[square]) {
      return false;
    }

    currentFile += fileStep;
    currentRank += rankStep;
  }

  return true;
}


function isSquareAttacked(square, attackerColor, state = boardState) {
  const targetFile = files.indexOf(square[0]);
  const targetRank = Number(square[1]);

  for (const from in state) {
    const piece = state[from];

    if (piece.color !== attackerColor) continue;

    const fromFile = files.indexOf(from[0]);
    const fromRank = Number(from[1]);

    const fileDiff = targetFile - fromFile;
    const rankDiff = targetRank - fromRank;

    // Pawn attacks
    if (piece.type === "p") {
      const direction = attackerColor === "white" ? 1 : -1;

      if (
        Math.abs(fileDiff) === 1 &&
        rankDiff === direction
      ) {
        return true;
      }
    }

    // Knight attacks
    if (piece.type === "n") {
      if (
        (Math.abs(fileDiff) === 2 && Math.abs(rankDiff) === 1) ||
        (Math.abs(fileDiff) === 1 && Math.abs(rankDiff) === 2)
      ) {
        return true;
      }
    }

    // King attacks
    if (piece.type === "k") {
      if (
        Math.abs(fileDiff) <= 1 &&
        Math.abs(rankDiff) <= 1
      ) {
        return true;
      }
    }

    // Rook / Queen
    if (piece.type === "r" || piece.type === "q") {
      if (
        (fileDiff === 0 || rankDiff === 0) &&
        isPathClearForState(
          fromFile,
          fromRank,
          targetFile,
          targetRank,
          state
        )
      ) {
        return true;
      }
    }

    // Bishop / Queen
    if (piece.type === "b" || piece.type === "q") {
      if (
        Math.abs(fileDiff) === Math.abs(rankDiff) &&
        isPathClearForState(
          fromFile,
          fromRank,
          targetFile,
          targetRank,
          state
        )
      ) {
        return true;
      }
    }
  }

  return false;
}


function isPathClearForState(
  fromFile,
  fromRank,
  toFile,
  toRank,
  state
) {
  const fileStep = Math.sign(toFile - fromFile);
  const rankStep = Math.sign(toRank - fromRank);

  let currentFile = fromFile + fileStep;
  let currentRank = fromRank + rankStep;

  while (
    currentFile !== toFile ||
    currentRank !== toRank
  ) {
    const square = `${files[currentFile]}${currentRank}`;

    if (state[square]) {
      return false;
    }

    currentFile += fileStep;
    currentRank += rankStep;
  }

  return true;
}


function isKingInCheck(color, state = boardState) {
  let kingSquare = null;

  for (const square in state) {
    if (
      state[square].type === "k" &&
      state[square].color === color
    ) {
      kingSquare = square;
      break;
    }
  }

  if (!kingSquare) return true;

  const enemyColor =
    color === "white" ? "black" : "white";

  return isSquareAttacked(
    kingSquare,
    enemyColor,
    state
  );
}


function hasAnyLegalMove(color) {
  for (const from in boardState) {
    const piece = boardState[from];

    if (piece.color !== color) continue;

    for (const file of files) {
      for (let rank = 1; rank <= 8; rank++) {
        const to = `${file}${rank}`;

        if (!isLegalMove(from, to)) continue;

        const testBoard = { ...boardState };

        testBoard[to] = testBoard[from];
        delete testBoard[from];

        if (!isKingInCheck(color, testBoard)) {
          return true;
        }
      }
    }
  }

  return false;
}


function isCheckmate(color) {
  return (
    isKingInCheck(color) &&
    !hasAnyLegalMove(color)
  );
}
function isStalemate(color) {
  return !isKingInCheck(color) && !hasAnyLegalMove(color);
}
function isInsufficientMaterial() {

function isThreefoldRepetition() {
  const currentKey = getPositionKey();

  let count = 0;

  for (const key of positionHistory) {
    if (key === currentKey) {
      count++;
    }
  }

  return count >= 3;
}

  const pieces = [];

  for (const square in boardState) {
    const piece = boardState[square];

    if (piece.type !== "k") {
      pieces.push({
        square,
        type: piece.type,
        color: piece.color
      });
    }
  }

  // King vs King
  if (pieces.length === 0) {
    return true;
  }

  // King + one bishop/knight vs King
  if (pieces.length === 1) {
    return (
      pieces[0].type === "b" ||
      pieces[0].type === "n"
    );
  }

  // King + bishop vs King + bishop
  if (
    pieces.length === 2 &&
    pieces[0].type === "b" &&
    pieces[1].type === "b"
  ) {
    const square1 = pieces[0].square;
    const square2 = pieces[1].square;

    const color1 =
      (files.indexOf(square1[0]) + Number(square1[1])) % 2;

    const color2 =
      (files.indexOf(square2[0]) + Number(square2[1])) % 2;

    return color1 === color2;
  }

  return false;
}

async function applyMove(from, to) {
  const movingPiece = boardState[from];

  // Capturing a rook removes that side's castling right
const capturedPiece = boardState[to];

if (capturedPiece && capturedPiece.type === "r") {
  if (to === "a1") castlingRights.whiteQueen = false;
  if (to === "h1") castlingRights.whiteKing = false;
  if (to === "a8") castlingRights.blackQueen = false;
  if (to === "h8") castlingRights.blackKing = false;
}

  // Update castling rights
if (movingPiece.type === "k") {
  if (movingPiece.color === "white") {
    castlingRights.whiteKing = false;
    castlingRights.whiteQueen = false;
  } else {
    castlingRights.blackKing = false;
    castlingRights.blackQueen = false;
  }
}

if (movingPiece.type === "r") {
  if (from === "a1") castlingRights.whiteQueen = false;
  if (from === "h1") castlingRights.whiteKing = false;
  if (from === "a8") castlingRights.blackQueen = false;
  if (from === "h8") castlingRights.blackKing = false;
}

  if (!movingPiece) return;

  if (!isLegalMove(from, to)) {
    selectedSquare = null;
    renderBoard();
    updateStatus("Illegal move", "Choose a legal square.");
    return;
  }


// Test the move before actually making it
const testBoard = { ...boardState };

testBoard[to] = testBoard[from];
delete testBoard[from];

const movingColor = testBoard[to].color;

if (isKingInCheck(movingColor, testBoard)) {
  selectedSquare = null;
  renderBoard();

  updateStatus(
    "Illegal move",
    "You cannot leave your king in check."
  );

  return;
}
const wasCapture = Boolean(boardState[to]);

boardState[to] = movingPiece;
delete boardState[from];

// 50-move rule counter
if (movingPiece.type === "p" || boardState[to] !== undefined) {
  halfmoveClock = 0;
} else {
  halfmoveClock++;
}

/* Pawn promotion */
let promotionPiece = "";

if (
  movingPiece.type === "p" &&
  (
    (movingPiece.color === "white" && to[1] === "8") ||
    (movingPiece.color === "black" && to[1] === "1")
  )
) {
let choice = await showPromotionPopup(movingPiece.color);

  const pieceType = {
    q: "q",
    r: "r",
    b: "b",
    n: "n"
  };

  boardState[to] = {
    color: movingPiece.color,
    type: pieceType[choice]
  };

  promotionPiece = choice;
}

moveHistory.push(`${from}${to}${promotionPiece}`);



// Check whether White is in checkmate after the engine move
if (
  isKingInCheck("white") &&
  isCheckmate("white")
) {

  
  playerTurn = false;

  renderBoard();
  updateMoveHistory();

  updateStatus(
    "CHECKMATE",
    "Checkmate! The engine wins."
  );

showCheckmatePopup("black");


  return;
}

selectedSquare = null;

// Check whether Black is in checkmate
if (
  isKingInCheck("black") &&
  isCheckmate("black")
) {
  playerTurn = false;

  renderBoard();
  updateMoveHistory();

  updateStatus(
    "CHECKMATE",
    "You win! The engine has no legal moves."
  );

showCheckmatePopup("white");

  return;
}

// Check for 50-move draw
if (halfmoveClock >= 100) {
  playerTurn = false;

  renderBoard();
  updateMoveHistory();

  updateStatus(
    "DRAW",
    "50-move rule"
  );

  showDrawPopup("50-MOVE RULE");

  return;
}


// Check for stalemate
const sideToMove = "black";

if (isStalemate(sideToMove)) {
  playerTurn = false;

  renderBoard();
  updateMoveHistory();

  updateStatus(
    "STALEMATE",
    "The game ends in a draw."
  );

  return;
}

playerTurn = false;

renderBoard();
updateMoveHistory();

updateStatus(
  "Engine thinking",
  `${currentDifficulty.toUpperCase()} difficulty`
);

getEngineMove();
}


/* ==========================================================================
   ENGINE
   ========================================================================== */

async function getEngineMove() {

  if (engineThinking) {
    return;
  }

  engineThinking = true;

  const depthByDifficulty = {
    beginner: 4,
    intermediate: 7,
    expert: 10
  };

  const depth = depthByDifficulty[currentDifficulty] || 8;

  try {

    const response = await fetch("http://localhost:4000/api/engine", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        position: "startpos",
        moves: moveHistory,
        depth
      })
    });

    if (!response.ok) {
      throw new Error(`Engine HTTP ${response.status}`);
    }

    const data = await response.json();

    const engineMove =
      data.move ||
      data.bestmove ||
      data.bestMove;

    if (!engineMove || engineMove.length < 4) {
      throw new Error("Engine returned no valid move.");
    }

    const from = engineMove.substring(0, 2);
    const to = engineMove.substring(2, 4);

    const enginePiece = boardState[from];
    const promotion = engineMove.length >= 5
  ? engineMove[4]
  : null;



  if (enginePiece) {

  // Handle castling
  if (engineMove === "e1g1") {
    boardState.g1 = enginePiece;
    delete boardState.e1;

    boardState.f1 = boardState.h1;
    delete boardState.h1;

  } else if (engineMove === "e1c1") {
    boardState.c1 = enginePiece;
    delete boardState.e1;

    boardState.d1 = boardState.a1;
    delete boardState.a1;

  } else if (engineMove === "e8g8") {
    boardState.g8 = enginePiece;
    delete boardState.e8;

    boardState.f8 = boardState.h8;
    delete boardState.h8;

  } else if (engineMove === "e8c8") {
    boardState.c8 = enginePiece;
    delete boardState.e8;

    boardState.d8 = boardState.a8;
    delete boardState.a8;

  } else {
    // Normal move
if (promotion) {
  boardState[to] = {
    color: enginePiece.color,
    type: promotion
  };
} else {
  boardState[to] = enginePiece;
}

delete boardState[from];
  }

  moveHistory.push(engineMove);
}



   // Check for stalemate after engine move
if (isStalemate("white")) {
  playerTurn = false;

  renderBoard();
  updateMoveHistory();

  updateStatus(
    "STALEMATE",
    "The game ends in a draw."
  );

  return;
}

renderBoard();
updateMoveHistory();

playerTurn = true;

updateStatus(
  "Your turn",
  "Make your move."
);
  } catch (error) {

    console.error("OVE engine error:", error);

    /*
      The board remains playable even when the engine server
      is not running. This prevents the UI from becoming stuck.
    */

    playerTurn = true;

    updateStatus(
      "Engine unavailable",
      "Start the engine server to play against the computer."
    );

  } finally {
    engineThinking = false;
  }
}


/* ==========================================================================
   DIFFICULTY
   ========================================================================== */

function setupDifficultyButtons() {

  const buttons = document.querySelectorAll(".difficulty-btn");

  buttons.forEach(button => {

    button.addEventListener("click", () => {

      const level = button.dataset.level;

      if (!level) {
        return;
      }

      currentDifficulty = level;

      buttons.forEach(btn => {
        btn.classList.remove("active");
      });

      button.classList.add("active");

      updateDifficultyUI();

      updateStatus(
        "Your turn",
        `${currentDifficulty.toUpperCase()} difficulty`
      );
    });
  });
}


function updateDifficultyUI() {

  const buttons = document.querySelectorAll(".difficulty-btn");

  buttons.forEach(button => {

    const active =
      button.dataset.level === currentDifficulty;

    button.classList.toggle("active", active);
  });

  if (difficultyButton) {
    difficultyButton.textContent =
      currentDifficulty.toUpperCase();
  }
}


/* ==========================================================================
   STATUS
   ========================================================================== */

function updateStatus(primary, secondary) {

  if (statusPrimary) {
    statusPrimary.textContent = primary;
  }

  if (statusSecondary) {
    statusSecondary.textContent = secondary;
  }
}


/* ==========================================================================
   MOVE HISTORY
   ========================================================================== */

function updateMoveHistory() {

  if (!historyList) {
    return;
  }

  historyList.innerHTML = "";

  for (let i = 0; i < moveHistory.length; i += 2) {

    const row = document.createElement("div");
    row.className = "history-row";

    const number = document.createElement("span");
    number.className = "move-num";
    number.textContent = `${Math.floor(i / 2) + 1}.`;

    const whiteMove = document.createElement("span");
    whiteMove.className = "move-white";
    whiteMove.textContent = moveHistory[i] || "";

    const blackMove = document.createElement("span");
    blackMove.className = "move-black";
    blackMove.textContent = moveHistory[i + 1] || "";

    row.appendChild(number);
    row.appendChild(whiteMove);
    row.appendChild(blackMove);

    historyList.appendChild(row);
  }

  historyList.scrollTop = historyList.scrollHeight;
}


/* ==========================================================================
   ACTION BUTTONS
   ========================================================================== */


   function showResignConfirmation() {
  if (document.getElementById("resign-dialog")) {
    return;
  }

  const dialog = document.createElement("div");

  dialog.id = "resign-dialog";

  dialog.innerHTML = `
    <div class="resign-dialog-box">
      <div class="resign-dialog-title">
        RESIGN GAME?
      </div>

      <div class="resign-dialog-text">
        Are you sure you want to resign this game?
      </div>

      <div class="resign-dialog-actions">
        <button type="button" id="resign-no">
          NO
        </button>

        <button type="button" id="resign-yes">
          YES
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  document.getElementById("resign-no").addEventListener("click", () => {
    dialog.remove();
  });

  document.getElementById("resign-yes").addEventListener("click", () => {
    window.location.href = "index.html";
  });
}


function setupActionButtons() {}

function showPromotionPopup(color) {
  return new Promise((resolve) => {

    if (document.getElementById("promotion-dialog")) {
      return;
    }

    const dialog = document.createElement("div");
    dialog.id = "promotion-dialog";

    const pieces = [
      { type: "q", name: "QUEEN" },
      { type: "r", name: "ROOK" },
      { type: "b", name: "BISHOP" },
      { type: "n", name: "KNIGHT" }
    ];

    dialog.innerHTML = `
      <div class="promotion-box">

        <div class="promotion-title">
          PROMOTE PAWN
        </div>

        <div class="promotion-subtitle">
          CHOOSE A PIECE
        </div>

        <div class="promotion-options">
          ${pieces.map(piece => `
            <button
              type="button"
              class="promotion-piece"
              data-piece="${piece.type}"
            >
              <div class="promotion-icon">
                ${PIECE_SVGS[piece.type]}
              </div>
              <span>${piece.name}</span>
            </button>
          `).join("")}
        </div>

      </div>
    `;

    document.body.appendChild(dialog);

    dialog.querySelectorAll(".promotion-piece").forEach(button => {
      button.addEventListener("click", () => {

        const choice = button.dataset.piece;

        dialog.remove();

        resolve(choice);
      });
    });
  });
}

window.showDrawPopup = function(reason) {
  if (document.getElementById("draw-dialog")) return;

  const dialog = document.createElement("div");
  dialog.id = "draw-dialog";

  dialog.innerHTML = `
    <div class="checkmate-box stalemate-box">

      <div class="checkmate-title">
        DRAW
      </div>

      <div class="checkmate-message">
        ${reason}
      </div>

      <div class="checkmate-actions">
        <button type="button" id="draw-new-game">
          NEW GAME
        </button>

        <button type="button" id="draw-exit">
          EXIT
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(dialog);

  document
    .getElementById("draw-new-game")
    .addEventListener("click", () => {
      window.location.href = "index.html";
    });

  document
    .getElementById("draw-exit")
    .addEventListener("click", () => {
      window.location.href = "index.html";
    });
};


window.showStalematePopup = function() {
  if (document.getElementById("stalemate-dialog")) return;

  const dialog = document.createElement("div");
  dialog.id = "stalemate-dialog";

  dialog.innerHTML = `
    <div class="checkmate-box stalemate-box">

      <div class="checkmate-title">
        STALEMATE
      </div>

      <div class="checkmate-message">
        DRAW GAME
      </div>

      <div class="checkmate-actions">
        <button type="button" id="stalemate-new-game">
          NEW GAME
        </button>

        <button type="button" id="stalemate-exit">
          EXIT
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(dialog);

  document
    .getElementById("stalemate-new-game")
    .addEventListener("click", () => {
      window.location.href = "index.html";
    });

  document
    .getElementById("stalemate-exit")
    .addEventListener("click", () => {
      window.location.href = "index.html";
    });
};


window.showCheckmatePopup = function(winner) {
  console.log("CHECKMATE POPUP CALLED", winner);
  if (document.getElementById("checkmate-dialog")) return;

  const dialog = document.createElement("div");
  dialog.id = "checkmate-dialog";

  const playerWon = winner === "white";

  dialog.innerHTML = `
    <div class="checkmate-box ${playerWon ? "player-win" : "engine-win"}">

      <div class="checkmate-title">
        CHECKMATE
      </div>

      <div class="checkmate-message">
        ${playerWon ? "YOU WIN" : "ENGINE WINS"}
      </div>

      <div class="checkmate-actions">
        <button type="button" id="checkmate-new-game">
          NEW GAME
        </button>

        <button type="button" id="checkmate-exit">
          EXIT
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(dialog);

  document
    .getElementById("checkmate-new-game")
    .addEventListener("click", () => {
      window.location.href = "index.html";
    });

  document
    .getElementById("checkmate-exit")
    .addEventListener("click", () => {
      window.location.href = "index.html";
    });
}


  const resignButton = document.getElementById("btn-resign");
  const newGameButton = document.getElementById("btn-new-game");
  const topNewGameButton = document.getElementById("btn-top-new-game");

 if (resignButton) {
  resignButton.addEventListener("click", showResignConfirmation);
}

if (newGameButton) {
  newGameButton.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

if (topNewGameButton) {
  topNewGameButton.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}


/* ==========================================================================
   RESET
   ========================================================================== */

function resetGame() {

  boardState = clonePosition(DEFAULT_SETUP);

  moveHistory = [];
  halfmoveClock = 0;
 
positionHistory = [];

castlingRights = {
  whiteKing: true,
  whiteQueen: true,
  blackKing: true,
  blackQueen: true
};

  selectedSquare = null;
  playerTurn = true;
  engineThinking = false;

  renderBoard();
  updateMoveHistory();

  updateStatus(
    "Your turn",
    `${currentDifficulty.toUpperCase()} difficulty`);
}