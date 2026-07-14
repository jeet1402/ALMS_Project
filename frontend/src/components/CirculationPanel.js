import React, { useEffect, useState } from 'react';
import API from '../api';
import DataTable from './DataTable';

const CirculationPanel = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await API.get('transactions/');
      setTransactions(res.data);
    } catch (err) {
      console.error("Error loading transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleMarkReturned = async (transactionId) => {
    try {
      await API.put(`return/${transactionId}/`);
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to mark as returned.');
    }
  };

  const totalFines = transactions.reduce((acc, curr) => acc + (curr.fine || 0), 0);

  const columns = [
    { key: 'member', label: 'Member', width: '16%' },
    { key: 'book_title', label: 'Book', width: '26%', render: (row) => row.book_title || row.book },
    { key: 'due_date', label: 'Due Date', width: '16%' },
    { key: 'status', label: 'Status', width: '16%', render: (row) => (row.return_date ? 'Returned' : 'Checked Out') },
    { key: 'fine', label: 'Fine (Rs.)', width: '12%' },
    {
      key: 'action', label: 'Action', width: '14%',
      render: (row) => row.return_date ? '—' : (
        <button onClick={() => handleMarkReturned(row.id)}>Mark Returned</button>
      ),
    },
  ];

  return (
    <div className="window">
      <h3>Librarian Circulation Desk</h3>
      {loading ? <p>Loading...</p> : (
        <>
          <DataTable columns={columns} data={transactions} pageSize={5} emptyMessage="No transactions found." />
          <p className="panel-subtitle">Total System Fines Outstanding: <strong>Rs. {totalFines}</strong></p>
        </>
      )}
    </div>
  );
};

export default CirculationPanel;
