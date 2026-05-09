import React, { useState, useEffect, useCallback } from "react";
import API from "../api";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/users/");
      setUsers(res.data);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchUsers(); 
  }, [fetchUsers]);

  const handleToggleActive = async (user) => {
    try {
      await API.patch(`/users/${user.id}/`, { is_active: !user.is_active });
      setMessage("User updated.");
      fetchUsers();
    } catch {
      setError("Failed update.");
    }
  };

  return (
    <div className="admin-section">
      <h3>Manage Users</h3>
      {message && <div className="admin-msg success">{message}</div>}
      {error && <div className="admin-msg error">{error}</div>}
      <table className="admin-table">
        <thead><tr><th>Username</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.is_active ? "Active" : "Inactive"}</td>
              <td><button className="btn" onClick={() => handleToggleActive(u)}>Toggle</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageUsers;
