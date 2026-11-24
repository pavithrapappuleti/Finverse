import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./AdminUpdates.css";

function AdminUpdates() {

  const { setMenuOpen } = useOutletContext();

  const [updates, setUpdates] = useState([]);
  const [users, setUsers] = useState([]);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("ALL");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);


  // ==============================
  // FETCH USERS
  // ==============================

  const fetchUsers = async () => {

    try {

      const response = await fetch(
         `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/admin/users`
      );

      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
      }

    } catch (error) {
      console.error("Users Error:", error);
    }
  };


  // ==============================
  // FETCH UPDATES
  // ==============================

  const fetchUpdates = async () => {

    try {

      setFetching(true);

      const response = await fetch(
         `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/admin/updates`
      );

      const data = await response.json();

      if (response.ok) {
        setUpdates(data.updates || []);
      }

    } catch (error) {

      console.error("Updates Error:", error);

    } finally {

      setFetching(false);

    }
  };


  useEffect(() => {
    fetchUsers();
    fetchUpdates();
  }, []);


  // ==============================
  // SEND UPDATE
  // ==============================

  const handleSendUpdate = async (e) => {

    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter update title");
      return;
    }

    if (!message.trim()) {
      alert("Please enter update message");
      return;
    }

    setLoading(true);

    try {

      const response = await fetch(
         `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/admin/updates`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            title: title,
            message: message,
            recipient: recipient
          })
        }
      );

      const data = await response.json();

      if (response.ok) {

        alert(data.message);

        setTitle("");
        setMessage("");
        setRecipient("ALL");

        fetchUpdates();

      } else {

        alert(data.message || "Failed to send update");

      }

    } catch (error) {

      console.error("Send Update Error:", error);

      alert("Unable to connect to server");

    } finally {

      setLoading(false);

    }
  };


  // ==============================
  // DELETE UPDATE
  // ==============================

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this update?"
    );

    if (!confirmDelete) {
      return;
    }

    try {

      const response = await fetch(
         `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/admin/updates/${id}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (response.ok) {

        alert("Update deleted successfully");

        fetchUpdates();

      } else {

        alert(data.message || "Failed to delete update");

      }

    } catch (error) {

      console.error("Delete Error:", error);

      alert("Unable to connect to server");

    }
  };


  return (

    <main className="admin-dashboard-main">

      {/* TOP BAR */}

      <div className="admin-topbar">

        <button
          className="admin-menu-button"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>

        <div>
          <h1>Bank Updates</h1>
          <p>Send important updates and notifications to customers</p>
        </div>

      </div>


      {/* SEND UPDATE */}

      <section className="update-compose-card">

        <div className="update-card-heading">

          <div>
            <h2>Send Bank Update</h2>
            <p>
              Send notifications to all users or a specific customer
            </p>
          </div>

          <span className="update-heading-icon">
            🔔
          </span>

        </div>


        <form onSubmit={handleSendUpdate}>

          <div className="update-form-group">

            <label>Update Title</label>

            <input
              type="text"
              placeholder="Enter update title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

          </div>


          <div className="update-form-group">

            <label>Message</label>

            <textarea
              rows="5"
              placeholder="Enter bank update message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

          </div>


          <div className="update-form-group">

            <label>Send To</label>

            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            >

              <option value="ALL">
                All Active Users
              </option>

              {users.map((user) => (

                <option
                  key={user.user_id}
                  value={user.user_id}
                >
                  {user.full_name} - {user.email}
                </option>

              ))}

            </select>

          </div>


          <button
            type="submit"
            className="send-update-btn"
            disabled={loading}
          >

            {loading ? "Sending..." : "🔔 Send Update"}

          </button>

        </form>

      </section>


      {/* PREVIOUS UPDATES */}

      <section className="updates-list-card">

        <div className="updates-list-heading">

          <div>
            <h2>Previous Updates</h2>
            <p>Recently sent bank notifications</p>
          </div>

          <span className="updates-count">
            {updates.length} Updates
          </span>

        </div>


        {fetching ? (

          <div className="updates-empty">
            Loading updates...
          </div>

        ) : updates.length === 0 ? (

          <div className="updates-empty">

            <div>🔔</div>

            <h3>No updates yet</h3>

            <p>
              Sent bank notifications will appear here.
            </p>

          </div>

        ) : (

          <div className="updates-table-wrapper">

            <table className="updates-table">

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Update</th>
                  <th>Recipient</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {updates.map((update) => (

                  <tr key={update.notification_id}>

                    <td>
                      #{update.notification_id}
                    </td>

                    <td>
                      <strong>{update.title}</strong>
                    </td>

                    <td>
                      <div className="recipient-cell">

                        <strong>
                          {update.user_name}
                        </strong>

                        <small>
                          {update.user_email}
                        </small>

                      </div>
                    </td>

                    <td className="message-cell">
                      {update.message}
                    </td>

                    <td>
                      {update.created_at
                        ? new Date(
                            update.created_at
                          ).toLocaleString()
                        : "-"
                      }
                    </td>

                    <td>

                      <button
                        className="delete-update-btn"
                        onClick={() =>
                          handleDelete(
                            update.notification_id
                          )
                        }
                      >
                        🗑
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </main>
  );
}

export default AdminUpdates;