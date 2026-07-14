import React from 'react';
import BooksPanel from './BooksPanel';
import MembersPanel from './MembersPanel';
import CirculationPanel from './CirculationPanel';

const AdminDashboard = () => {
  return (
    <div className="admin-container">
      <h2>Admin Control Panel</h2>
      <div className="admin-grid">
        <BooksPanel />
        <MembersPanel />
        <div className="full-width">
          <CirculationPanel />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
