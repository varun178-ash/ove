# ♟️ OVE — Sharpen Your Chess Skills

<p align="center">
  <strong>A modern chess practice platform to train, experiment, and sharpen your skills against the VICE chess engine.</strong>
</p>

<p align="center">
  🌐 <a href="[YOUR_RENDER_URL](https://ove-f4lm.onrender.com)">🚀 PLAY OVE LIVE</a>
</p>

<p align="center">
  🎯 Solo Training &nbsp;•&nbsp; 🤖 VICE Engine &nbsp;•&nbsp; ⚡ 3 Difficulty Modes &nbsp;•&nbsp; 🌐 Web Based
</p>

---

## 🧠 About OVE

**OVE** is a chess practice website designed for players who want to improve their game by playing against a chess engine.

Instead of focusing on online multiplayer, OVE focuses on **solo training** — allowing you to play against the computer, test your decisions, and practice different positions and strategies.

The website combines a web-based chess interface with the **VICE chess engine** running through a Node.js backend.

> ♟️ Play.  
> 🧠 Think.  
> ⚡ Improve.  
> 🎯 Sharpen your skills.

---

## 🌐 Live Demo

🚀 **Play OVE:** [Open OVE](YOUR_RENDER_URL)

> Practice chess against the VICE engine directly from your browser.

---

## ✨ Features

- ♟️ Play chess against the computer
- 🤖 Powered by the **VICE chess engine**
- 🎚️ Three difficulty modes
- 🏰 Castling support
- 👑 Pawn promotion
- ⚔️ Checkmate detection
- 🤝 Stalemate detection
- 🔄 Start and restart games
- 🌑 Dark-themed chess interface
- 📱 Web-based interface
- ⚡ Engine responses through a backend API
- ☁️ Deployed using Render

---

## 🎮 Difficulty Modes

OVE currently provides three levels of engine difficulty:

| Mode | Engine Depth |
|------|--------------|
| 🟢 Easy | 4 |
| 🟡 Medium | 7 |
| 🔴 Hard | 10 |

Each mode changes the amount of time the VICE engine spends calculating its move.

---

## 🏗️ How OVE Works

```text
                 👤 Player
                    │
                    ▼
             🌐 OVE Web Interface
                    │
                    │ API Request
                    ▼
              🟢 Node.js Backend
                    │
                    │ UCI Commands
                    ▼
             🤖 VICE Chess Engine
                    │
                    │ Best Move
                    ▼
             🟢 Node.js Backend
                    │
                    ▼
             ♟️ Chess Board
