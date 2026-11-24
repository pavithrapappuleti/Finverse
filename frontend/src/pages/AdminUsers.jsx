import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./AdminUsers.css";

function AdminUsers() {

  const { setMenuOpen } = useOutletContext();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");


  // =========================
  // FETCH USERS
  // =========================

  const fetchUsers = async () => {

    try {

      setLoading(true);

      const response = await fetch(
         `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/admin/users`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      console.log("Users Response:", data);

      if (response.ok) {

        setUsers(data.users || []);

      } else {

        alert(
          data.message ||
          "Failed to fetch users"
        );
      }

    } catch (error) {

      console.error(
        "Fetch Users Error:",
        error
      );

      alert(
        "Unable to connect to server"
      );

    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {

    fetchUsers();

  }, []);


  // =========================
  // VIEW KYC DOCUMENT
  // =========================

  const viewKycDocument = (userId) => {

    const documentUrl =
       `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/admin/users/${userId}/kyc-document`;

    window.open(
      documentUrl,
      "_blank"
    );
  };


  // =========================
  // VERIFY KYC
  // =========================

  const verifyKyc = async (userId) => {

    const selectedUser = users.find(
      (user) =>
        user.user_id === userId
    );

    if (!selectedUser) {
      return;
    }


    if (!selectedUser.document_available) {

      alert(
        "KYC document is not available."
      );

      return;
    }


    if (
      selectedUser.kyc_status ===
      "VERIFIED"
    ) {

      alert(
        "This user's KYC is already verified."
      );

      return;
    }


    if (
      selectedUser.kyc_status ===
      "REJECTED"
    ) {

      alert(
        "Rejected KYC cannot be verified directly."
      );

      return;
    }


    const confirmVerify =
      window.confirm(
        `Are you sure you want to verify KYC for ${selectedUser.full_name}?`
      );

    if (!confirmVerify) {
      return;
    }


    try {

      const response = await fetch(
         `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/admin/users/${userId}/kyc/verify`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          }
        }
      );


      const data =
        await response.json();


      console.log(
        "KYC Verify Response:",
        data
      );


      if (response.ok) {

        alert(
          data.message ||
          "KYC verified successfully"
        );

        await fetchUsers();

      } else {

        alert(
          data.message ||
          "Failed to verify KYC"
        );
      }

    } catch (error) {

      console.error(
        "Verify KYC Error:",
        error
      );

      alert(
        "Unable to connect to server"
      );
    }
  };


  // =========================
  // REJECT KYC
  // =========================

  const rejectKyc = async (userId) => {

    const selectedUser = users.find(
      (user) =>
        user.user_id === userId
    );

    if (!selectedUser) {
      return;
    }


    if (
      !selectedUser.document_available
    ) {

      alert(
        "KYC document is not available."
      );

      return;
    }


    if (
      selectedUser.kyc_status ===
      "REJECTED"
    ) {

      alert(
        "This user's KYC is already rejected."
      );

      return;
    }


    const remarks =
      window.prompt(
        "Enter the reason for rejecting this KYC:"
      );


    if (
      remarks === null
    ) {

      return;
    }


    if (
      !remarks.trim()
    ) {

      alert(
        "Rejection reason is required."
      );

      return;
    }


    const confirmReject =
      window.confirm(
        `Are you sure you want to reject KYC for ${selectedUser.full_name}?`
      );

    if (!confirmReject) {
      return;
    }


    try {

      const response = await fetch(
         `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/admin/users/${userId}/kyc/reject`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            remarks:
              remarks.trim()
          })
        }
      );


      const data =
        await response.json();


      console.log(
        "KYC Reject Response:",
        data
      );


      if (response.ok) {

        if (
          data.email_status ===
          "sent"
        ) {

          alert(
            "KYC rejected successfully.\n\nRejection email has been sent to the user's registered email."
          );

        } else {

          alert(
            "KYC rejected successfully, but the email could not be sent."
          );
        }


        await fetchUsers();

      } else {

        alert(
          data.message ||
          "Failed to reject KYC"
        );
      }

    } catch (error) {

      console.error(
        "Reject KYC Error:",
        error
      );

      alert(
        "Unable to connect to server"
      );
    }
  };


  // =========================
  // CHANGE USER STATUS
  // =========================

  const changeStatus = async (
    userId,
    currentStatus
  ) => {

    const selectedUser = users.find(
      (user) =>
        user.user_id === userId
    );

    if (!selectedUser) {
      return;
    }


    let newStatus;


    if (
      currentStatus ===
      "ACTIVE"
    ) {

      newStatus = "INACTIVE";

    } else {

      newStatus = "ACTIVE";
    }


    // -------------------------------------------------
    // KYC CHECK BEFORE ACTIVATION
    // -------------------------------------------------

    if (
      newStatus === "ACTIVE"
    ) {

      if (
        !selectedUser.kyc_status ||
        !selectedUser.document_available
      ) {

        alert(
          "This user has not submitted the required KYC document."
        );

        return;
      }


      if (
        selectedUser.kyc_status !==
        "VERIFIED"
      ) {

        alert(
          "User cannot be activated until KYC is verified."
        );

        return;
      }
    }


    // -------------------------------------------------
    // CONFIRM ACTION
    // -------------------------------------------------

    const confirmChange =
      window.confirm(
        `Are you sure you want to change this user to ${newStatus}?`
      );

    if (!confirmChange) {
      return;
    }


    try {

      const response = await fetch(
         `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/admin/users/${userId}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            status: newStatus
          })
        }
      );


      const data =
        await response.json();


      console.log(
        "Status Update Response:",
        data
      );


      if (response.ok) {

        alert(
          data.message ||
          "User status updated successfully"
        );


        await fetchUsers();

      } else {

        alert(
          data.message ||
          "Failed to update user status"
        );
      }

    } catch (error) {

      console.error(
        "Status Error:",
        error
      );

      alert(
        "Unable to connect to server"
      );
    }
  };


  // =========================
  // SEARCH + FILTER
  // =========================

  const filteredUsers =
    users.filter((user) => {

      const searchText =
        search
          .toLowerCase()
          .trim();


      const matchesSearch =

        String(
          user.full_name || ""
        )
          .toLowerCase()
          .includes(searchText)

        ||

        String(
          user.email || ""
        )
          .toLowerCase()
          .includes(searchText)

        ||

        String(
          user.phone || ""
        )
          .includes(searchText)

        ||

        String(
          user.account_number || ""
        )
          .includes(searchText);


      const matchesStatus =

        statusFilter === "ALL" ||
        user.status === statusFilter;


      return (
        matchesSearch &&
        matchesStatus
      );
    });


  // =========================
  // KYC STATUS STYLE
  // =========================

  const getKycStyle = (
    status
  ) => {

    if (
      status ===
      "VERIFIED"
    ) {

      return {
        background:
          "rgba(34, 197, 94, 0.12)",

        color:
          "#22c55e"
      };

    }


    if (
      status ===
      "REJECTED"
    ) {

      return {
        background:
          "rgba(239, 68, 68, 0.12)",

        color:
          "#ef4444"
      };

    }


    return {
      background:
        "rgba(245, 158, 11, 0.12)",

      color:
        "#f59e0b"
    };
  };


  return (

    <main className="admin-dashboard-main">


      {/* ========================= */}
      {/* TOP BAR */}
      {/* ========================= */}

      <div className="admin-users-topbar">


        <div className="admin-users-title">


          <button
            className="admin-menu-button"
            onClick={() =>
              setMenuOpen(true)
            }
          >
            ☰
          </button>


          <div>

            <h1>
              Manage Users
            </h1>

            <p>
              View and manage registered FINVERSE users
            </p>

          </div>

        </div>


        {/* TOTAL USERS */}

        <div className="admin-users-count">

          <strong>
            {users.length}
          </strong>

          <span>
            Total Users
          </span>

        </div>

      </div>


      {/* ========================= */}
      {/* SEARCH + FILTER */}
      {/* ========================= */}

      <section className="admin-users-controls">


        <div className="admin-users-search">

          <span>
            ⌕
          </span>


          <input
            type="text"
            placeholder="Search by name, email, phone or account..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          className="admin-status-filter"
        >

          <option value="ALL">
            All Status
          </option>

          <option value="ACTIVE">
            Active
          </option>

          <option value="INACTIVE">
            Inactive
          </option>

          <option value="PENDING">
            Pending
          </option>

        </select>

      </section>


      {/* ========================= */}
      {/* USERS TABLE */}
      {/* ========================= */}

      <section className="admin-users-card">


        {/* CARD HEADER */}

        <div className="admin-users-card-header">

          <div>

            <h2>
              Registered Users
            </h2>

            <p>

              {filteredUsers.length} user
              {filteredUsers.length !== 1
                ? "s"
                : ""} found

            </p>

          </div>

        </div>


        {/* ========================= */}
        {/* LOADING */}
        {/* ========================= */}

        {loading ? (

          <div className="admin-users-loading">

            Loading users...

          </div>


        ) : filteredUsers.length === 0 ? (

          /* ========================= */
          /* NO USERS */
          /* ========================= */

          <div className="admin-users-empty">

            <div>
              👥
            </div>

            <h3>
              No users found
            </h3>

            <p>
              No users match your search or filter.
            </p>

          </div>


        ) : (

          /* ========================= */
          /* TABLE */
          /* ========================= */

          <div className="admin-users-table-wrapper">

            <table className="admin-users-table">


              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    User
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Account
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    KYC
                  </th>

                  <th>
                    Document
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>


                {filteredUsers.map(
                  (user) => (

                    <tr
                      key={
                        user.user_id
                      }
                    >


                      {/* ========================= */}
                      {/* ID */}
                      {/* ========================= */}

                      <td>

                        #{user.user_id}

                      </td>


                      {/* ========================= */}
                      {/* USER */}
                      {/* ========================= */}

                      <td>

                        <div className="admin-user-info">


                          <div className="admin-user-avatar">

                            {user.full_name

                              ? user.full_name
                                  .charAt(0)
                                  .toUpperCase()

                              : "U"}

                          </div>


                          <div>

                            <strong>
                              {user.full_name ||
                                "-"}
                            </strong>

                            <span>
                              {user.email ||
                                "-"}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* ========================= */}
                      {/* PHONE */}
                      {/* ========================= */}

                      <td>

                        {user.phone ||
                          "-"}

                      </td>


                      {/* ========================= */}
                      {/* ACCOUNT NUMBER */}
                      {/* ========================= */}

                      <td>

                        {user.account_number ? (

                          <span className="account-number">

                            {user.account_number}

                          </span>

                        ) : (

                          "-"

                        )}

                      </td>


                      {/* ========================= */}
                      {/* ACCOUNT TYPE */}
                      {/* ========================= */}

                      <td>

                        {user.account_type ||
                          "-"}

                      </td>


                      {/* ========================= */}
                      {/* KYC STATUS */}
                      {/* ========================= */}

                      <td>


                        {user.kyc_status ? (

                          <div>


                            <span
                              style={{
                                display:
                                  "inline-block",

                                padding:
                                  "5px 9px",

                                borderRadius:
                                  "20px",

                                fontSize:
                                  "11px",

                                fontWeight:
                                  "600",

                                ...getKycStyle(
                                  user.kyc_status
                                )
                              }}
                            >

                              {user.kyc_status}

                            </span>


                            {user.document_type && (

                              <div
                                style={{
                                  marginTop:
                                    "5px",

                                  fontSize:
                                    "11px",

                                  color:
                                    "#6b7c93"
                                }}
                              >

                                {user.document_type}

                              </div>

                            )}

                          </div>

                        ) : (

                          <span
                            style={{
                              color:
                                "#8a98a9",

                              fontSize:
                                "12px"
                            }}
                          >

                            Not submitted

                          </span>

                        )}

                      </td>


                      {/* ========================= */}
                      {/* KYC DOCUMENT */}
                      {/* ========================= */}

                      <td>


                        {user.document_available ? (

                          <button
                            type="button"
                            onClick={() =>
                              viewKycDocument(
                                user.user_id
                              )
                            }
                            style={{
                              border:
                                "none",

                              padding:
                                "7px 11px",

                              borderRadius:
                                "6px",

                              cursor:
                                "pointer",

                              background:
                                "rgba(0, 200, 255, 0.12)",

                              color:
                                "#00c8ff",

                              fontSize:
                                "12px",

                              fontWeight:
                                "600"
                            }}
                          >

                            📄 View

                          </button>

                        ) : (

                          <span
                            style={{
                              color:
                                "#8a98a9",

                              fontSize:
                                "12px"
                            }}
                          >

                            Not uploaded

                          </span>

                        )}

                      </td>


                      {/* ========================= */}
                      {/* ACCOUNT STATUS */}
                      {/* ========================= */}

                      <td>


                        <span
                          className={`user-status ${
                            user.status ===
                            "ACTIVE"

                              ? "active"

                              : user.status ===
                                "PENDING"

                              ? "pending"

                              : "inactive"
                          }`}
                        >

                          {user.status}

                        </span>

                      </td>


                      {/* ========================= */}
                      {/* ACTION */}
                      {/* ========================= */}

                      <td>

                        <div
                          style={{
                            display:
                              "flex",

                            flexDirection:
                              "column",

                            gap:
                              "6px"
                          }}
                        >


                          {/* VERIFY KYC */}

                          {user.kyc_status ===
                            "PENDING" && (

                            <button
                              type="button"
                              onClick={() =>
                                verifyKyc(
                                  user.user_id
                                )
                              }
                              style={{
                                border:
                                  "none",

                                padding:
                                  "7px 10px",

                                borderRadius:
                                  "6px",

                                cursor:
                                  "pointer",

                                background:
                                  "rgba(34, 197, 94, 0.12)",

                                color:
                                  "#22c55e",

                                fontSize:
                                  "11px",

                                fontWeight:
                                  "600"
                              }}
                            >

                              ✓ Verify KYC

                            </button>

                          )}


                          {/* REJECT KYC */}

                          {user.kyc_status ===
                            "PENDING" && (

                            <button
                              type="button"
                              onClick={() =>
                                rejectKyc(
                                  user.user_id
                                )
                              }
                              style={{
                                border:
                                  "none",

                                padding:
                                  "7px 10px",

                                borderRadius:
                                  "6px",

                                cursor:
                                  "pointer",

                                background:
                                  "rgba(239, 68, 68, 0.12)",

                                color:
                                  "#ef4444",

                                fontSize:
                                  "11px",

                                fontWeight:
                                  "600"
                              }}
                            >

                              ✕ Reject KYC

                            </button>

                          )}


                          {/* ACTIVATE / DEACTIVATE */}

                          {user.status ===
                            "ACTIVE" ? (

                            <button
                              className="user-status-button deactivate"
                              onClick={() =>
                                changeStatus(
                                  user.user_id,
                                  user.status
                                )
                              }
                            >

                              Deactivate

                            </button>

                          ) : (

                            <button
                              className="user-status-button activate"
                              onClick={() =>
                                changeStatus(
                                  user.user_id,
                                  user.status
                                )
                              }
                            >

                              Activate

                            </button>

                          )}

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </main>
  );
}

export default AdminUsers;