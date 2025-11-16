# The Garden 🌱

A persistent virtual ecosystem where each visitor contributes ONE element per day. The ecosystem evolves in real-time based on ecological rules, creating emergent gameplay and beautiful visuals.

## Features

- **Daily Contribution System**: Each user can place one element per 24 hours
- **Ecosystem Simulation**: Real-time simulation with moisture, sunlight, and nutrient systems
- **Multiple Element Types**:
  - Plants: Oak Tree, Wildflower, Grass Patch
  - Environmental: Rain Cloud, Sunbeam, Compost, Boulder
- **Growth & Survival**: Plants grow through stages and must survive based on environmental conditions
- **Seasonal Changes**: Weekly rotating seasons (Spring, Summer, Autumn, Winter)
- **Leaderboards**: Track the oldest living elements
- **Personal Contributions**: See all your placed elements and their status
- **Interactive Canvas**: Zoom, pan, and explore the garden
- **Persistent State**: Garden state is saved and continues evolving

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (Python, Node.js, or any HTTP server)

### Installation

1. Clone or download this repository

2. Start a local web server in the project directory:

   **Using Python 3:**
   ```bash
   python -m http.server 8000
   ```

   **Using Python 2:**
   ```bash
   python -m SimpleHTTPServer 8000
   ```

   **Using Node.js:**
   ```bash
   npx http-server -p 8000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## How to Play

1. **First Visit**: You'll see a tutorial overlay explaining the basics
2. **Select an Element**: Choose from plants or environmental elements in the sidebar
3. **Click a Tile**: Click on an empty tile on the grid to select placement location
4. **Confirm Placement**: Click "Place Element" and confirm your choice
5. **Return Tomorrow**: Come back in 24 hours to place another element and see how the ecosystem evolved!

## Element Guide

### Plants 🌱

- **Oak Tree** (🌳): Slow growth (7 days), lives 60+ days, provides shade
- **Wildflower** (🌸): Fast bloom (2 days), lives 10-15 days, attracts pollinators
- **Grass Patch** (🌿): Spreads to adjacent tiles, lives indefinitely with water

### Environmental Elements 💧

- **Rain Cloud** (🌧️): Waters 3x3 area, lasts 1 cycle
- **Sunbeam** (☀️): Boosts growth in 2x2 area for 2 cycles
- **Compost** (🍂): Enriches soil permanently, +50% growth speed
- **Boulder** (🪨): Permanent decoration, creates shade

## Ecosystem Rules

- **Moisture**: Plants need moisture > 20% to survive, evaporates over time
- **Sunlight**: Different plants have different sunlight requirements
- **Growth**: Plants grow faster with optimal conditions and during Spring
- **Seasons**: Rotate weekly, affecting growth rates and survival
- **Spreading**: Grass spreads to adjacent tiles when healthy
- **Death**: Plants die from lack of water, insufficient sunlight, or old age

## Project Structure

```
the-garden/
├── index.html              # Main HTML file
├── styles.css              # All styles
├── js/
│   ├── main.js            # Application entry point
│   ├── config.js          # Configuration and constants
│   ├── core/
│   │   ├── Grid.js        # Grid management
│   │   └── Tile.js        # Individual tile logic
│   ├── elements/
│   │   ├── Element.js     # Base element class
│   │   ├── plants.js      # Plant implementations
│   │   └── environmental.js # Environmental elements
│   ├── simulation/
│   │   └── SimulationEngine.js # Core simulation logic
│   ├── rendering/
│   │   └── Renderer.js    # Canvas rendering
│   ├── ui/
│   │   └── UIController.js # UI management
│   └── storage/
│       └── Storage.js     # LocalStorage persistence
└── README.md              # This file
```

## Technical Details

- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Rendering**: HTML5 Canvas
- **State Management**: LocalStorage
- **Simulation**: Runs every 5 minutes (configurable)
- **Responsive**: Works on desktop and mobile

## Development Roadmap

See `the-garden-project-spec.md` for the full project specification and future features including:

- Animals (Butterfly, Rabbit, Bird)
- Day/Night visual cycle
- Time-lapse generation
- User accounts
- Backend with AWS (DynamoDB, Lambda, S3)
- Community challenges
- Advanced leaderboards

## Contributing

This is a solo project, but suggestions and feedback are welcome! Feel free to open issues or submit pull requests.

## License

MIT License - feel free to use and modify for your own projects.

## Credits

Created following "The Garden" project specification.

---

**Enjoy gardening! 🌻**