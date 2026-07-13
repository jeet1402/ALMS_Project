import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="admin-container">
      <h2>Admin Control Panel</h2>
      <nav>
        <button onClick={() => window.location.href='/admin/library_app/book/'}>Manage Books</button>
        <button onClick={() => window.location.href='/admin/library_app/member/'}>Manage Members</button>
        <button onClick={() => window.location.href='/admin/library_app/transaction/'}>View Transactions</button>
      </nav>
      <section>
        <h3>System Overview</h3>
        <p>Use the panels above to perform administrative tasks, including manual stock updates and transaction audits.</p>
      </section>
    </div>
  );
};

export default AdminDashboard;
