// Function to parse CSV data
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
    showError(`Failed to load books: ${error.message}`);
    return [];
  }
}

// Function to create book cards
function createBookCard(book) {
  console.log("Creating card for book:", book);
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

// Function to format category title
function formatCategoryTitle(category) {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Function to create category section
function createCategorySection(category, books) {
  const section = document.createElement("div");
  section.className = "category-section";
  section.id = `category-${category.toLowerCase().replace(/\s+/g, "-")}`;

  const categoryHeader = document.createElement("div");
  categoryHeader.className = "category-header";

  const categoryTitle = document.createElement("h2");
  categoryTitle.className = "category-title";
  categoryTitle.textContent = formatCategoryTitle(category);

  const bookCount = document.createElement("span");
  bookCount.className = "book-count";
  bookCount.textContent = `${books.length} ${
    books.length === 1 ? "Book" : "Books"
  }`;

  categoryHeader.appendChild(categoryTitle);
  categoryHeader.appendChild(bookCount);

  const booksGrid = document.createElement("div");
  booksGrid.className = "books-grid";

  books.forEach((book) => {
    const card = createBookCard(book);
    booksGrid.appendChild(card);
  });

  section.appendChild(categoryHeader);
  section.appendChild(booksGrid);

  return section;
}

// Function to show loading state
function showLoading() {
  const container = document.getElementById("booksContainer");
  if (!container) {
    console.error("booksContainer element not found!");
    return;
  }
  container.innerHTML = '<div class="loading">Loading books...</div>';
}

// Function to show error message
function showError(message) {
  const container = document.getElementById("booksContainer");
  if (!container) {
    console.error("booksContainer element not found!");
    return;
  }
  container.innerHTML = `<div class="error">${message}</div>`;
}

// Function to handle header scroll effect
function handleHeaderScroll() {
  const header = document.querySelector("header");
  const scrollPosition = window.scrollY;

  if (scrollPosition > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
}

// Load and display books
async function loadBooks() {
  console.log("Starting to load books...");
  showLoading();

  try {
    const books = await parseCSV("assets/data/DBGuidedQuill-Books.csv");
    const container = document.getElementById("booksContainer");

    if (!container) {
      throw new Error("booksContainer element not found!");
    }

    if (books.length === 0) {
      showError("No books found.");
      return;
    }

    // Group books by category
    const booksByCategory = books.reduce((acc, book) => {
      const category = book.CATEGORY || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(book);
      return acc;
    }, {});

    // Sort categories alphabetically
    const sortedCategories = Object.keys(booksByCategory);

    // Clear container and add category sections
    container.innerHTML = "";
    sortedCategories.forEach((category) => {
      const section = createCategorySection(
        category,
        booksByCategory[category]
      );
      container.appendChild(section);
    });
  } catch (error) {
    console.error("Error in loadBooks:", error);
    showError(`Failed to load books: ${error.message}`);
  }
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded - Initializing books...");
  loadBooks();

  // Add scroll event listener
  window.addEventListener("scroll", handleHeaderScroll);
});
