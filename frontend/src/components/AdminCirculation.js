import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import API from '../api';

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

  const token = localStorage.getItem('access');
  let isStaff = false;
  try {
    if (token) {
        const decoded = jwtDecode(token);
        isStaff = decoded.user_id === "1"; // Admin ID matching
    }
  } catch (error) { console.error("Invalid token"); }

  if (!isStaff) return <h2>Access Denied: You do not have librarian privileges.</h2>;
  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-container">
      <h2>Librarian Circulation Desk</h2>
      <table>
        <thead>
          <tr><th>Member</th><th>Book</th><th>Due Date</th><th>Status</th></tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.member}</td>
              <td>{t.book_title || t.book}</td>
              <td>{t.due_date}</td>
              <td>{t.return_date ? "Returned" : "Checked Out"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Total System Fines: Rs. {transactions.reduce((acc, curr) => acc + (curr.fine || 0), 0)}</h3>
    </div>
  );
};

export default AdminCirculation;
