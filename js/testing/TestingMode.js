// TestingMode.js - Development testing utilities

import { CONFIG } from '../config.js';

export class TestingMode {
    constructor(simulationEngine, storage, uiController) {
        this.engine = simulationEngine;
        this.storage = storage;
        this.uiController = uiController;
        this.isActive = false;
        this.speedMultiplier = 1;
        this.panel = null;

        this.initializeUI();
        this.setupKeyboardShortcuts();
    }

    initializeUI() {
        // Create testing mode panel
        const panel = document.createElement('div');
        panel.id = 'testing-panel';
        panel.className = 'testing-panel hidden';
        panel.innerHTML = `
            <div class="testing-header">
                <h3>🧪 Testing Mode</h3>
                <button id="testing-close" class="btn-icon">×</button>
            </div>
            <div class="testing-content">
                <section class="testing-section">
                    <h4>Simulation Controls</h4>
                    <button id="run-cycle" class="btn-primary">Run 1 Cycle</button>
                    <button id="run-10-cycles" class="btn-primary">Run 10 Cycles</button>
                    <button id="run-100-cycles" class="btn-primary">Run 100 Cycles</button>
                    <button id="run-day" class="btn-primary">Run 1 Day (288 cycles)</button>
                </section>

                <section class="testing-section">
                    <h4>Time Speed</h4>
                    <div class="speed-controls">
                        <button id="speed-1x" class="btn-secondary">1x (5 min)</button>
                        <button id="speed-10x" class="btn-secondary">10x (30 sec)</button>
                        <button id="speed-60x" class="btn-secondary">60x (5 sec)</button>
                        <button id="speed-paused" class="btn-secondary">⏸ Pause</button>
                    </div>
                    <div class="speed-indicator">Current: <span id="speed-display">1x (Normal)</span></div>
                </section>

                <section class="testing-section">
                    <h4>Placement Controls</h4>
                    <button id="reset-cooldown" class="btn-primary">Reset Placement Cooldown</button>
                    <button id="toggle-limit" class="btn-secondary">
                        <span id="limit-status">Disable Daily Limit</span>
                    </button>
                </section>

                <section class="testing-section">
                    <h4>Garden Controls</h4>
                    <button id="clear-garden" class="btn-danger">Clear All Elements</button>
                    <button id="reset-garden" class="btn-danger">Full Reset (New Garden)</button>
                    <button id="seed-garden" class="btn-secondary">Re-seed Garden</button>
                </section>

                <section class="testing-section">
                    <h4>Statistics</h4>
                    <div class="testing-stats">
                        <div>Cycle: <span id="test-cycle-count">0</span></div>
                        <div>Simulated Days: <span id="test-days">0</span></div>
                        <div>Speed: <span id="test-speed">1x</span></div>
                    </div>
                </section>

                <section class="testing-section">
                    <h4>Quick Actions</h4>
                    <button id="mass-water" class="btn-secondary">Water Entire Garden</button>
                    <button id="mass-sun" class="btn-secondary">Sunlight Boost All</button>
                    <button id="kill-all" class="btn-danger">Kill All Plants</button>
                </section>
            </div>
        `;

        document.body.appendChild(panel);
        this.panel = panel;

        this.setupPanelEventListeners();
    }

