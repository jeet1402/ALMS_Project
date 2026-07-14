import React, { useEffect, useState } from 'react';
import API from '../api';
import DataTable from './DataTable';

const emptyForm = { title: '', author: '', isbn: '', total_copies: 1, available_copies: 1 };

const BooksPanel = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const res = await API.get('books/');
      setBooks(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load books.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBooks(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try {
      await API.delete(`books/${id}/`);
      loadBooks();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete book.');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const totalCopies = Number(form.total_copies) || 0;
    const availableCopies = Number(form.available_copies) || 0;
    if (availableCopies > totalCopies) {
      alert('Available copies cannot exceed total copies.');
      return;
    }
    setSaving(true);
    try {
      await API.post('books/', {
        title: form.title,
        author: form.author,
        isbn: form.isbn,
        total_copies: totalCopies,
        available_copies: availableCopies,
      });
      setForm(emptyForm);
      setShowForm(false);
      loadBooks();
    } catch (err) {
      alert(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to add book.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'id', label: 'ID', width: '8%' },
    { key: 'title', label: 'Title', width: '24%' },
    { key: 'author', label: 'Author', width: '18%' },
    { key: 'isbn', label: 'ISBN', width: '16%' },
    { key: 'total_copies', label: 'Total', width: '10%' },
    { key: 'available_copies', label: 'Available', width: '10%' },
    {
      key: 'action', label: 'Action', width: '14%',
      render: (row) => <button onClick={() => handleDelete(row.id)}>Delete</button>,
    },
  ];

  return (
    <div className="window">
      <div className="panel-header">
        <h3>Manage Books</h3>
        <button onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ Add Book'}
        </button>
      </div>

      {showForm && (
        <form className="add-form" onSubmit={handleAddSubmit}>
          <input
            placeholder="Title" required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            placeholder="Author" required
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />
          <input
            placeholder="ISBN (13 digits)" required maxLength={13}
            value={form.isbn}
            onChange={(e) => setForm({ ...form, isbn: e.target.value })}
          />
          <input
            type="number" min="0" placeholder="Total Copies" required
            value={form.total_copies}
            onChange={(e) => setForm({ ...form, total_copies: e.target.value })}
          />
          <input
            type="number" min="0" placeholder="Available Copies" required
            value={form.available_copies}
            onChange={(e) => setForm({ ...form, available_copies: e.target.value })}
          />
          <div className="add-form-actions">
            <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Book'}</button>
          </div>
        </form>
      )}

      {loading && <p>Loading books...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && (
        <DataTable columns={columns} data={books} pageSize={5} emptyMessage="No books found." />
      )}
    </div>
  );
};

export default BooksPanel;
