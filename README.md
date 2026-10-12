# Kingdoms of Ash — multiplayer browser strategy

An original turn-based fantasy strategy inspired by classic adventure-map games. No third-party game assets.

## Start
```bash
npm install
npm start
```
Open http://localhost:3000 on two browsers or computers. Create a room, share its 6-character code, then both players press **Ready**.

## Controls
Click a highlighted neighbouring tile to move your hero. Gather resources, capture mines and enemy castles. Click **End turn** to pass control. Each player starts with a castle and hero. Mines generate gold every new day; the first player to capture the opposing castle wins.

## Architecture
- `server.js`: HTTP server + WebSocket rooms. Server-authoritative game state and validation.
- `public/`: dependency-free browser UI rendered with Canvas.
- `game.js`: deterministic map generation, turn rules, win conditions.
- `test/`: Node built-in test suite.

## Security and limitations
Rooms are held in memory and reset when the server restarts. A room supports two live players; reconnecting after a disconnect requires a new lobby in this MVP. No authentication or persistent storage yet. Set `PORT` for deployment, and use HTTPS/WSS behind a reverse proxy. The game supports online play only when this Node server is running and publicly accessible.

## Roadmap
Hex combat, units and recruitment, pathfinding, fog of war, persistent rooms, spectator mode, 2–8 players, production deployment.
