document.addEventListener('DOMContentLoaded', function() {
    // Sample book data
    const sampleBooks = [
        {
            id: 1,
            title: "Player's Handbook",
            author: "Wizards of the Coast",
            category: "core",
            description: "The essential rulebook for players. Contains character creation rules, spells, equipment, and more.",
            coverUrl: "https://static.wikia.nocookie.net/dungeonsdragons/images/2/27/PHB5e.jpg",
            pdfUrl: "https://online.anyflip.com/afgs/xkls/index.html"
        },
        {
            id: 2,
            title: "Dungeon Master's Guide",
            author: "Wizards of the Coast",
            category: "core",
            description: "A guide for Dungeon Masters with rules for creating adventures, worlds, and running games.",
            coverUrl: "https://static.wikia.nocookie.net/dungeonsdragons/images/7/78/DMG5e.jpg",
            pdfUrl: "https://online.anyflip.com/yyxst/fsfd/mobile/index.html"
        },
        {
            id: 3,
            title: "Monster Manual",
            author: "Wizards of the Coast",
            category: "core",
            description: "A bestiary of creatures for D&D, including statistics, lore, and illustrations.",
            coverUrl: "https://static.wikia.nocookie.net/dungeonsdragons/images/b/b5/MM5e.jpg",
            pdfUrl: "https://online.anyflip.com/ivdl/igol/index.html"
        },
        {
            id: 4,
            title: "Curse of Strahd",
            author: "Wizards of the Coast",
            category: "adventure",
            description: "A gothic horror adventure set in the demiplane of Barovia, ruled by the vampire Count Strahd von Zarovich.",
            coverUrl: "https://static.wikia.nocookie.net/dungeonsdragons/images/9/9f/COS.jpg",
            pdfUrl: "https://online.anyflip.com/afgs/lazb/mobile/index.html#p=1"
        },
        {
            id: 5,
            title: "Homebrew Campaign Setting",
            author: "Your Name",
            category: "homebrew",
            description: "A custom campaign setting with unique locations, factions, and adventure hooks.",
            coverUrl: "Set as cover for homebrew",
            pdfUrl: "Set as pdf for homebrew"
        }
    ];

    // Load books from localStorage or use sample data
    let books = JSON.parse(localStorage.getItem('dnd-books')) || sampleBooks;
    
    // Current filter and search state
    let currentFilter = 'all';
    let searchTerm = '';
    
    // Function to render all books with filters
    function renderBooks() {
        const container = document.getElementById('books-container');
        container.innerHTML = '';
        
        // Filter books
        let filteredBooks = books;
        
        if (currentFilter !== 'all') {
            filteredBooks = filteredBooks.filter(book => book.category === currentFilter);
        }
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredBooks = filteredBooks.filter(book => 
                book.title.toLowerCase().includes(term) || 
                book.author.toLowerCase().includes(term) ||
                book.description.toLowerCase().includes(term)
            );
        }
        
        // Show message if no books match filters
        if (filteredBooks.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <p>No books found matching your criteria.</p>
                <button id="reset-filters-btn">Reset Filters</button>
            `;
            container.appendChild(noResults);
            
            document.getElementById('reset-filters-btn').addEventListener('click', resetFilters);
            return;
        }

        // Render filtered books
        filteredBooks.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            
            // Default cover for books without a cover image
            const coverUrl = book.coverUrl || 'img/default-book-cover.jpg';
            
            // Category label
            let categoryLabel = 'Unknown';
            switch(book.category) {
                case 'core':
                    categoryLabel = 'Core Rulebook';
                    break;
                case 'adventure':
                    categoryLabel = 'Adventure';
                    break;
                case 'setting':
                    categoryLabel = 'Setting';
                    break;
                case 'supplement':
                    categoryLabel = 'Supplement';
                    break;
                case 'homebrew':
                    categoryLabel = 'Homebrew';
                    break;
            }
            
            bookCard.innerHTML = `
                <div class="book-cover" style="background-image: url('${coverUrl}')">
                    <div class="book-category">${categoryLabel}</div>
                </div>
                <div class="book-info">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">${book.author}</p>
                    <p class="book-description">${book.description}</p>
                    <div class="book-actions">
                        <button class="view-btn" data-id="${book.id}">View PDF</button>
                        <button class="download-btn" data-id="${book.id}">Download</button>
                    </div>
                </div>
            `;
            
            container.appendChild(bookCard);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', viewBook);
        });
        
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', downloadBook);
        });
    }
    
    // Function to reset filters
    function resetFilters() {
        document.getElementById('category-filter').value = 'all';
        document.getElementById('book-search').value = '';
        currentFilter = 'all';
        searchTerm = '';
        renderBooks();
    }
    
    // Function to apply category filter
    function applyCategoryFilter() {
        currentFilter = document.getElementById('category-filter').value;
        renderBooks();
    }
    
    // Function to apply search filter
    function applySearchFilter() {
        searchTerm = document.getElementById('book-search').value.trim();
        renderBooks();
    }
    
    // Function to view a book
    function viewBook(e) {
        const bookId = parseInt(e.target.dataset.id);
        const book = books.find(b => b.id === bookId);
        
        if (!book || !book.pdfUrl) {
            alert('PDF not available for this book.');
            return;
        }
        
        // Set the PDF viewer modal content
        document.getElementById('pdf-title').textContent = book.title;
        document.getElementById('pdf-iframe').src = book.pdfUrl;
        
        // Store the current book ID for download button
        document.getElementById('download-pdf-btn').dataset.id = bookId;
        
        // Show the PDF viewer modal
        document.getElementById('pdf-viewer-modal').style.display = 'block';
    }
    
    // Function to download a book
    function downloadBook(e) {
        const bookId = parseInt(e.target.dataset.id);
        const book = books.find(b => b.id === bookId);
        
        if (!book || !book.pdfUrl) {
            alert('PDF not available for this book.');
            return;
        }
        
        // Create a temporary link element to trigger the download
        const link = document.createElement('a');
        link.href = book.pdfUrl;
        link.download = `${book.title.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Function to upload a new book
    function uploadBook(e) {
        e.preventDefault();
        
        // Get form values
        const title = document.getElementById('book-title').value;
        const author = document.getElementById('book-author').value;
        const category = document.getElementById('book-category').value;
        const description = document.getElementById('book-description').value;
        const coverUrl = document.getElementById('book-cover').value;
        
        // Get PDF URL (either from file upload or external URL)
        let pdfUrl = document.getElementById('book-url').value;
        
        // If a file was uploaded, we would normally upload it to a server
        // and get a URL back. For this demo, we'll just use a placeholder.
        const fileInput = document.getElementById('book-file');
        if (fileInput.files.length > 0 && !pdfUrl) {
            // In a real app, we would upload the file and get a URL
            // For now, we'll just use a placeholder
            pdfUrl = `https://example.com/${fileInput.files[0].name}`;
        }
        
        // Validate required fields
        if (!title || !author || !category || !pdfUrl) {
            alert('Please fill in all required fields and provide either a PDF file or URL.');
            return;
        }
        
        // Create new book object
        const newBook = {
            id: Date.now(), // Use timestamp as a simple unique ID
            title,
            author,
            category,
            description,
            coverUrl,
            pdfUrl
        };
        
        // Add to books array
        books.push(newBook);
        
        // Save to localStorage
        saveBooks();
        
        // Reset form and close modal
        document.getElementById('upload-book-form').reset();
        document.getElementById('upload-modal').style.display = 'none';
        
        // Re-render books
        renderBooks();
    }
    
    // Function to save books to localStorage
    function saveBooks() {
        localStorage.setItem('dnd-books', JSON.stringify(books));
    }
    
    // Add event listeners
    document.getElementById('category-filter').addEventListener('change', applyCategoryFilter);
    document.getElementById('search-btn').addEventListener('click', applySearchFilter);
    document.getElementById('book-search').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            applySearchFilter();
        }
    });
    
    document.getElementById('upload-book-btn').addEventListener('click', function() {
        document.getElementById('upload-modal').style.display = 'block';
    });
    
    document.getElementById('upload-book-form').addEventListener('submit', uploadBook);
    
    // Close modals when clicking the close button or outside the modal
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('upload-modal').style.display = 'none';
            document.getElementById('pdf-viewer-modal').style.display = 'none';
            // Reset the PDF iframe src when closing to stop any audio/video
            document.getElementById('pdf-iframe').src = '';
        });
    });
    
    document.getElementById('close-pdf-btn').addEventListener('click', function() {
        document.getElementById('pdf-viewer-modal').style.display = 'none';
        // Reset the PDF iframe src when closing to stop any audio/video
        document.getElementById('pdf-iframe').src = '';
    });
    
    document.getElementById('download-pdf-btn').addEventListener('click', function() {
        const bookId = parseInt(this.dataset.id);
        const book = books.find(b => b.id === bookId);
        
        if (book && book.pdfUrl) {
            const link = document.createElement('a');
            link.href = book.pdfUrl;
            link.download = `${book.title.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('upload-modal')) {
            document.getElementById('upload-modal').style.display = 'none';
        }
        if (e.target === document.getElementById('pdf-viewer-modal')) {
            document.getElementById('pdf-viewer-modal').style.display = 'none';
            // Reset the PDF iframe src when closing to stop any audio/video
            document.getElementById('pdf-iframe').src = '';
        }
    });
    
    // Initial render
    renderBooks();
});
