// Test file for books.js functionality
// Run with: node tests/books.test.js

// Mock DOM environment for testing
global.document = {
  getElementById: (id) => {
    if (id === 'booksContainer') {
      return {
        innerHTML: '',
        appendChild: () => {},
        insertBefore: () => {}
      };
    }
    return null;
  },
  createElement: (tag) => {
    return {
      className: '',
      innerHTML: '',
      onclick: null,
      onerror: null,
      src: '',
      alt: '',
      appendChild: () => {},
      insertBefore: () => {},
      firstChild: null
    };
  },
  querySelector: () => ({
    classList: {
      add: () => {},
      remove: () => {}
    }
  })
};

global.window = {
  scrollY: 0,
  pageYOffset: 0,
  open: () => {},
  scrollTo: () => {},
  addEventListener: () => {}
};

// Mock fetch for testing
global.fetch = async (url) => {
  if (url === 'assets/data/DBGuidedQuill-Books.csv') {
    return {
      ok: true,
      text: async () => `TITLE,DESCRIPTION,CATEGORY,COVER_LINK,AMAZON_LINK
"Stories of 25 Prophets In Islam","Inspiring Tales For Children To Learn About Islam",Stories from Islam,https://m.media-amazon.com/images/I/712OyeUAaWL._SL1499_.jpg,https://books2read.com/u/mde7XW
"30 Stories From The Quran","Morals and Reflections in Every Chapter to Help Children Learn About Islam",Stories from Islam,https://m.media-amazon.com/images/I/71WXvABReOL._SL1499_.jpg,https://books2read.com/u/brLP0Y
"Zainab's First Ramadan","Introducing Fasting to kids,For Ages 4 to 10",For Ages 4 to 10,https://m.media-amazon.com/images/I/61OtN6YMsKL._SL1000_.jpg,https://books2read.com/u/mdej1E`
    };
  }
  throw new Error('File not found');
};

// Import the functions to test (we'll need to modify books.js to export them)
// For now, let's create test versions of the functions

// Test CSV parsing function
async function parseCSV(filePath) {
  try {
    console.log("Attempting to fetch CSV from:", filePath);
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    console.log("CSV content received:", csvText);

    const lines = csvText.split("\n").filter((line) => line.trim() !== "");
    console.log("Number of lines in CSV:", lines.length);

    if (lines.length < 2) {
      throw new Error("CSV file is empty or has no data rows");
    }

    const headers = lines[0].split(",").map((header) => header.trim());
    console.log("CSV Headers:", headers);

    const books = lines.slice(1).map((line, index) => {
      const values = line.split(",").map((value) => value.trim());
      
      const book = headers.reduce((obj, header, i) => {
        obj[header] = values[i] || "";
        return obj;
      }, {});
      console.log(`Parsed book ${index + 1}:`, book);
      return book;
    });

    console.log("Total books parsed:", books.length);
    return books;
  } catch (error) {
    console.error("Error parsing CSV:", error);
    return [];
  }
}

// Test category formatting function
function formatCategoryTitle(category) {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Test book grouping function
function groupBooksByCategory(books) {
  return books.reduce((acc, book) => {
    const category = book.CATEGORY || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(book);
    return acc;
  }, {});
}

// Test book card creation function
function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "book-card";

  card.onclick = () => {
    if (book.AMAZON_LINK) {
      window.open(book.AMAZON_LINK, "_blank");
    } else {
      console.error("Amazon link not found for book:", book.TITLE);
    }
  };

  const img = document.createElement("img");
  img.src = book.COVER_LINK;
  img.alt = book.TITLE;
  img.className = "book-image";
  img.onerror = () => {
    console.error("Failed to load image for book:", book.TITLE);
    img.src = "assets/images/placeholder-book.jpg";
    img.alt = "Book cover not available";
  };

  card.innerHTML = `
        <div class="book-info">
            <h2 class="book-title">${book.TITLE || "Untitled Book"}</h2>
            <p class="book-description">${
              book.DESCRIPTION || "No description available"
            }</p>
        </div>
    `;

  card.insertBefore(img, card.firstChild);
  return card;
}

// Test suite
class TestSuite {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, testFunction) {
    this.tests.push({ name, testFunction });
  }

  async run() {
    console.log("🧪 Running test suite...\n");
    
    for (const test of this.tests) {
      try {
        await test.testFunction();
        console.log(`✅ PASS: ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ FAIL: ${test.name}`);
        console.log(`   Error: ${error.message}`);
        this.failed++;
      }
    }
    
    console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
  }
}

// Create test suite
const testSuite = new TestSuite();

// Test 1: CSV Parsing - Valid CSV
testSuite.test("CSV Parsing - Valid CSV", async () => {
  const books = await parseCSV("assets/data/DBGuidedQuill-Books.csv");
  
  if (books.length !== 3) {
    throw new Error(`Expected 3 books, got ${books.length}`);
  }
  
  const firstBook = books[0];
  if (firstBook.TITLE !== '"Stories of 25 Prophets In Islam"') {
    throw new Error(`Expected title ""Stories of 25 Prophets In Islam"", got "${firstBook.TITLE}"`);
  }
  
  if (firstBook.CATEGORY !== "Stories from Islam") {
    throw new Error(`Expected category "Stories from Islam", got "${firstBook.CATEGORY}"`);
  }
});

// Test 2: CSV Parsing - Empty CSV
testSuite.test("CSV Parsing - Empty CSV", async () => {
  // Mock fetch for empty CSV
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    text: async () => "TITLE,DESCRIPTION,CATEGORY,COVER_LINK,AMAZON_LINK"
  });
  
  const books = await parseCSV("empty.csv");
  
  if (books.length !== 0) {
    throw new Error(`Expected 0 books for empty CSV, got ${books.length}`);
  }
  
  global.fetch = originalFetch;
});

