import React, { useEffect, useState } from 'react';
import API from '../api';
import FineDashboard from './FineDashboard';
import DataTable from './DataTable';
import { useDataRefresh } from '../DataRefreshContext';

const POLL_MS = 15000;

const MemberDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refreshKey, triggerRefresh } = useDataRefresh();

  const loadTransactions = () => {
    API.get('transactions/')
      .then((res) => setTransactions(res.data))
      .catch((err) => console.error("Error fetching transactions", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTransactions();
    const interval = setInterval(loadTransactions, POLL_MS);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const handlePayFines = async () => {
    try {
      await API.post('pay-fines/');
      alert("Fines cleared successfully!");
      triggerRefresh();
    } catch (err) {
      alert("Failed to pay fines.");
    }
  };

  const handleReturn = async (transactionId) => {
    try {
      await API.put(`return/${transactionId}/`);
      alert("Book returned successfully!");
      triggerRefresh(); // this is what makes BookList's availability update instantly
    } catch (err) {
      alert("Failed to return book.");
    }
  };

  const activeFineTransactions = transactions.filter(t => t.fine > 0 && !t.return_date);
  const totalOutstanding = activeFineTransactions.reduce((sum, t) => sum + t.fine, 0);

  const columns = [
    { key: 'id', label: 'ID', width: '8%' },
    { key: 'book_title', label: 'Book Name', width: '26%', render: (row) => row.book_title || "N/A" },
    { key: 'book_author', label: 'Author', width: '20%', render: (row) => row.book_author || "N/A" },
    { key: 'fine', label: 'Fine (Rs.)', width: '16%', render: (row) => `Rs. ${row.fine}` },
    {
      key: 'action', label: 'Status/Action', width: '30%',
      render: (row) =>
        row.return_date ? <span>Returned</span> : (
          <button onClick={() => handleReturn(row.id)}>Return Book</button>
        ),
    },
  ];

  return (
    <div className="window">
      <h3>Your Dashboard</h3>
      {loading ? <p>Loading...</p> : (
        <DataTable columns={columns} data={transactions} pageSize={5} emptyMessage="No transactions yet." />
      )}

      <div className="fine-row">
        <div className="fine-box">
          <h3>Total Outstanding Balance</h3>
          <p className="outstanding-amount">Rs. {totalOutstanding}</p>
        </div>
        <div className="fine-box">
          <FineDashboard fines={activeFineTransactions} onPay={handlePayFines} />
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
