// Storage.js - LocalStorage management and IP-based tracking

import { CONFIG } from '../config.js';

export class Storage {
    constructor() {
        this.userId = this.getUserId();
    }

    // Get or create user ID (simulates IP-based tracking)
    getUserId() {
        let userId = localStorage.getItem('garden_user_id');

        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('garden_user_id', userId);
        }

        return userId;
    }

    // Check if user can place an element today
    canPlaceToday() {
        const lastPlacement = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_PLACEMENT);

        if (!lastPlacement) {
            return true;
        }

        const timeSince = Date.now() - parseInt(lastPlacement);
        return timeSince >= CONFIG.PLACEMENT_COOLDOWN;
    }

    // Get time until next placement
    getTimeUntilNextPlacement() {
        const lastPlacement = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_PLACEMENT);

        if (!lastPlacement) {
            return 0;
        }

        const timeSince = Date.now() - parseInt(lastPlacement);
        const remaining = CONFIG.PLACEMENT_COOLDOWN - timeSince;

        return Math.max(0, remaining);
    }

    // Record a placement
    recordPlacement() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_PLACEMENT, Date.now().toString());
    }

    // Get user contributions from localStorage
    getUserContributions() {
        const contributionsStr = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_CONTRIBUTIONS);

        if (!contributionsStr) {
            return [];
        }

        try {
            return JSON.parse(contributionsStr);
        } catch (error) {
            console.error('Failed to parse contributions:', error);
            return [];
        }
    }

    // Add a contribution
    addContribution(element, x, y) {
        const contributions = this.getUserContributions();

        contributions.push({
            elementType: element.type.id,
            elementId: element.id,
            position: { x, y },
            timestamp: Date.now(),
            status: 'alive'
        });

        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_CONTRIBUTIONS, JSON.stringify(contributions));
    }

    // Update contribution status
    updateContributionStatus(elementId, status) {
        const contributions = this.getUserContributions();
        const contribution = contributions.find(c => c.elementId === elementId);

        if (contribution) {
            contribution.status = status;
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER_CONTRIBUTIONS, JSON.stringify(contributions));
        }
    }

    // Format time remaining
    formatTimeRemaining(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            const m = minutes % 60;
            return `${hours}h ${m}m`;
        } else if (minutes > 0) {
            const s = seconds % 60;
            return `${minutes}m ${s}s`;
        } else {
            return `${seconds}s`;
        }
    }
}
