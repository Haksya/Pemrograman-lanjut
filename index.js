// =====================
// Global State
// =====================
let allBooks = [];
let filteredBooks = [];
let currentPage = 1;
const booksPerPage = 50;
let currentFilter = 'all';

const bookList = document.getElementById("book-list");
const pageIndicator = document.getElementById("page-indicator");

// =====================
// Fetch Books
// =====================
async function fetchBooks(query = "novel") {
  const results = [];
  for (let i = 0; i < 3; i++) {
    const startIndex = i * 40;
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=40&startIndex=${startIndex}`);
    const data = await res.json();
    if (data.items) {
      const books = data.items.map(item => {
        const info = item.volumeInfo;
        return {
          id: item.id,
          title: info.title || "Unknown Title",
          authors: info.authors?.join(", ") || "Unknown Author",
          year: info.publishedDate?.substring(0, 4) || "N/A",
          score: +(Math.random() * 2 + 7).toFixed(2),
          readers: Math.floor(Math.random() * 1000000),
          description: info.description || "No description available.",
          thumbnail: info.imageLinks?.thumbnail || "https://via.placeholder.com/128x192?text=No+Cover"
        };
      });
      allBooks.push(...books);
    }
  }
  applyFilter();
}

// =====================
// Filtering & Pagination
// =====================
function applyFilter() {
  if (currentFilter === 'top') {
    filteredBooks = [...allBooks].sort((a, b) => b.score - a.score);
  } else if (currentFilter === 'popular') {
    filteredBooks = [...allBooks].sort((a, b) => b.readers - a.readers);
  } else {
    filteredBooks = [...allBooks];
  }
  currentPage = 1;
  renderBooks();
}

function renderBooks() {
  bookList.innerHTML = "";
  const start = (currentPage - 1) * booksPerPage;
  const end = start + booksPerPage;
  const booksToShow = filteredBooks.slice(start, end);

  booksToShow.forEach((book, index) => {
    const row = document.createElement("tr");
    row.className = "hover:bg-gray-100 cursor-pointer";
    row.innerHTML = `
      <td class="p-3 text-center">${start + index + 1}</td>
      <td class="p-3"><img src="${book.thumbnail}" class="w-16 h-24 object-cover"></td>
      <td class="p-3">
        <p class="font-semibold text-[#2e51a2]">${book.title}</p>
        <p class="text-sm text-gray-600">${book.authors} | ${book.year}</p>
      </td>
      <td class="p-3 text-center">⭐ ${book.score}</td>
      <td class="p-3 text-center">${book.readers.toLocaleString()}</td>
      <td class="p-3 text-center">
        <button class="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 detail-btn" data-index="${start + index}">Detail</button>
      </td>
    `;
    bookList.appendChild(row);
  });

  // Tambahkan event listener ke tombol detail
  document.querySelectorAll(".detail-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const index = parseInt(e.target.getAttribute("data-index"));
      const book = filteredBooks[index];
      showDetail(book);
    });
  });

  pageIndicator.textContent = `Page ${currentPage} of ${Math.ceil(filteredBooks.length / booksPerPage)}`;
}

function nextPage() {
  if (currentPage < Math.ceil(filteredBooks.length / booksPerPage)) {
    currentPage++;
    renderBooks();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderBooks();
  }
}

function setFilter(type) {
  currentFilter = type;
  applyFilter();
}

// =====================
// Show Detail Modal
// =====================
function showDetail(book) {
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50";
  modal.innerHTML = `
    <div class="bg-white p-6 rounded-lg max-w-xl w-full relative">
      <button class="absolute top-2 right-2 text-gray-500 hover:text-black" onclick="this.closest('div.fixed').remove()">&times;</button>
      <div class="flex gap-4">
        <img src="${book.thumbnail}" class="w-32 h-48 object-cover rounded shadow">
        <div>
          <h2 class="text-xl font-bold text-[#2e51a2] mb-2">${book.title}</h2>
          <p class="text-sm text-gray-600 mb-1">Author: ${book.authors}</p>
          <p class="text-sm text-gray-600 mb-3">Published: ${book.year}</p>
          <p class="text-gray-700 text-sm mb-4 max-h-40 overflow-y-auto">${book.description}</p>
          <button class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onclick='borrowBook("${book.title.replace(/"/g, '&quot;')}")'>Pinjam Buku</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function borrowBook(title) {
  alert(`Kamu telah meminjam buku: "${title}"`);
  document.querySelector(".fixed")?.remove();
}

// =====================
// Init
// =====================
window.addEventListener("DOMContentLoaded", () => {
  fetchBooks();
});
