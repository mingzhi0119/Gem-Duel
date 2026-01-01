# Gem Duel - Official Release v1.0.0

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/mingzhi0119/Gem-Duel/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A competitive strategic gem-collecting desktop game featuring **P2P Online Multiplayer** and a unique **Roguelike Expansion**. Built with React, TypeScript, and Electron.

---

## 🎮 Game Overview

**Gem Duel** brings the timeless strategy of gem-collecting board games to your desktop with modern enhancements:

- **💎 Tactical Engine Building**: Collect gems, reserve development cards, and race to victory through strategic resource management
- **🃏 Roguelike Mode**: Draft powerful "Buffs" that break the rules and create asymmetric gameplay—no two matches are the same
- **🌐 Online Multiplayer**: Seamless P2P connectivity with region-optimized STUN servers (China-ready) and auto-LAN detection for local play
- **🤖 AI Opponent**: Practice against a challenging "Gem Bot" with strategic decision-making
- **⚡ Native Performance**: Lightning-fast Electron app with strict TypeScript safety

---

## 🚀 Quick Start

### Download & Install

**Windows**
1. Download `GemDuel-Setup-1.0.0.exe` from the [Releases](https://github.com/mingzhi0119/GemDuel/releases) page
2. Run the installer
3. Launch Gem Duel from your desktop or Start Menu

**macOS / Linux**
- Builds coming soon! For now, see "Build from Source" below.

### Build from Source

```bash
# Clone the repository
git clone https://github.com/mingzhi0119/GemDuel.git
cd GemDuel

# Install dependencies
npm install

# Run in development mode
npm run electron:dev

# Build production version
npm run electron:build
```

---

## 🎯 How to Play

### Game Modes

- **Local PvP**: Classic same-screen competitive play
- **VS AI**: Challenge the Gem Bot for solo practice
- **Online Multiplayer**: Connect with friends via peer-to-peer networking

### Roguelike Mode

Enable **Roguelike** mode to draft unique Buffs that modify the rules:
- 24+ abilities across 3 tiers (Tactic, Shift, Game Changer)
- Asymmetric starting conditions
- Dynamic win condition shifts

Visit the in-game **Rulebook** for complete rules and card details.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript
- **Desktop**: Electron
- **Build Tool**: Vite
- **Networking**: PeerJS (WebRTC)
- **State Management**: Zustand + Immer
- **Styling**: Tailwind CSS + Custom Animations

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Created with strategic precision by **Mingzhi** and contributors.

Special thanks to the open-source community for the amazing tools and libraries that made this project possible.

---

**Enjoy the game, and may the best strategist win! 💎👑**