// Test 3: CSV Parsing - Invalid CSV
testSuite.test("CSV Parsing - Invalid CSV", async () => {
  // Mock fetch for invalid CSV
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    text: async () => "invalid,csv,format"
  });
  
  const books = await parseCSV("invalid.csv");
  
  if (books.length !== 0) {
    throw new Error(`Expected 0 books for invalid CSV, got ${books.length}`);
  }
  
  global.fetch = originalFetch;
});

// Test 4: Category Title Formatting
testSuite.test("Category Title Formatting", () => {
  const testCases = [
    { input: "stories_from_islam", expected: "Stories From Islam" },
    { input: "daily_practice_worship", expected: "Daily Practice Worship" },
    { input: "for_ages_4_to_10", expected: "For Ages 4 To 10" },
    { input: "SINGLE_WORD", expected: "Single Word" },
    { input: "", expected: "" }
  ];
  
  testCases.forEach(({ input, expected }) => {
    const result = formatCategoryTitle(input);
    if (result !== expected) {
      throw new Error(`Expected "${expected}" for input "${input}", got "${result}"`);
    }
  });
});

// Test 5: Book Grouping by Category
testSuite.test("Book Grouping by Category", () => {
  const testBooks = [
    { TITLE: "Book 1", CATEGORY: "Stories from Islam" },
    { TITLE: "Book 2", CATEGORY: "Stories from Islam" },
    { TITLE: "Book 3", CATEGORY: "Daily Practice & Worship" },
    { TITLE: "Book 4", CATEGORY: "" }, // Should be "Uncategorized"
    { TITLE: "Book 5" } // Should be "Uncategorized"
  ];
  
  const grouped = groupBooksByCategory(testBooks);
  
  if (grouped["Stories from Islam"].length !== 2) {
    throw new Error(`Expected 2 books in "Stories from Islam", got ${grouped["Stories from Islam"].length}`);
  }
  
  if (grouped["Daily Practice & Worship"].length !== 1) {
    throw new Error(`Expected 1 book in "Daily Practice & Worship", got ${grouped["Daily Practice & Worship"].length}`);
  }
  
  if (grouped["Uncategorized"].length !== 2) {
    throw new Error(`Expected 2 books in "Uncategorized", got ${grouped["Uncategorized"].length}`);
  }
});

// Test 6: Book Card Creation
testSuite.test("Book Card Creation", () => {
  const testBook = {
    TITLE: "Test Book",
    DESCRIPTION: "Test Description",
    CATEGORY: "Test Category",
    COVER_LINK: "https://example.com/image.jpg",
    AMAZON_LINK: "https://example.com/book"
  };
  
  const card = createBookCard(testBook);
  
  if (card.className !== "book-card") {
    throw new Error(`Expected class "book-card", got "${card.className}"`);
  }
  
  if (!card.innerHTML.includes("Test Book")) {
    throw new Error("Card should contain book title");
  }
  
  if (!card.innerHTML.includes("Test Description")) {
    throw new Error("Card should contain book description");
  }
});

// Test 7: Book Card Creation - Missing Data
testSuite.test("Book Card Creation - Missing Data", () => {
  const testBook = {
    TITLE: "",
    DESCRIPTION: "",
    CATEGORY: "Test Category"
    // Missing COVER_LINK and AMAZON_LINK
  };
  
  const card = createBookCard(testBook);
  
  if (!card.innerHTML.includes("Untitled Book")) {
    throw new Error("Card should show 'Untitled Book' for missing title");
  }
  
  if (!card.innerHTML.includes("No description available")) {
    throw new Error("Card should show 'No description available' for missing description");
  }
});

// Test 8: CSV Parsing - Simple Fields (No Quotes)
testSuite.test("CSV Parsing - Simple Fields", async () => {
  // Mock fetch for CSV with simple fields (no quotes)
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    text: async () => `TITLE,DESCRIPTION,CATEGORY,COVER_LINK,AMAZON_LINK
Simple Book,Simple Description,Test Category,https://example.com/image.jpg,https://example.com/book`
  });
  
  const books = await parseCSV("simple.csv");
  
  if (books.length !== 1) {
    throw new Error(`Expected 1 book, got ${books.length}`);
  }
  
  const book = books[0];
  if (book.TITLE !== "Simple Book") {
    throw new Error(`Expected title "Simple Book", got "${book.TITLE}"`);
  }
  
  if (book.DESCRIPTION !== "Simple Description") {
    throw new Error(`Expected description "Simple Description", got "${book.DESCRIPTION}"`);
  }
  
  global.fetch = originalFetch;
});

// Test 9: Error Handling - Network Error
testSuite.test("Error Handling - Network Error", async () => {
  // Mock fetch to simulate network error
  const originalFetch = global.fetch;
  global.fetch = async () => {
    throw new Error("Network error");
  };
  
  const books = await parseCSV("network-error.csv");
  
  if (books.length !== 0) {
    throw new Error(`Expected 0 books for network error, got ${books.length}`);
  }
  
  global.fetch = originalFetch;
});

// Test 10: Error Handling - HTTP Error
testSuite.test("Error Handling - HTTP Error", async () => {
  // Mock fetch to simulate HTTP error
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: false,
    status: 404
  });
  
  const books = await parseCSV("not-found.csv");
  
  if (books.length !== 0) {
    throw new Error(`Expected 0 books for HTTP error, got ${books.length}`);
  }
  
  global.fetch = originalFetch;
});

// Run all tests
testSuite.run().then(() => {
  console.log("\n🎉 Test suite completed!");
}).catch(error => {
  console.error("Test suite failed:", error);
}); 