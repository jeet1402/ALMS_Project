import React, { useEffect, useState } from 'react';
import API from '../api'; 
import FineDashboard from './FineDashboard';

const MemberDashboard = () => {
  const [transactions, setTransactions] = useState([]);

  // Fetch transactions on load
  useEffect(() => {
    API.get('transactions/')
      .then((res) => {
        setTransactions(res.data);
      })
      .catch((err) => console.error("Error fetching transactions", err));
  }, []);

  // Handle fine payment
  const handlePayFines = async () => {
    try {
      await API.post('pay-fines/');
      alert("Fines cleared successfully!");
      window.location.reload();
    } catch (err) {
      alert("Failed to pay fines.");
    }
  };

  // Handle return book
  const handleReturn = async (transactionId) => {
    try {
      await API.put(`return/${transactionId}/`);
      alert("Book returned successfully!");
      window.location.reload();
    } catch (err) {
      alert("Failed to return book.");
    }
  };

  // Logic: Only calculate fines for books that are NOT yet returned
  const activeFineTransactions = transactions.filter(t => t.fine > 0 && !t.return_date);
  const totalOutstanding = activeFineTransactions.reduce((sum, t) => sum + t.fine, 0);

  return (
    <div className="dashboard-container">
      <h2>Your Dashboard</h2>
      
      <h3>Current Books & History</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Book Name</th>
            <th>Author</th>
            <th>Fine (Rs.)</th>
            <th>Status/Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.book_title || "N/A"}</td>
              <td>{t.book_author || "N/A"}</td>
              <td>Rs. {t.fine}</td>
              <td>
                {t.return_date ? (
                  <span>Returned</span>
                ) : (
                  <button onClick={() => handleReturn(t.id)}>Return Book</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Fine Management: Only pass active overdue transactions */}
      <div className="fine-management">
        <h3>Total Outstanding Balance: Rs. {totalOutstanding}</h3>
        <FineDashboard 
          fines={activeFineTransactions} 
          onPay={handlePayFines} 
        />
      </div>
    </div>
  );
};

export default MemberDashboard;
