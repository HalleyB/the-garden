

# The Garden - Test Suite

Comprehensive automated test suite for The Garden project.

## Running Tests

1. Start the development server:
   ```bash
   npm start
   ```

2. Open the test runner in your browser:
   ```
   http://localhost:8000/tests/test-runner.html
   ```

3. Click "Run All Tests" to execute the full test suite

## Test Coverage

### Unit Tests

- **Configuration Tests** - Validates CONFIG, ELEMENT_TYPES, and utility functions
- **Grid Tests** - Tests grid initialization, tile management, and serialization
- **Tile Tests** - Tests tile properties, entity placement, and persistence
- **Element Tests** - Tests plant and environmental element behavior
- **Simulation Tests** - Tests simulation engine, cycles, and state management
- **Storage Tests** - Tests user tracking, placement limits, and contributions

### Integration Tests

- **Placement Tests** - End-to-end element placement workflows
- **Persistence Tests** - State saving and loading across sessions
- **Ecosystem Tests** - Multi-cycle ecosystem simulation and interactions

## Test Results

The test runner provides:
- Real-time test execution progress
- Pass/fail status for each test
- Detailed error messages for failures
- Summary statistics (total, passed, failed, duration)
- Visual progress bar

## Writing New Tests

Add new test suites to `test-suite.js`:

```javascript
export const myTests = {
    name: 'My Test Suite',
    tests: [
        {
            name: 'Test description',
            fn: () => {
                // Test code
                Assert.equals(actual, expected);
            }
        }
    ]
};
```

### Available Assertions

- `Assert.isTrue(condition, message)`
- `Assert.isFalse(condition, message)`
- `Assert.equals(actual, expected, message)`
- `Assert.notEquals(actual, expected, message)`
- `Assert.exists(value, message)`
- `Assert.isNull(value, message)`
- `Assert.arrayEquals(actual, expected, message)`
- `Assert.throws(fn, message)`
- `Assert.throwsAsync(fn, message)`
- `Assert.greaterThan(actual, expected, message)`
- `Assert.lessThan(actual, expected, message)`
- `Assert.inRange(value, min, max, message)`

## Debugging Failed Tests

1. Check the browser console (F12) for detailed error stack traces
2. Failed tests show error messages directly in the test runner
3. Add `console.log()` statements to your test functions
4. Use browser debugger with breakpoints in test code

## Test Isolation

Each test should:
- Be independent and not rely on other tests
- Clean up any state it creates
- Not modify global state unless necessary
- Use localStorage carefully (clear when needed)

## Continuous Testing

Tests are run manually through the web interface. For automated CI/CD:
- Consider using Puppeteer or Playwright for headless testing
- Run tests in multiple browsers
- Generate coverage reports
