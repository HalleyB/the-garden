// main.js - Application entry point

import { SimulationEngine } from './simulation/SimulationEngine.js';
import { Renderer } from './rendering/Renderer.js';
import { UIController } from './ui/UIController.js';
import { Plant } from './elements/plants.js';
import { Environmental } from './elements/environmental.js';
import { ELEMENT_TYPES } from './config.js';

class TheGarden {
    constructor() {
        this.simulationEngine = null;
        this.renderer = null;
        this.uiController = null;
        this.animationFrameId = null;
    }

    async init() {
        console.log('Initializing The Garden...');

        try {
            // Create simulation engine
            this.simulationEngine = new SimulationEngine();

            // Load saved state or initialize new garden
            const hasState = this.simulationEngine.loadState();

            if (!hasState) {
                console.log('Starting fresh garden');
                // Optionally seed with some initial elements
                this.seedGarden();
            } else {
                console.log('Loaded existing garden state');
            }

            // Create renderer
            const canvas = document.getElementById('garden-canvas');
            const minimapCanvas = document.getElementById('minimap-canvas');

            this.renderer = new Renderer(canvas, minimapCanvas);
            this.renderer.setGrid(this.simulationEngine.grid);

            // Create UI controller
            this.uiController = new UIController(this.simulationEngine, this.renderer);

            // Start simulation
            this.simulationEngine.start();

            // Start render loop
            this.startRenderLoop();

            console.log('The Garden initialized successfully!');

        } catch (error) {
            console.error('Failed to initialize The Garden:', error);
            alert('Failed to load The Garden. Please refresh the page.');
        }
    }

    seedGarden() {
        // Add a few initial elements to demonstrate the ecosystem
        const centerX = Math.floor(this.simulationEngine.grid.size / 2);
        const centerY = Math.floor(this.simulationEngine.grid.size / 2);

        // Plant an oak tree in the center
        this.simulationEngine.placeElement(
            Plant,
            ELEMENT_TYPES.OAK_TREE,
            centerX,
            centerY,
            'system'
        );

        // Add some grass around it
        const grassPositions = [
            [centerX - 2, centerY],
            [centerX + 2, centerY],
            [centerX, centerY - 2],
            [centerX, centerY + 2],
        ];

        for (const [x, y] of grassPositions) {
            this.simulationEngine.placeElement(
                Plant,
                ELEMENT_TYPES.GRASS_PATCH,
                x,
                y,
                'system'
            );
        }

        // Add a couple flowers
        this.simulationEngine.placeElement(
            Plant,
            ELEMENT_TYPES.WILDFLOWER,
            centerX - 1,
            centerY - 1,
            'system'
        );

        this.simulationEngine.placeElement(
            Plant,
            ELEMENT_TYPES.WILDFLOWER,
            centerX + 1,
            centerY + 1,
            'system'
        );

        // Add a rain cloud to water everything
        this.simulationEngine.placeElement(
            Environmental,
            ELEMENT_TYPES.RAIN_CLOUD,
            centerX,
            centerY - 1,
            'system'
        );

        console.log('Garden seeded with initial elements');
    }

    startRenderLoop() {
        const render = () => {
            this.renderer.render();
            this.animationFrameId = requestAnimationFrame(render);
        };

        render();
    }

    stopRenderLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    destroy() {
        // Cleanup
        this.stopRenderLoop();

        if (this.simulationEngine) {
            this.simulationEngine.stop();
        }

        console.log('The Garden destroyed');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new TheGarden();
    app.init();

    // Make app globally available for debugging
    window.theGarden = app;
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.theGarden && window.theGarden.simulationEngine) {
        window.theGarden.simulationEngine.saveState();
    }
});
