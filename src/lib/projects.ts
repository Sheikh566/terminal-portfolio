export function handleProjects() {
  return `
- PrtSc made with Swift, ScreenCaptureKit, macOS — Nov 2026
  • macOS menu bar app that brings GNOME Shell's screenshot UI to the Mac
  • Selection, Screen and Window captures plus HEVC screencasts at 60 fps
  • Native macOS 26 Liquid Glass UI, multi-display aware; install via Homebrew
  URL: https://github.com/sheikh566/PrtSc

- Hourlark made with TypeScript, Cloudflare Workers, D1, React — Oct 2026
  • Self-hosted Toggl-style time tracker for a single company
  • One Worker serves the React app and API, with D1 as the database
  • Runs a 50-person team for $5/month; Google or Cloudflare Access sign-in
  URL: https://github.com/sheikh566/hourlark

- Magister made with Go, Systems Programming, Open Source — May 2026
  • Open-source offline platform for learning systems programming with automated tests
  • Go test harness validates user processes over TCP/UDP; works with any language
  • Shipped HTTP and DNS courses with single binary, Web UI, and CLI
  URL: https://github.com/sheikh566/magister

- Brownis (Redis Clone) made with Go, TCP, Systems Programming — Oct 2024
  • In-memory NoSQL key-value store in Go
  • TCP server with goroutines/channels for concurrent clients
  • Redis commands: GET, SET, DEL, EXPIRE; Master-Slave Replication
  URL: https://github.com/sheikh566/brownis

- ADK Nexus made with Python, Streamlit, Vertex AI — Aug 2025
  • Open-source UI for deploying Google Vertex AI agents
  • Secure auth and customizable frontend for agent testing
  URL: https://github.com/IOMechs/adk-nexus

- Legacy projects
  • nestjs-unifonic — URL: https://github.com/sheikh566/nestjs-unifonic
  • Poetify.ai — URL: https://github.com/sheikh566/poetify.ai
  • Wikipedia Advanced Search — URL: https://github.com/sheikh566/wikipedia-advanced-search
  `
}
