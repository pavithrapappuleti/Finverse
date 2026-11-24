import { useEffect, useState } from "react";
import "./ScheduledTransactions.css";

function ScheduledTransactions() {

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------------
  // SCHEDULE FORM STATES
  // -----------------------------------

  const [showForm, setShowForm] = useState(false);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [frequency, setFrequency] = useState("ONCE");

  const [recipientAccountId, setRecipientAccountId] = useState("");

  // -----------------------------------
  // PIN STATES
  // -----------------------------------

  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);

  // -----------------------------------
  // LOADING STATES
  // -----------------------------------

  const [submitLoading, setSubmitLoading] = useState(false);


  // -----------------------------------
  // FETCH SCHEDULES
  // -----------------------------------

  const fetchSchedules = async () => {

    try {

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login again");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/scheduled`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {

        alert(
          data.message ||
          "Failed to fetch scheduled transfers"
        );

        return;
      }

      setSchedules(data.schedules || []);

    } catch (error) {

      console.error(
        "Fetch Scheduled Transfers Error:",
        error
      );

      alert(
        "Unable to fetch scheduled transfers."
      );

    } finally {

      setLoading(false);

    }
  };


  // -----------------------------------
  // OPEN SCHEDULE TRANSFER FORM
  // -----------------------------------

  const openScheduleForm = () => {

    setShowForm(true);

    setAmount("");
    setDescription("");
    setScheduledDate("");
    setScheduledTime("");
    setFrequency("ONCE");
    setRecipientAccountId("");

    setPin("");
    setShowPin(false);
  };


  // -----------------------------------
  // CLOSE FORM
  // -----------------------------------

  const closeScheduleForm = () => {

    setShowForm(false);

    setAmount("");
    setDescription("");
    setScheduledDate("");
    setScheduledTime("");
    setFrequency("ONCE");
    setRecipientAccountId("");

    setPin("");
    setShowPin(false);
  };


  // -----------------------------------
  // HANDLE SCHEDULE TRANSFER
  // -----------------------------------

  const handleScheduleTransaction = async () => {

    // -----------------------------------
    // VALIDATE RECIPIENT
    // -----------------------------------

    if (!recipientAccountId) {

      alert(
        "Please enter the recipient account number."
      );

      return;
    }


    // -----------------------------------
    // VALIDATE AMOUNT
    // -----------------------------------

    if (!amount || Number(amount) <= 0) {

      alert("Please enter a valid amount.");

      return;
    }


    // -----------------------------------
    // VALIDATE DESCRIPTION
    // -----------------------------------

    if (!description.trim()) {

      alert("Please enter a description.");

      return;
    }


    // -----------------------------------
    // VALIDATE DATE
    // -----------------------------------

    if (!scheduledDate) {

      alert("Please select a scheduled date.");

      return;
    }


    // -----------------------------------
    // VALIDATE TIME
    // -----------------------------------

    if (!scheduledTime) {

      alert("Please select a scheduled time.");

      return;
    }


    // -----------------------------------
    // VALIDATE PIN
    // -----------------------------------

    if (!pin) {

      alert(
        "Please enter your 4-digit account PIN."
      );

      return;
    }


    if (!/^\d{4}$/.test(pin)) {

      alert(
        "PIN must be exactly 4 digits."
      );

      return;
    }


    try {

      const token = localStorage.getItem("token");

      if (!token) {

        alert("Please login again.");

        return;
      }


      setSubmitLoading(true);


      // -----------------------------------
      // SEND SCHEDULED TRANSFER
      // -----------------------------------

      const response = await fetch(
        `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/scheduled`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({

            transaction_type: "TRANSFER",

            amount: Number(amount),

            description: description.trim(),

            scheduled_date:
              `${scheduledDate}T${scheduledTime}`,

            frequency: frequency,
recipient_account_id: recipientAccountId.trim(),

            pin: pin

          })
        }
      );


      const data = await response.json();


      // -----------------------------------
      // BACKEND ERROR
      // -----------------------------------

      if (!response.ok) {

        alert(
          data.message ||
          "Failed to schedule transfer."
        );

        return;
      }


      // -----------------------------------
      // SUCCESS
      // -----------------------------------

      alert(
        "Transfer scheduled successfully."
      );


      // -----------------------------------
      // CLEAR FORM
      // -----------------------------------

      setAmount("");
      setDescription("");
      setScheduledDate("");
      setScheduledTime("");
      setFrequency("ONCE");
      setRecipientAccountId("");

      setPin("");
      setShowPin(false);

      setShowForm(false);


      // -----------------------------------
      // REFRESH SCHEDULES
      // -----------------------------------

      fetchSchedules();


    } catch (error) {

      console.error(
        "Schedule Transfer Error:",
        error
      );

      alert(
        "Unable to schedule transfer."
      );

    } finally {

      setSubmitLoading(false);

    }
  };


  // -----------------------------------
  // DELETE / CANCEL SCHEDULE
  // -----------------------------------

  const handleDeleteSchedule = async (scheduleId) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this scheduled transfer?"
    );

    if (!confirmDelete) {
      return;
    }


    try {

      const token = localStorage.getItem("token");

      if (!token) {

        alert("Please login again.");

        return;
      }


      const response = await fetch(
        `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/scheduled/${scheduleId}/cancel`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      const data = await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Failed to delete scheduled transfer."
        );

        return;
      }


      // -----------------------------------
      // SUCCESS ALERT
      // -----------------------------------

      alert(
        "Scheduled transfer deleted successfully."
      );


      // -----------------------------------
      // REFRESH LIST
      // -----------------------------------

      fetchSchedules();


    } catch (error) {

      console.error(
        "Delete Schedule Error:",
        error
      );

      alert(
        "Unable to connect to server."
      );
    }
  };


  // -----------------------------------
  // FORMAT SCHEDULE DATE
  // -----------------------------------

  const formatScheduledDate = (dateTime) => {

    if (!dateTime) {
      return "-";
    }

    const date = new Date(dateTime);

    if (isNaN(date.getTime())) {
      return dateTime;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };


  // -----------------------------------
  // FORMAT SCHEDULE TIME
  // -----------------------------------

  const formatScheduledTime = (dateTime) => {

    if (!dateTime) {
      return "-";
    }

    const date = new Date(dateTime);

    if (isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  };


  // -----------------------------------
  // FETCH WHEN PAGE LOADS
  // -----------------------------------

  useEffect(() => {

    fetchSchedules();

  }, []);


  // -----------------------------------
  // PAGE
  // -----------------------------------

  return (

    <main className="dashboard-main">

      <div className="scheduled-page">

        {/* -----------------------------------
            PAGE HEADER
        ----------------------------------- */}

        <div className="scheduled-header">

          <h1>
            Scheduled Transfers
          </h1>

          <p>
            Manage your upcoming money transfers
          </p>

        </div>


        {/* -----------------------------------
            ACTION BUTTON
        ----------------------------------- */}

        <div className="schedule-actions">

          <button
            className="schedule-transfer-btn"
            onClick={openScheduleForm}
          >
            💸 Schedule Transfer
          </button>

        </div>


        {/* -----------------------------------
            SCHEDULE TRANSFER FORM
        ----------------------------------- */}

        {showForm && (

          <div className="schedule-form-box">

            {/* Form Header */}

            <div className="schedule-form-header">

              <h2>
                Schedule Transfer
              </h2>


              <button
                className="close-schedule-btn"
                onClick={closeScheduleForm}
              >
                ×
              </button>

            </div>


            {/* -----------------------------------
                RECIPIENT ACCOUNT
            ----------------------------------- */}

            <div className="schedule-field">

              <label>
                Recipient Account Number
              </label>

              <input
                type="number"
                value={recipientAccountId}
                onChange={(e) =>
                  setRecipientAccountId(
                    e.target.value
                  )
                }
                placeholder="Enter recipient account number"
              />

            </div>


            {/* -----------------------------------
                AMOUNT
            ----------------------------------- */}

            <div className="schedule-field">

              <label>
                Amount
              </label>

              <div className="schedule-amount-input">

                <span>
                  ₹
                </span>

                <input
                  type="number"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  placeholder="Enter amount"
                  min="1"
                />

              </div>

            </div>


            {/* -----------------------------------
                DESCRIPTION
            ----------------------------------- */}

            <div className="schedule-field">

              <label>
                Description
              </label>

              <input
                type="text"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Example: Monthly Transfer"
              />

            </div>


            {/* -----------------------------------
                DATE + TIME
            ----------------------------------- */}

            <div className="schedule-date-time-row">

              {/* DATE */}

              <div className="schedule-field">

                <label>
                  Scheduled Date
                </label>

                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) =>
                    setScheduledDate(
                      e.target.value
                    )
                  }
                  min={
                    new Date(
                      Date.now() + 86400000
                    )
                      .toISOString()
                      .split("T")[0]
                  }
                />

              </div>


              {/* TIME */}

              <div className="schedule-field">

                <label>
                  Scheduled Time
                </label>

                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) =>
                    setScheduledTime(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>


            {/* -----------------------------------
                FREQUENCY
            ----------------------------------- */}

            <div className="schedule-field">

              <label>
                Frequency
              </label>

              <select
                value={frequency}
                onChange={(e) =>
                  setFrequency(
                    e.target.value
                  )
                }
              >

                <option value="ONCE">
                  Once
                </option>

                <option value="DAILY">
                  Daily
                </option>

                <option value="WEEKLY">
                  Weekly
                </option>

                <option value="MONTHLY">
                  Monthly
                </option>

              </select>

            </div>


            {/* -----------------------------------
                ACCOUNT PIN
            ----------------------------------- */}

            <div className="schedule-field">

              <label>
                Account PIN
              </label>


              <div className="pin-input-wrapper">

                <input
                  type={
                    showPin
                      ? "text"
                      : "password"
                  }

                  value={pin}

                  onChange={(e) => {

                    const value =
                      e.target.value;

                    if (
                      /^\d{0,4}$/.test(value)
                    ) {

                      setPin(value);

                    }

                  }}

                  placeholder="Enter 4-digit PIN"

                  maxLength="4"

                  inputMode="numeric"

                />


                <button
                  type="button"
                  className="pin-toggle-btn"
                  onClick={() =>
                    setShowPin(!showPin)
                  }
                >

                  {showPin
                    ? "Hide"
                    : "Show"}

                </button>

              </div>


              <small>
                Enter your 4-digit account PIN
                to authorize this scheduled transfer.
              </small>

            </div>


            {/* -----------------------------------
                CONFIRM BUTTON
            ----------------------------------- */}

            <button
              className="confirm-schedule-btn"
              onClick={
                handleScheduleTransaction
              }
              disabled={submitLoading}
            >

              {submitLoading
                ? "Scheduling..."
                : "Schedule Transfer"}

            </button>

          </div>

        )}


        {/* -----------------------------------
            SCHEDULE LIST
        ----------------------------------- */}

        {loading ? (

          <div className="scheduled-loading">

            Loading scheduled transfers...

          </div>

        ) : schedules.length === 0 ? (

          <div className="no-schedules">

            <h3>
              No Scheduled Transfers
            </h3>

            <p>
              You don't have any upcoming
              transfers.
            </p>

          </div>

        ) : (

          <div className="scheduled-list">

            {schedules.map((schedule) => (

              <div
                className="scheduled-card"
                key={schedule.schedule_id}
              >

                {/* -----------------------------------
                    CARD TOP
                ----------------------------------- */}

                <div className="scheduled-card-top">

                  <div>

                    <h3>
                      ↗ Transfer
                    </h3>


                    <p>

                      {schedule.description ||
                        "Scheduled transfer"}

                    </p>

                  </div>


                  <strong>

                    ₹
                    {Number(
                      schedule.amount
                    ).toFixed(2)}

                  </strong>

                </div>


                {/* -----------------------------------
                    CARD DETAILS
                ----------------------------------- */}

                <div className="scheduled-details">

                  {/* DATE */}

                  <div>

                    <span>
                      Date
                    </span>

                    <strong>
                      {formatScheduledDate(
                        schedule.scheduled_date
                      )}
                    </strong>

                  </div>


                  {/* TIME */}

                  <div>

                    <span>
                      Time
                    </span>

                    <strong>
                      {formatScheduledTime(
                        schedule.scheduled_date
                      )}
                    </strong>

                  </div>


                  {/* FREQUENCY */}

                  <div>

                    <span>
                      Frequency
                    </span>

                    <strong>
                      {schedule.frequency}
                    </strong>

                  </div>

                </div>


                {/* -----------------------------------
                    STATUS + DELETE
                ----------------------------------- */}

                <div className="schedule-status-row">

                  <div className="schedule-status">

                    <span className="schedule-status-label">
                      Status
                    </span>

                    <span
                      className={`schedule-status-badge ${
                        schedule.status
                          ?.toLowerCase()
                      }`}
                    >
                      {schedule.status}
                    </span>

                  </div>


                  {/* DELETE BUTTON */}

                  {schedule.status ===
                    "SCHEDULED" && (

                    <button
                      className="delete-schedule-btn"
                      onClick={() =>
                        handleDeleteSchedule(
                          schedule.schedule_id
                        )
                      }
                    >
                      Delete
                    </button>

                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </main>

  );
}

export default ScheduledTransactions;