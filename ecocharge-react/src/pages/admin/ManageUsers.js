import React, { useState, useEffect, useCallback, useMemo } from "react";
import API from "../../api";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("access_token");
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/users/", { headers });
      setUsers(res.data);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleActive = async (user) => {
    try {
      await API.patch(
        `/users/${user.id}/`,
        { is_active: !user.is_active },
        { headers }
      );
      setMessage(`user ${user.username} ${user.is_active ? "deactivated" : "activated"}.`);
      fetchUsers();
    } catch {
      setError("Failed to update user.");
    }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/users/${id}/`, { headers });
      setMessage("User deleted.");
      fetchUsers();
    } catch {
      setError("Failed to delete user.");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-section">

      <div className="admin-section-header">
        <p className="admin-count">{users.length} users total</p>
        <input
          className="admin-search"
          placeholder="Search by username or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {message && <div className="admin-msg success">{message}</div>}
      {error && <div className="admin-msg error">{error}</div>}

      {loading ? (
        <p className="admin-loading">Loading users...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="admin-empty">No users found.</td></tr>
              ) : (
                filtered.map((u, i) => (
                  <tr key={u.id}>
                    <td>{i + 1}</td>
                    <td><strong>{u.username}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`admin-role ${u.is_staff ? "admin" : "user"}`}>
                        {u.is_staff ? "Admin" : "User"}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${u.is_active ? "available" : "busy"}`}>
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{new Date(u.date_joined).toLocaleDateString("en-IN")}</td>
                    <td className="admin-actions">
                      {!u.is_staff && (
                        <>
                          <button
                            className={u.is_active ? "admin-btn-toggle" : "admin-btn-edit"}
                            onClick={() => handleToggleActive(u)}
                          >
                            {u.is_active ? "Deactivate" : "Activate"}
                          </button>
                          <button className="admin-btn-delete"
                            onClick={() => handleDelete(u.id, u.username)}>
                            Delete
                          </button>
                        </>
                      )}
                      {u.is_staff && <span style={{ color: "#aaa", fontSize: "0.8rem" }}>Protected</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