    setupPanelEventListeners() {
        // Close button
        document.getElementById('testing-close').addEventListener('click', () => {
            this.deactivate();
        });

        // Simulation controls
        document.getElementById('run-cycle').addEventListener('click', () => {
            this.runCycles(1);
        });

        document.getElementById('run-10-cycles').addEventListener('click', () => {
            this.runCycles(10);
        });

        document.getElementById('run-100-cycles').addEventListener('click', () => {
            this.runCycles(100);
        });

        document.getElementById('run-day').addEventListener('click', () => {
            this.runCycles(CONFIG.CYCLES_PER_DAY);
        });

        // Speed controls
        document.getElementById('speed-1x').addEventListener('click', () => {
            this.setSpeed(1);
        });

        document.getElementById('speed-10x').addEventListener('click', () => {
            this.setSpeed(10);
        });

        document.getElementById('speed-60x').addEventListener('click', () => {
            this.setSpeed(60);
        });

        document.getElementById('speed-paused').addEventListener('click', () => {
            this.setSpeed(0);
        });

        // Placement controls
        document.getElementById('reset-cooldown').addEventListener('click', () => {
            this.resetPlacementCooldown();
        });

        document.getElementById('toggle-limit').addEventListener('click', () => {
            this.toggleDailyLimit();
        });

        // Garden controls
        document.getElementById('clear-garden').addEventListener('click', () => {
            if (confirm('Clear all elements from the garden?')) {
                this.clearGarden();
            }
        });

        document.getElementById('reset-garden').addEventListener('click', () => {
            if (confirm('Reset everything and start a new garden?')) {
                this.resetGarden();
            }
        });

        document.getElementById('seed-garden').addEventListener('click', () => {
            this.seedGarden();
        });

        // Quick actions
        document.getElementById('mass-water').addEventListener('click', () => {
            this.waterAllTiles();
        });

        document.getElementById('mass-sun').addEventListener('click', () => {
            this.sunlightBoostAll();
        });

        document.getElementById('kill-all').addEventListener('click', () => {
            if (confirm('Kill all living plants?')) {
                this.killAllPlants();
            }
        });
    }

    setupKeyboardShortcuts() {
        // Testing mode button in header
        const testingBtn = document.getElementById('testing-mode-btn');
        if (testingBtn) {
            testingBtn.addEventListener('click', () => {
                this.toggle();
            });
        }

        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + T to toggle testing mode
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                this.toggle();
            }

            // Only work in testing mode
            if (!this.isActive) return;

