import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import API from '../api'; // Use your configured API instance

const AdminCirculation = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await API.get('transactions/');
        setTransactions(res.data);
      } catch (err) {
        console.error("Error loading transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const handleReturn = async (id) => {
    try {
      await API.put(`return/${id}/`);
      window.location.reload();
    } catch (err) {
      alert("Failed to mark as returned.");
    }
  };

  const token = localStorage.getItem('access');
  let isStaff = false;

  try {
    const decoded = jwtDecode(token);
    // Based on our discussion, User ID '1' is the Admin
    isStaff = decoded.user_id === "1"; 
  } catch (error) {
    console.error("Invalid token");
  }

  if (!isStaff) {
    return <h2>Access Denied: You do not have librarian privileges.</h2>;
  }

  if (loading) return <p>Loading...</p>;

  const totalFees = transactions.reduce((acc, curr) => acc + (curr.fine || 0), 0);

  return (
    <div className="admin-container">
      <h2>Librarian Circulation Desk</h2>
      
      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Book</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.member}</td>
              <td>{t.book_title || t.book}</td>
              <td>{t.due_date}</td>
              <td>{t.return_date ? "Returned" : "Checked Out"}</td>
              <td>
                {!t.return_date && (
                  <button onClick={() => handleReturn(t.id)}>Mark as Returned</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Moved outside of <table> to fix DOM nesting error */}
      <div className="total-fines">
        <h3>Total System Fines: Rs. {totalFees}</h3>
      </div>
    </div>
  );
};

export default AdminCirculation;
