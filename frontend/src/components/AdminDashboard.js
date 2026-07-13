import React from 'react';

const API_ORIGIN = process.env.REACT_APP_API_ORIGIN || 'http://localhost:8000';

const AdminDashboard = () => {
  return (
    <div className="admin-container">
      <h2>Admin Control Panel</h2>
      <nav>
        <button onClick={() => window.open(`${API_ORIGIN}/admin/library_app/book/`, '_blank')}>
          Manage Books
        </button>
        <button onClick={() => window.open(`${API_ORIGIN}/admin/library_app/member/`, '_blank')}>
          Manage Members
        </button>
        <button onClick={() => window.open(`${API_ORIGIN}/admin/library_app/transaction/`, '_blank')}>
          View Transactions
        </button>
      </nav>
      <section>
        <h3>System Overview</h3>
        <p>Use the panels above to perform administrative tasks, including manual stock updates and transaction audits.</p>
        <p><em>Note: these open Django admin, which requires a separate staff login from your ALMS account.</em></p>
      </section>
    </div>
  );
};

export default AdminDashboard;
