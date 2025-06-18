# GuidedQuill Test Suite

This directory contains comprehensive tests for the GuidedQuill website's JavaScript functionality.

## Test Coverage

The test suite covers the following areas:

### 1. CSV Parsing (`parseCSV`)
- ✅ Valid CSV parsing with proper headers and data
- ✅ Empty CSV handling
- ✅ Invalid CSV format handling
- ✅ Quoted fields with commas
- ✅ Network error handling
- ✅ HTTP error handling (404, 500, etc.)

### 2. Category Title Formatting (`formatCategoryTitle`)
- ✅ Converting snake_case to Title Case
- ✅ Handling single words
- ✅ Handling empty strings
- ✅ Mixed case input

### 3. Book Grouping (`groupBooksByCategory`)
- ✅ Grouping books by category
- ✅ Handling books without categories (defaults to "Uncategorized")
- ✅ Handling empty category strings
- ✅ Multiple books in same category

### 4. Book Card Creation (`createBookCard`)
- ✅ Creating cards with complete book data
- ✅ Handling missing book titles (shows "Untitled Book")
- ✅ Handling missing descriptions (shows "No description available")
- ✅ Proper CSS class assignment
- ✅ Image error handling

## Running Tests

### Prerequisites
- Node.js (version 14 or higher)
- No additional dependencies required

### Run All Tests
```bash
npm test
```

### Run Tests Directly
```bash
node tests/books.test.js
```

## Test Structure

The test suite uses a custom `TestSuite` class that provides:
- Clear pass/fail reporting
- Detailed error messages
- Test count tracking
- Async test support

## Mock Environment

The tests include a complete mock environment for:
- `document` object (DOM manipulation)
- `window` object (browser APIs)
- `fetch` API (HTTP requests)

This allows testing without a browser environment.

## Adding New Tests

To add a new test:

```javascript
testSuite.test("Test Name", async () => {
  // Test logic here
  if (condition !== expected) {
    throw new Error("Test failed message");
  }
});
```

## Test Output Example

```
🧪 Running test suite...

✅ PASS: CSV Parsing - Valid CSV
✅ PASS: CSV Parsing - Empty CSV
✅ PASS: CSV Parsing - Invalid CSV
✅ PASS: Category Title Formatting
✅ PASS: Book Grouping by Category
✅ PASS: Book Card Creation
✅ PASS: Book Card Creation - Missing Data
✅ PASS: CSV Parsing - Quoted Fields
✅ PASS: Error Handling - Network Error
✅ PASS: Error Handling - HTTP Error

📊 Test Results: 10 passed, 0 failed

🎉 Test suite completed!
```

## Continuous Integration

These tests can be easily integrated into CI/CD pipelines:
- GitHub Actions
- GitLab CI
- Jenkins
- Any Node.js-compatible CI system

## Future Enhancements

Potential improvements for the test suite:
- [ ] Add performance tests
- [ ] Add visual regression tests
- [ ] Add accessibility tests
- [ ] Add cross-browser compatibility tests
- [ ] Add integration tests with real CSV files 