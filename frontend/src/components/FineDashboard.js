import React from 'react';

const FineDashboard = ({ fines, onPay }) => {
  // 1. Calculate the total here at the top
  const totalOwed = fines.reduce((sum, f) => sum + f.fine, 0);

  // 2. Return everything in one single block
  return (
    <div className="fine-container">
      <h2>Fine Management</h2>
      
      {/* Summary Section */}
      <div className="summary-box">
        <h3>Total Outstanding Balance: Rs. {totalOwed}</h3>
        {fines.length > 0 && (
          <button onClick={onPay}>Pay Fines</button>
        )}
      </div>

      {/* Details Table */}
      {fines.length > 0 ? (
        <>
          <p>You have <strong>{fines.length}</strong> overdue books.</p>
          <table border="1">
            <thead>
              <tr>
                <th>Book ID</th>
                <th>Fine Amount (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {fines.map(f => (
                <tr key={f.id}>
                  <td>{f.book}</td>
                  <td>Rs. {f.fine}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>No outstanding fines. Your account is in good standing!</p>
      )}
    </div>
  );
};

export default FineDashboard;
