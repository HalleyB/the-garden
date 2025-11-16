// SimulationEngine.js - Core simulation logic

import { CONFIG, getCurrentSeason, getBaseSunlight } from '../config.js';
import { Grid } from '../core/Grid.js';

export class SimulationEngine {
    constructor() {
        this.grid = new Grid();
        this.cycleCount = 0;
        this.isRunning = false;
        this.intervalId = null;
        this.currentSeason = getCurrentSeason();
        this.listeners = [];
    }

    // Start the simulation
    start() {
        if (this.isRunning) return;

        this.isRunning = true;

        // Run cycle immediately
        this.runCycle();

        // Set up interval for automatic cycles
        this.intervalId = setInterval(() => {
            this.runCycle();
        }, CONFIG.SIMULATION_INTERVAL);

        console.log('Simulation started');
    }

    // Stop the simulation
    stop() {
        if (!this.isRunning) return;

        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        console.log('Simulation stopped');
    }

    // Run one simulation cycle
    runCycle() {
        this.cycleCount++;

        console.log(`Running cycle #${this.cycleCount}`);

        // Update season
        this.currentSeason = getCurrentSeason();

        // 1. Update base tile properties
        this.updateTileProperties();

        // 2. Apply environmental effects
        this.grid.applyShadeEffects();
        this.grid.applyCompostEffects();

        // 3. Update all tiles
        this.grid.updateCycle();

        // 4. Update all entities
        this.updateEntities();

        // 5. Clean up dead entities
        this.cleanupDeadEntities();

        // 6. Save state
        this.saveState();

        // 7. Notify listeners
        this.notifyListeners();
    }

    updateTileProperties() {
        const baseSunlight = getBaseSunlight();

        for (let y = 0; y < this.grid.size; y++) {
            for (let x = 0; x < this.grid.size; x++) {
                const tile = this.grid.tiles[y][x];

                // Reset sunlight to base level
                tile.sunlight = baseSunlight;
            }
        }
    }

    updateEntities() {
        const entities = this.grid.getLivingEntities();

        for (const entity of entities) {
            entity.update(this.grid, this.currentSeason);
        }
    }

    cleanupDeadEntities() {
        const deadEntities = this.grid.getDeadEntities();

        for (const entity of deadEntities) {
            // Keep dead entities for a few cycles for visual effect
            if (entity.age - entity.deathAge > 5) {
                if (entity.tile) {
                    entity.tile.removeEntity();
                }
            }
        }
    }

    // Place an element on the grid
    placeElement(elementClass, elementType, x, y, placedBy = 'player') {
        const tile = this.grid.getTile(x, y);

        if (!tile) {
            return { success: false, error: 'Invalid position' };
        }

        if (!tile.canPlace(elementType)) {
            return { success: false, error: 'Cannot place element here' };
        }

        // Create element instance
        const element = new elementClass(elementType, placedBy);

        // Place on tile
        if (tile.placeEntity(element)) {
            // For environmental elements, apply immediate effects
            if (elementType.category === 'environmental') {
                element.applyEffects(this.grid);
            }

            this.saveState();
            this.notifyListeners();

            return { success: true, element };
        }

        return { success: false, error: 'Failed to place element' };
    }

    // Get statistics
    getStats() {
        const livingEntities = this.grid.getLivingEntities();
        const livingPlants = livingEntities.filter(e => e.type.category === 'plant');

        return {
            totalElements: livingEntities.length,
            livingPlants: livingPlants.length,
            avgMoisture: this.grid.getAverageMoisture(),
            ecosystemHealth: this.grid.getEcosystemHealth(),
            cycleCount: this.cycleCount,
            season: this.currentSeason.name
        };
    }

    // Get leaderboard (oldest living elements)
    getLeaderboard(limit = 10) {
        const livingEntities = this.grid.getLivingEntities();

        // Sort by age descending
        livingEntities.sort((a, b) => b.age - a.age);

        return livingEntities.slice(0, limit).map(entity => ({
            name: entity.type.name,
            icon: entity.getIcon(),
            age: entity.getAgeDays(),
            placedBy: entity.placedBy,
            health: Math.round(entity.health)
        }));
    }

    // Get user's contributions
    getUserContributions(userId) {
        const allEntities = [...this.grid.getLivingEntities(), ...this.grid.getDeadEntities()];

        return allEntities
            .filter(e => e.placedBy === userId)
            .sort((a, b) => b.placedAt - a.placedAt)
            .map(entity => ({
                name: entity.type.name,
                icon: entity.getIcon(),
                age: entity.getAgeDays(),
                isAlive: entity.isAlive,
                health: Math.round(entity.health),
                position: entity.tile ? `(${entity.tile.x}, ${entity.tile.y})` : 'N/A'
            }));
    }

    // Save state to localStorage
    saveState() {
        try {
            const state = {
                grid: this.grid.toJSON(),
                cycleCount: this.cycleCount,
                timestamp: Date.now()
            };

            localStorage.setItem(CONFIG.STORAGE_KEYS.GRID_STATE, JSON.stringify(state));
            localStorage.setItem(CONFIG.STORAGE_KEYS.SIMULATION_LAST_RUN, Date.now().toString());
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    }

    // Load state from localStorage
    loadState() {
        try {
            const stateStr = localStorage.getItem(CONFIG.STORAGE_KEYS.GRID_STATE);

            if (!stateStr) {
                // Initialize start time
                localStorage.setItem(CONFIG.STORAGE_KEYS.START_TIME, Date.now().toString());
                return false;
            }

            const state = JSON.parse(stateStr);

            // Restore grid (will need to reconstruct entities)
            this.grid = Grid.fromJSON(state.grid);
            this.cycleCount = state.cycleCount || 0;

            // Calculate missed cycles and run them
            const lastRun = parseInt(localStorage.getItem(CONFIG.STORAGE_KEYS.SIMULATION_LAST_RUN) || Date.now());
            const timeSince = Date.now() - lastRun;
            const missedCycles = Math.floor(timeSince / CONFIG.SIMULATION_INTERVAL);

            if (missedCycles > 0 && missedCycles < 100) {
                console.log(`Running ${missedCycles} missed cycles...`);
                for (let i = 0; i < missedCycles; i++) {
                    this.runCycle();
                }
            }

            return true;
        } catch (error) {
            console.error('Failed to load state:', error);
            localStorage.setItem(CONFIG.STORAGE_KEYS.START_TIME, Date.now().toString());
            return false;
        }
    }

    // Add listener for state changes
    addListener(callback) {
        this.listeners.push(callback);
    }

    // Remove listener
    removeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    // Notify all listeners
    notifyListeners() {
        for (const listener of this.listeners) {
            try {
                listener(this);
            } catch (error) {
                console.error('Listener error:', error);
            }
        }
    }
}
