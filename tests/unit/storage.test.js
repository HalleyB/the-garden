// storage.test.js - Tests for Storage class

import { Storage } from '../../js/storage/Storage.js';
import { CONFIG } from '../../js/config.js';
import { Assert } from '../test-suite.js';

export const storageTests = {
    name: 'Storage Tests',
    tests: [
        {
            name: 'Storage initializes with user ID',
            fn: () => {
                const storage = new Storage();
                Assert.exists(storage.userId, 'Should have a user ID');
                Assert.isTrue(storage.userId.startsWith('user_'), 'User ID should start with user_');
            }
        },
        {
            name: 'getUserId creates and persists user ID',
            fn: () => {
                // Clear any existing ID
                localStorage.removeItem('garden_user_id');

                const storage1 = new Storage();
                const id1 = storage1.userId;

                const storage2 = new Storage();
                const id2 = storage2.userId;

                Assert.equals(id1, id2, 'User ID should be consistent across instances');
            }
        },
        {
            name: 'canPlaceToday returns true initially',
            fn: () => {
                localStorage.removeItem(CONFIG.STORAGE_KEYS.LAST_PLACEMENT);
                const storage = new Storage();

                Assert.isTrue(storage.canPlaceToday(), 'Should be able to place initially');
            }
        },
        {
            name: 'canPlaceToday returns false after placement',
            fn: () => {
                const storage = new Storage();
                storage.recordPlacement();

                Assert.isFalse(storage.canPlaceToday(), 'Should not be able to place immediately after');
            }
        },
        {
            name: 'getTimeUntilNextPlacement returns correct value',
            fn: () => {
                const storage = new Storage();
                storage.recordPlacement();

                const timeRemaining = storage.getTimeUntilNextPlacement();

                Assert.greaterThan(timeRemaining, 0, 'Time remaining should be positive');
                Assert.lessThan(timeRemaining, CONFIG.PLACEMENT_COOLDOWN + 1000, 'Time should be within cooldown period');
            }
        },
        {
            name: 'recordPlacement stores timestamp',
            fn: () => {
                const storage = new Storage();
                const beforeTime = Date.now();

                storage.recordPlacement();

                const storedTime = parseInt(localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_PLACEMENT));

                Assert.greaterThan(storedTime, beforeTime - 1000, 'Stored time should be recent');
            }
        },
        {
            name: 'getUserContributions returns empty array initially',
            fn: () => {
                localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_CONTRIBUTIONS);
                const storage = new Storage();

                const contributions = storage.getUserContributions();

                Assert.exists(contributions, 'Contributions should exist');
                Assert.equals(contributions.length, 0, 'Should have no contributions initially');
            }
        },
        {
            name: 'addContribution stores contribution',
            fn: () => {
                localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_CONTRIBUTIONS);
                const storage = new Storage();

                const mockElement = {
                    type: { id: 'OAK_TREE' },
                    id: 'test_123'
                };

                storage.addContribution(mockElement, 5, 7);

                const contributions = storage.getUserContributions();

                Assert.equals(contributions.length, 1, 'Should have 1 contribution');
                Assert.equals(contributions[0].elementType, 'OAK_TREE', 'Should store element type');
                Assert.equals(contributions[0].position.x, 5, 'Should store x position');
                Assert.equals(contributions[0].position.y, 7, 'Should store y position');
            }
        },
        {
            name: 'updateContributionStatus updates status',
            fn: () => {
                localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_CONTRIBUTIONS);
                const storage = new Storage();

                const mockElement = {
                    type: { id: 'OAK_TREE' },
                    id: 'test_123'
                };

                storage.addContribution(mockElement, 5, 7);
                storage.updateContributionStatus('test_123', 'dead');

                const contributions = storage.getUserContributions();

                Assert.equals(contributions[0].status, 'dead', 'Status should be updated');
            }
        },
        {
            name: 'formatTimeRemaining formats correctly',
            fn: () => {
                const storage = new Storage();

                const hours = storage.formatTimeRemaining(3600000 + 300000); // 1h 5m
                Assert.isTrue(hours.includes('h'), 'Should format hours');

                const minutes = storage.formatTimeRemaining(300000 + 30000); // 5m 30s
                Assert.isTrue(minutes.includes('m'), 'Should format minutes');

                const seconds = storage.formatTimeRemaining(45000); // 45s
                Assert.isTrue(seconds.includes('s'), 'Should format seconds');
            }
        }
    ]
};
