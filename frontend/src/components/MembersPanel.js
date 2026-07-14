import React, { useEffect, useState } from 'react';
import API from '../api';
import DataTable from './DataTable';
import { useDataRefresh } from '../DataRefreshContext';

const POLL_MS = 15000;

const MembersPanel = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { refreshKey, triggerRefresh } = useDataRefresh();

  const loadMembers = async () => {
    try {
      const res = await API.get('members/');
      setMembers(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
    const interval = setInterval(loadMembers, POLL_MS);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member?')) return;
    try {
      await API.delete(`members/${id}/`);
      triggerRefresh();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete member.');
    }
  };

  const columns = [
    { key: 'id', label: 'ID', width: '10%' },
    { key: 'member_id', label: 'Member ID', width: '18%' },
    { key: 'name', label: 'Name', width: '26%' },
    { key: 'department', label: 'Department', width: '24%' },
    {
      key: 'action', label: 'Action', width: '22%',
      render: (row) => <button onClick={() => handleDelete(row.id)}>Delete</button>,
    },
  ];

  return (
    <div className="window">
      <div className="panel-header">
        <h3>Manage Members</h3>
        <button className="header-spacer-btn" aria-hidden="true" tabIndex={-1}>+ Add Book</button>
      </div>
      {loading && <p>Loading members...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && (
        <DataTable columns={columns} data={members} pageSize={5} emptyMessage="No members found." />
      )}
    </div>
  );
};

export default MembersPanel;
