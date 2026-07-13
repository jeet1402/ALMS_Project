import React, { useEffect, useState } from 'react';
import API from '../api';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');

  // Fetch books with optional search query
  const loadBooks = async (query = '') => {
    try {
      const res = await API.get('books/', { params: { search: query } });
      setBooks(res.data);
    } catch (err) {
      console.error("Failed to fetch books", err);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleReserve = async (bookId) => {
    try {
      const response = await API.post('reserve/', { book: bookId });
      alert(response.data.message);
      loadBooks(); // Refresh list after reservation
    } catch (err) {
      alert(err.response?.data?.error || "Reservation failed.");
    }
  };

  return (
    <div>
      <input 
        type="text" 
        placeholder="Search by topic, title, or author..." 
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          loadBooks(e.target.value);
        }}
      />
      <table>
        <thead>
          <tr><th>ID</th><th>Name</th><th>Author</th><th>Available</th><th>Action</th></tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.id}</td>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.available_copies}</td>
              <td>
                <button 
                  disabled={book.available_copies <= 0} 
                  onClick={() => handleReserve(book.id)}
                >
                  {book.available_copies > 0 ? "Reserve" : "Out of Stock"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookList;
