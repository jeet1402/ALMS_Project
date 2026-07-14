import React, { useEffect, useState } from 'react';
import API from '../api';
import DataTable from './DataTable';

const MembersPanel = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMembers = async () => {
    setLoading(true);
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

  useEffect(() => { loadMembers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this member?')) return;
    try {
      await API.delete(`members/${id}/`);
      loadMembers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete member.');
    }
  };

  const columns = [
    { key: 'id', label: 'ID', width: '12%' },
    { key: 'member_id', label: 'Member ID', width: '22%' },
    { key: 'name', label: 'Name', width: '28%' },
    { key: 'department', label: 'Department', width: '26%' },
    {
      key: 'action', label: 'Action', width: '12%',
      render: (row) => <button onClick={() => handleDelete(row.id)}>Delete</button>,
    },
  ];

  return (
    <div className="window">
      <h3>Manage Members</h3>
      {loading && <p>Loading members...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && (
        <DataTable columns={columns} data={members} pageSize={5} emptyMessage="No members found." />
      )}
    </div>
  );
};

export default MembersPanel;
