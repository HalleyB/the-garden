// Element.js - Base class for all garden elements

import { CONFIG } from '../config.js';

export class Element {
    constructor(type, placedBy = 'unknown') {
        this.type = type;
        this.id = this.generateId();
        this.placedBy = placedBy;
        this.placedAt = Date.now();
        this.age = 0; // in cycles
        this.isAlive = true;
        this.health = 100;
        this.tile = null;

        // Growth tracking
        this.growthProgress = 0;
        this.currentStage = 0;
    }

    // Generate unique ID
    generateId() {
        return `${this.type.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Update element for one simulation cycle
    update(grid, season) {
        if (!this.isAlive) return;

        this.age++;

        // Check if element has expired (environmental elements)
        if (this.type.duration && this.age >= this.type.duration) {
            this.die();
            return;
        }

        // Check maximum age
        if (this.type.maxAge && this.age >= this.type.maxAge) {
            this.die();
            return;
        }
    }

    // Die
    die() {
        this.isAlive = false;
        this.health = 0;
    }

    // Get visual representation
    getIcon() {
        return this.type.icon;
    }

    // Get color for rendering
    getColor() {
        if (!this.isAlive) {
            return CONFIG.COLORS.DEAD;
        }
        return this.type.color;
    }

    // Get age in days
    getAgeDays() {
        return Math.floor(this.age / CONFIG.CYCLES_PER_DAY);
    }

    // Get description with status
    getDescription() {
        if (!this.isAlive) {
            return `${this.type.name} (Dead, ${this.getAgeDays()} days old)`;
        }
        return `${this.type.name} (${this.getAgeDays()} days old, ${Math.round(this.health)}% health)`;
    }

    // Serialize to JSON
    toJSON() {
        return {
            typeId: this.type.id,
            id: this.id,
            placedBy: this.placedBy,
            placedAt: this.placedAt,
            age: this.age,
            isAlive: this.isAlive,
            health: this.health,
            growthProgress: this.growthProgress,
            currentStage: this.currentStage
        };
    }

    // Deserialize from JSON
    // Note: This is a simplified version - full deserialization handled by SimulationEngine
    static fromJSON(data, elementTypes) {
        const type = elementTypes[data.typeId];
        if (!type) return null;

        // Create basic element (will be properly constructed by SimulationEngine)
        const element = new Element(type, data.placedBy);

        element.id = data.id;
        element.placedAt = data.placedAt;
        element.age = data.age;
        element.isAlive = data.isAlive;
        element.health = data.health;
        element.growthProgress = data.growthProgress || 0;
        element.currentStage = data.currentStage || 0;

        return element;
    }
}