            // Space to run 1 cycle
            if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.runCycles(1);
            }

            // 'R' to reset cooldown
            if (e.key === 'r' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.resetPlacementCooldown();
            }
        });
    }

    toggle() {
        if (this.isActive) {
            this.deactivate();
        } else {
            this.activate();
        }
    }

    activate() {
        this.isActive = true;
        this.panel.classList.remove('hidden');
        this.updateStats();

        // Add visual indicator to page
        document.body.classList.add('testing-mode-active');

        console.log('🧪 Testing Mode Activated');
        console.log('Shortcuts:');
        console.log('  Ctrl/Cmd + T: Toggle testing mode');
        console.log('  Space: Run 1 cycle');
        console.log('  R: Reset placement cooldown');
    }

    deactivate() {
        this.isActive = false;
        this.panel.classList.add('hidden');
        document.body.classList.remove('testing-mode-active');

        // Reset to normal speed
        this.setSpeed(1);

        console.log('Testing Mode Deactivated');
    }

    runCycles(count) {
        console.log(`Running ${count} cycle(s)...`);

        for (let i = 0; i < count; i++) {
            this.engine.runCycle();
        }

        this.updateStats();
        console.log(`Completed ${count} cycle(s)`);
    }

    setSpeed(multiplier) {
        this.speedMultiplier = multiplier;

        // Stop current simulation
        this.engine.stop();

        if (multiplier > 0) {
            // Calculate new interval
            const newInterval = CONFIG.SIMULATION_INTERVAL / multiplier;

            // Restart with new speed
            this.engine.isRunning = true;
            this.engine.intervalId = setInterval(() => {
                this.engine.runCycle();
                this.updateStats();
            }, newInterval);

            console.log(`Speed set to ${multiplier}x (interval: ${newInterval}ms)`);
        } else {
            console.log('Simulation paused');
        }

        this.updateSpeedDisplay();
    }

    updateSpeedDisplay() {
        const speedDisplay = document.getElementById('speed-display');
        const testSpeed = document.getElementById('test-speed');

        if (this.speedMultiplier === 0) {
            speedDisplay.textContent = '⏸ Paused';
            testSpeed.textContent = 'Paused';
        } else if (this.speedMultiplier === 1) {
            speedDisplay.textContent = '1x (Normal - 5 min)';
            testSpeed.textContent = '1x';
        } else {
            const interval = CONFIG.SIMULATION_INTERVAL / this.speedMultiplier / 1000;
            speedDisplay.textContent = `${this.speedMultiplier}x (${interval}s per cycle)`;
            testSpeed.textContent = `${this.speedMultiplier}x`;
        }
    }

    resetPlacementCooldown() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.LAST_PLACEMENT);
        this.uiController.updateTimer();
        console.log('✅ Placement cooldown reset - you can place an element now!');
    }

    toggleDailyLimit() {
        const currentValue = localStorage.getItem('testing_disable_limit') === 'true';
        const newValue = !currentValue;

        localStorage.setItem('testing_disable_limit', newValue.toString());

        const button = document.getElementById('limit-status');
        button.textContent = newValue ? 'Enable Daily Limit' : 'Disable Daily Limit';

        // Override storage canPlaceToday method
        if (newValue) {
            this.storage._originalCanPlaceToday = this.storage.canPlaceToday;
            this.storage.canPlaceToday = () => true;
            console.log('Daily limit disabled - unlimited placements!');
        } else {
            if (this.storage._originalCanPlaceToday) {
                this.storage.canPlaceToday = this.storage._originalCanPlaceToday;
            }
            console.log('Daily limit enabled');
        }

        this.uiController.updateTimer();
    }

    clearGarden() {
        for (let y = 0; y < this.engine.grid.size; y++) {
            for (let x = 0; x < this.engine.grid.size; x++) {
                const tile = this.engine.grid.tiles[y][x];
                tile.removeEntity();
            }
        }

        this.engine.saveState();
        this.uiController.updateUI();
        console.log('🧹 Garden cleared');
    }

    resetGarden() {
        localStorage.clear();
        location.reload();
    }

    seedGarden() {
        const centerX = Math.floor(this.engine.grid.size / 2);
        const centerY = Math.floor(this.engine.grid.size / 2);

        // Import element classes
        import('../elements/plants.js').then(({ Plant }) => {
            import('../elements/environmental.js').then(({ Environmental }) => {
                import('../config.js').then(({ ELEMENT_TYPES }) => {
                    // Plant an oak tree in the center
                    this.engine.placeElement(Plant, ELEMENT_TYPES.OAK_TREE, centerX, centerY, 'system');

                    // Add some grass around it
                    const grassPositions = [
                        [centerX - 2, centerY],
                        [centerX + 2, centerY],
                        [centerX, centerY - 2],
                        [centerX, centerY + 2],
                    ];

                    for (const [x, y] of grassPositions) {
                        this.engine.placeElement(Plant, ELEMENT_TYPES.GRASS_PATCH, x, y, 'system');
                    }

                    // Add a couple flowers
                    this.engine.placeElement(Plant, ELEMENT_TYPES.WILDFLOWER, centerX - 1, centerY - 1, 'system');
                    this.engine.placeElement(Plant, ELEMENT_TYPES.WILDFLOWER, centerX + 1, centerY + 1, 'system');

                    // Add a rain cloud
                    this.engine.placeElement(Environmental, ELEMENT_TYPES.RAIN_CLOUD, centerX, centerY - 1, 'system');

                    console.log('🌱 Garden re-seeded');
                });
            });
        });
    }

    waterAllTiles() {
        for (let y = 0; y < this.engine.grid.size; y++) {
            for (let x = 0; x < this.engine.grid.size; x++) {
                const tile = this.engine.grid.tiles[y][x];
                tile.addMoisture(100);
            }
        }

        this.engine.saveState();
        console.log('💧 All tiles watered to 100%');
    }

    sunlightBoostAll() {
        for (let y = 0; y < this.engine.grid.size; y++) {
            for (let x = 0; x < this.engine.grid.size; x++) {
                const tile = this.engine.grid.tiles[y][x];
                tile.addSunlight(100);
            }
        }

        this.engine.saveState();
        console.log('☀️ All tiles boosted to maximum sunlight');
    }

    killAllPlants() {
        const entities = this.engine.grid.getLivingEntities();
        let count = 0;

        for (const entity of entities) {
            if (entity.type.category === 'plant') {
                entity.die();
                count++;
            }
        }

        this.engine.saveState();
        this.uiController.updateUI();
        console.log(`☠️ Killed ${count} plant(s)`);
    }

    updateStats() {
        document.getElementById('test-cycle-count').textContent = this.engine.cycleCount;
        document.getElementById('test-days').textContent =
            (this.engine.cycleCount / CONFIG.CYCLES_PER_DAY).toFixed(2);
    }
}
