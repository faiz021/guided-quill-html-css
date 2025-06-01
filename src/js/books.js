// Function to parse CSV data
async function parseCSV(filePath) {
    try {
        console.log('Attempting to fetch CSV from:', filePath);
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        console.log('CSV content received:', csvText);

        // Split by newline and remove empty lines
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        console.log('Number of lines in CSV:', lines.length);

        if (lines.length < 2) {
            throw new Error('CSV file is empty or has no data rows');
        }

        // Parse headers
        const headers = lines[0].split(',').map(header => header.trim());
        console.log('CSV Headers:', headers);

        // Parse data rows
        const books = lines.slice(1).map((line, index) => {
            const values = line.split(',').map(value => value.trim());
            const book = headers.reduce((obj, header, i) => {
                obj[header] = values[i] || '';
                return obj;
            }, {});
            console.log(`Parsed book ${index + 1}:`, book);
            return book;
        });

        console.log('Total books parsed:', books.length);
        return books;
    } catch (error) {
        console.error('Error parsing CSV:', error);
        showError(`Failed to load books: ${error.message}`);
        return [];
    }
}

// Function to create book cards
function createBookCard(book) {
    console.log('Creating card for book:', book);
    const card = document.createElement('div');
    card.className = 'book-card';
    
    // Add click handler with error handling
    card.onclick = () => {
        if (book.AMAZON_LINK) {
            window.open(book.AMAZON_LINK, '_blank');
        } else {
            console.error('Amazon link not found for book:', book.TITLE);
        }
    };

    // Create image with error handling
    const img = document.createElement('img');
    img.src = book.COVER_LINK;
    img.alt = book.TITLE;
    img.className = 'book-image';
    img.onerror = () => {
        console.error('Failed to load image for book:', book.TITLE);
        img.src = 'assets/images/placeholder-book.jpg';
        img.alt = 'Book cover not available';
    };

    card.innerHTML = `
        <div class="book-info">
            <h2 class="book-title">${book.TITLE || 'Untitled Book'}</h2>
            <p class="book-description">${book.DESCRIPTION || 'No description available'}</p>
        </div>
    `;

    // Insert image at the beginning
    card.insertBefore(img, card.firstChild);

    return card;
}

// Function to show loading state
function showLoading() {
    const container = document.getElementById('booksContainer');
    if (!container) {
        console.error('booksContainer element not found!');
        return;
    }
    container.innerHTML = '<div class="loading">Loading books...</div>';
}

// Function to show error message
function showError(message) {
    const container = document.getElementById('booksContainer');
    if (!container) {
        console.error('booksContainer element not found!');
        return;
    }
    container.innerHTML = `<div class="error">${message}</div>`;
}

// Load and display books
async function loadBooks() {
    console.log('Starting to load books...');
    showLoading();
    
    try {
        const books = await parseCSV('assets/data/DBGuidedQuill-Books.csv');
        const container = document.getElementById('booksContainer');
        
        if (!container) {
            throw new Error('booksContainer element not found!');
        }
        
        if (books.length === 0) {
            showError('No books found.');
            return;
        }
        
        console.log('Rendering books:', books);
        container.innerHTML = ''; // Clear loading state
        books.forEach(book => {
            const card = createBookCard(book);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error in loadBooks:', error);
        showError(`Failed to load books: ${error.message}`);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing books...');
    loadBooks();
}); 