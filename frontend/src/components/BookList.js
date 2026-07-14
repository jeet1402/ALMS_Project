import React, { useEffect, useRef, useState } from 'react';
import API from '../api';
import DataTable from './DataTable';
import { useDataRefresh } from '../DataRefreshContext';

const DEBOUNCE_MS = 400;
const POLL_MS = 15000;

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);
  const { refreshKey, triggerRefresh } = useDataRefresh();

  const loadBooks = async (query = search) => {
    setLoading(true);
    try {
      const res = await API.get('books/', { params: { search: query } });
      setBooks(res.data);
    } catch (err) {
      console.error("Failed to fetch books", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
    const interval = setInterval(() => loadBooks(), POLL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const handleSearchChange = (value) => {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadBooks(value), DEBOUNCE_MS);
  };

  const handleReserve = async (bookId) => {
    try {
      const response = await API.post('reserve/', { book: bookId });
      alert(response.data.message);
      triggerRefresh(); // instantly updates MemberDashboard too, once it's built to react to it
    } catch (err) {
      alert(err.response?.data?.error || "Reservation failed.");
    }
  };

  const columns = [
    { key: 'id', label: 'ID', width: '8%' },
    { key: 'title', label: 'Title', width: '28%' },
    { key: 'author', label: 'Author', width: '22%' },
    { key: 'available_copies', label: 'Available', width: '14%' },
    {
      key: 'action', label: 'Action', width: '18%',
      render: (row) => (
        <button disabled={row.available_copies <= 0} onClick={() => handleReserve(row.id)}>
          {row.available_copies > 0 ? "Reserve" : "Out of Stock"}
        </button>
      ),
    },
  ];

  return (
    <div className="window">
      <h3>Book Catalogue</h3>
      <p className="panel-subtitle">Browse the library's collection and reserve any available title.</p>
      <input
        type="text"
        placeholder="Search by title or author..."
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      {loading ? <p>Loading books...</p> : (
        <DataTable columns={columns} data={books} pageSize={5} emptyMessage="No books found." />
      )}
    </div>
  );
};

export default BookList;
