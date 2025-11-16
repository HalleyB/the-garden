// test-suite.js - Main test orchestrator

import { configTests } from './unit/config.test.js';
import { gridTests } from './unit/grid.test.js';
import { tileTests } from './unit/tile.test.js';
import { elementTests } from './unit/element.test.js';
import { simulationTests } from './unit/simulation.test.js';
import { storageTests } from './unit/storage.test.js';
import { placementTests } from './integration/placement.test.js';
import { persistenceTests } from './integration/persistence.test.js';
import { ecosystemTests } from './integration/ecosystem.test.js';

// Test utilities
export class TestRunner {
    constructor() {
        this.suites = [];
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            suites: []
        };
    }

    addSuite(suite) {
        this.suites.push(suite);
    }

    async runAll() {
        const container = document.getElementById('test-suites');
        container.innerHTML = '';

        for (const suite of this.suites) {
            const suiteResult = await this.runSuite(suite);
            this.results.suites.push(suiteResult);
            this.results.total += suiteResult.total;
            this.results.passed += suiteResult.passed;
            this.results.failed += suiteResult.failed;
        }

        return this.results;
    }

    async runSuite(suite) {
        const suiteDiv = this.createSuiteElement(suite);
        document.getElementById('test-suites').appendChild(suiteDiv);

        const result = {
            name: suite.name,
            total: suite.tests.length,
            passed: 0,
            failed: 0,
            tests: []
        };

        for (const test of suite.tests) {
            const testResult = await this.runTest(test, suiteDiv);
            result.tests.push(testResult);

            if (testResult.passed) {
                result.passed++;
            } else {
                result.failed++;
            }
        }

        this.updateSuiteHeader(suiteDiv, result);
        return result;
    }

    async runTest(test, suiteDiv) {
        const testDiv = this.createTestElement(test);
        suiteDiv.querySelector('.suite-tests').appendChild(testDiv);

        const statusEl = testDiv.querySelector('.test-status');
        statusEl.className = 'test-status status-running';
        statusEl.textContent = 'Running...';

        try {
            await test.fn();

            statusEl.className = 'test-status status-passed';
            statusEl.textContent = '✓ Passed';

            return {
                name: test.name,
                passed: true,
                error: null
            };
        } catch (error) {
            statusEl.className = 'test-status status-failed';
            statusEl.textContent = '✗ Failed';

            const errorDiv = document.createElement('div');
            errorDiv.className = 'test-error';
            errorDiv.textContent = error.message || error.toString();
            testDiv.appendChild(errorDiv);

            console.error(`Test failed: ${test.name}`, error);

            return {
                name: test.name,
                passed: false,
                error: error.message || error.toString()
            };
        }
    }

    createSuiteElement(suite) {
        const div = document.createElement('div');
        div.className = 'test-suite';
        div.innerHTML = `
            <div class="suite-header">
                <h3>${suite.name}</h3>
                <span class="suite-stats"></span>
            </div>
            <div class="suite-tests"></div>
        `;
        return div;
    }

    createTestElement(test) {
        const div = document.createElement('div');
        div.className = 'test-case';
        div.innerHTML = `
            <span class="test-name">${test.name}</span>
            <span class="test-status status-pending">Pending</span>
        `;
        return div;
    }

    updateSuiteHeader(suiteDiv, result) {
        const statsEl = suiteDiv.querySelector('.suite-stats');
        statsEl.textContent = `${result.passed}/${result.total} passed`;
    }
}

// Assertion utilities
export class Assert {
    static isTrue(condition, message = 'Expected condition to be true') {
        if (!condition) {
            throw new Error(message);
        }
    }

    static isFalse(condition, message = 'Expected condition to be false') {
        if (condition) {
            throw new Error(message);
        }
    }

    static equals(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected} but got ${actual}`);
        }
    }

    static notEquals(actual, expected, message) {
        if (actual === expected) {
            throw new Error(message || `Expected values to not equal ${expected}`);
        }
    }

    static exists(value, message = 'Expected value to exist') {
        if (value === null || value === undefined) {
            throw new Error(message);
        }
    }

    static isNull(value, message = 'Expected value to be null') {
        if (value !== null) {
            throw new Error(message);
        }
    }

    static arrayEquals(actual, expected, message) {
        if (!Array.isArray(actual) || !Array.isArray(expected)) {
            throw new Error('Both values must be arrays');
        }
        if (actual.length !== expected.length) {
            throw new Error(message || `Expected array length ${expected.length} but got ${actual.length}`);
        }
        for (let i = 0; i < actual.length; i++) {
            if (actual[i] !== expected[i]) {
                throw new Error(message || `Arrays differ at index ${i}: expected ${expected[i]} but got ${actual[i]}`);
            }
        }
    }

    static throws(fn, message = 'Expected function to throw') {
        let didThrow = false;
        try {
            fn();
        } catch (e) {
            didThrow = true;
        }
        if (!didThrow) {
            throw new Error(message);
        }
    }

    static async throwsAsync(fn, message = 'Expected async function to throw') {
        let didThrow = false;
        try {
            await fn();
        } catch (e) {
            didThrow = true;
        }
        if (!didThrow) {
            throw new Error(message);
        }
    }

    static greaterThan(actual, expected, message) {
        if (actual <= expected) {
            throw new Error(message || `Expected ${actual} to be greater than ${expected}`);
        }
    }

    static lessThan(actual, expected, message) {
        if (actual >= expected) {
            throw new Error(message || `Expected ${actual} to be less than ${expected}`);
        }
    }

    static inRange(value, min, max, message) {
        if (value < min || value > max) {
            throw new Error(message || `Expected ${value} to be between ${min} and ${max}`);
        }
    }
}

// Export main test runner function
export async function runTests() {
    const runner = new TestRunner();

    // Add all test suites
    runner.addSuite(configTests);
    runner.addSuite(gridTests);
    runner.addSuite(tileTests);
    runner.addSuite(elementTests);
    runner.addSuite(simulationTests);
    runner.addSuite(storageTests);
    runner.addSuite(placementTests);
    runner.addSuite(persistenceTests);
    runner.addSuite(ecosystemTests);

    // Run all tests
    const results = await runner.runAll();

    return results;
}
