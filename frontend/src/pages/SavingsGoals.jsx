import { useEffect, useState } from "react";
import "./SavingsGoals.css";

function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const [addAmount, setAddAmount] = useState("");
  const [pin, setPin] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  // ==========================================
  // GET TOKEN
  // ==========================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("access_token")
    );
  };


  // ==========================================
  // FETCH SAVINGS GOALS
  // ==========================================

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:5000/api/savings",
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Failed to load savings goals"
        );
      }

      const fetchedGoals = data.goals || [];

      setGoals(fetchedGoals);

      // Keep selected goal if it still exists
      if (fetchedGoals.length > 0) {

        setSelectedGoal((currentGoal) => {

          if (currentGoal) {

            const updatedGoal =
              fetchedGoals.find(
                (goal) =>
                  goal.goal_id === currentGoal.goal_id
              );

            if (updatedGoal) {
              return updatedGoal;
            }
          }

          return fetchedGoals[0];
        });

      } else {
        setSelectedGoal(null);
      }

    } catch (err) {

      console.error(
        "Fetch Savings Goals Error:",
        err
      );

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // LOAD GOALS
  // ==========================================

  useEffect(() => {

    fetchGoals();

  }, []);


  // ==========================================
  // CREATE GOAL
  // ==========================================

  const handleCreateGoal = async (e) => {
    e.preventDefault();

    try {

      setError("");
      setMessage("");


      // Validate goal name
      if (!goalName.trim()) {

        setError("Please enter a goal name.");
        return;

      }


      // Validate amount
      if (
        !targetAmount ||
        Number(targetAmount) <= 0
      ) {

        setError(
          "Please enter a valid target amount."
        );

        return;

      }


      setLoading(true);


      const response = await fetch(
        "http://127.0.0.1:5000/api/savings",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },

          body: JSON.stringify({

            goal_name: goalName.trim(),

            target_amount: Number(targetAmount),

            target_date:
              targetDate || null,

          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          data.error ||
          "Failed to create goal."
        );

      }


      // Success
      setMessage(
        "Savings goal created successfully!"
      );


      // Clear form
      setGoalName("");
      setTargetAmount("");
      setTargetDate("");


      // Close modal
      setShowCreateModal(false);


      // Refresh goals
      await fetchGoals();


    } catch (err) {

      console.error(
        "Create Savings Goal Error:",
        err
      );

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // ADD MONEY
  // ==========================================

  const handleAddMoney = async (e) => {
    e.preventDefault();

    try {

      setError("");
      setMessage("");


      if (!selectedGoal) {

        setError("Please select a savings goal.");
        return;

      }


      // Validate amount
      if (
        !addAmount ||
        Number(addAmount) <= 0
      ) {

        setError(
          "Please enter a valid amount."
        );

        return;

      }


      // Prevent adding more than remaining amount
      if (
        Number(addAmount) > remaining
      ) {

        setError(
          `You can add a maximum of ₹${remaining.toLocaleString(
            "en-IN"
          )}.`
        );

        return;

      }


      // Validate PIN
      if (
        !/^\d{4}$/.test(pin)
      ) {

        setError(
          "Please enter a valid 4-digit PIN."
        );

        return;

      }


      setLoading(true);


      const response = await fetch(
        `http://127.0.0.1:5000/api/savings/${selectedGoal.goal_id}/add-money`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },

          body: JSON.stringify({

            amount: Number(addAmount),

            pin: pin,

          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          data.error ||
          "Failed to add money."
        );

      }


      // Success
      setMessage(
        "Amount added to your savings goal successfully!"
      );


      // Clear fields
      setAddAmount("");
      setPin("");


      // Close modal
      setShowAddModal(false);


      // Refresh data
      await fetchGoals();


    } catch (err) {

      console.error(
        "Add Savings Money Error:",
        err
      );

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // CALCULATE GOAL VALUES
  // ==========================================

  const target = selectedGoal
    ? Number(selectedGoal.target_amount)
    : 0;


  const saved = selectedGoal
    ? Number(selectedGoal.saved_amount)
    : 0;


  const remaining = Math.max(
    target - saved,
    0
  );


  const percentage =
    target > 0
      ? Math.min(
          (saved / target) * 100,
          100
        )
      : 0;


  // ==========================================
  // CONTRIBUTIONS
  // ==========================================

  const contributions =
    selectedGoal?.contributions || [];


  // ==========================================
  // STOCK STYLE GRAPH SETTINGS
  // ==========================================

  const chartWidth = 700;
  const chartHeight = 300;

  const paddingLeft = 50;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 45;


  const graphWidth =
    chartWidth -
    paddingLeft -
    paddingRight;


  const graphHeight =
    chartHeight -
    paddingTop -
    paddingBottom;


  // ==========================================
  // CREATE GRAPH POINTS
  // ==========================================

  const chartPoints =
    contributions.map(
      (contribution, index) => {

        const value =
          Number(
            contribution.saved_after || 0
          );


        // X position
        const x =
          contributions.length === 1
            ? paddingLeft + graphWidth / 2
            : paddingLeft +
              (
                index /
                (contributions.length - 1)
              ) *
              graphWidth;


        // Y position
        const progress =
          target > 0
            ? Math.min(
                value / target,
                1
              )
            : 0;


        const y =
          paddingTop +
          graphHeight -
          progress * graphHeight;


        return {

          x,

          y,

          value,

          date:
            contribution.created_at ||
            contribution.contribution_date ||
            "",

        };

      }
    );


  // SVG LINE POINTS
  const linePoints =
    chartPoints
      .map(
        (point) =>
          `${point.x},${point.y}`
      )
      .join(" ");


  // SVG AREA UNDER LINE
  const areaPoints =
    chartPoints.length > 0
      ? `${paddingLeft},${paddingTop + graphHeight} ` +
        linePoints +
        ` ${chartPoints[
          chartPoints.length - 1
        ].x},${paddingTop + graphHeight}`
      : "";


  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (dateValue) => {

    if (!dateValue) {
      return "";
    }

    try {

      return new Date(
        dateValue
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
        }
      );

    } catch {

      return dateValue;

    }
  };


  // ==========================================
  // CLOSE CREATE MODAL
  // ==========================================

  const closeCreateModal = () => {

    setShowCreateModal(false);

    setGoalName("");
    setTargetAmount("");
    setTargetDate("");

    setError("");

  };


  // ==========================================
  // CLOSE ADD MONEY MODAL
  // ==========================================

  const closeAddModal = () => {

    setShowAddModal(false);

    setAddAmount("");
    setPin("");

    setError("");

  };


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <main className="dashboard-main savings-page">


      {/* ======================================
          HEADER
      ====================================== */}

      <div className="savings-header">

        <div>

          <h1>
            Savings Goals
          </h1>

          <p>
            Track your savings and reach your goals step by step.
          </p>

        </div>


        <button
          className="create-goal-btn"
          onClick={() => {

            setError("");
            setMessage("");

            setShowCreateModal(true);

          }}
        >
          + Create Goal
        </button>

      </div>



      {/* ======================================
          SUCCESS MESSAGE
      ====================================== */}

      {message && (

        <div className="savings-success">

          {message}

        </div>

      )}



      {/* ======================================
          ERROR MESSAGE
      ====================================== */}

      {error && (

        <div className="savings-error">

          {error}

        </div>

      )}



      {/* ======================================
          LOADING
      ====================================== */}

      {loading && goals.length === 0 && (

        <div className="savings-loading">

          Loading savings goals...

        </div>

      )}



      {/* ======================================
          NO GOALS
      ====================================== */}

      {!loading &&
        goals.length === 0 && (

          <div className="no-goals-card">

            <div className="no-goals-icon">
              🎯
            </div>

            <h2>
              No Savings Goals Yet
            </h2>

            <p>
              Create your first savings goal and start building
              towards something important.
            </p>

            <button
              className="create-goal-btn"
              onClick={() => {

                setError("");
                setMessage("");

                setShowCreateModal(true);

              }}
            >
              + Create Your First Goal
            </button>

          </div>

        )}



      {/* ======================================
          GOALS
      ====================================== */}

      {goals.length > 0 && (

        <>


          {/* ==================================
              GOAL SELECTOR
          ================================== */}

          <div className="goal-selector">

            {goals.map((goal) => (

              <button
                key={goal.goal_id}

                className={
                  selectedGoal?.goal_id ===
                  goal.goal_id
                    ? "goal-tab active"
                    : "goal-tab"
                }

                onClick={() => {

                  setSelectedGoal(goal);

                  setError("");
                  setMessage("");

                }}
              >

                {goal.goal_name}

              </button>

            ))}

          </div>



          {/* ==================================
              MAIN GRID
          ================================== */}

          {selectedGoal && (

            <div className="savings-grid">


              {/* ==============================
                  LEFT GOAL CARD
              ============================== */}

              <div className="savings-card goal-details-card">


                {/* CARD HEADER */}

                <div className="card-heading">

                  <div>

                    <span className="card-label">
                      SAVINGS GOAL
                    </span>

                    <h2>
                      {selectedGoal.goal_name}
                    </h2>

                  </div>


                  <span
                    className={
                      selectedGoal.status ===
                      "COMPLETED"
                        ? "goal-status completed"
                        : "goal-status"
                    }
                  >

                    {selectedGoal.status}

                  </span>

                </div>



                {/* AMOUNT DETAILS */}

                <div className="amount-section">


                  <div className="amount-row">

                    <span>
                      Target Amount
                    </span>

                    <strong>
                      ₹{target.toLocaleString("en-IN")}
                    </strong>

                  </div>



                  <div className="amount-row saved">

                    <span>
                      Saved Amount
                    </span>

                    <strong>
                      ₹{saved.toLocaleString("en-IN")}
                    </strong>

                  </div>



                  <div className="amount-row">

                    <span>
                      Remaining
                    </span>

                    <strong>
                      ₹{remaining.toLocaleString("en-IN")}
                    </strong>

                  </div>


                </div>



                {/* PROGRESS */}

                <div className="goal-progress">

                  <div className="progress-header">

                    <span>
                      Progress
                    </span>

                    <strong>
                      {percentage.toFixed(0)}%
                    </strong>

                  </div>


                  <div className="progress-track">

                    <div
                      className="progress-fill"

                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                </div>



                {/* TARGET DATE */}

                {selectedGoal.target_date && (

                  <div className="target-date">

                    🎯 Target date:{" "}

                    {new Date(
                      selectedGoal.target_date
                    ).toLocaleDateString(
                      "en-IN"
                    )}

                  </div>

                )}



                {/* ADD MONEY */}

                {selectedGoal.status !==
                  "COMPLETED" && (

                  <button
                    className="add-money-btn"

                    onClick={() => {

                      setError("");
                      setMessage("");

                      setAddAmount("");
                      setPin("");

                      setShowAddModal(true);

                    }}
                  >

                    + Add Amount

                  </button>

                )}


              </div>



              {/* ==============================
                  RIGHT GROWTH CHART
              ============================== */}

              <div className="savings-card chart-card">


                {/* CHART HEADER */}

                <div className="card-heading">

                  <div>

                    <span className="card-label">
                      SAVINGS GROWTH
                    </span>

                    <h2>
                      Growth Timeline
                    </h2>

                  </div>


                  <span className="chart-value">

                    ₹{saved.toLocaleString("en-IN")}

                  </span>

                </div>



                {/* ==============================
                    CHART AREA
                ============================== */}

                <div className="chart-area">


                  {contributions.length === 0 ? (

                    <div className="empty-chart">

                      <div className="empty-chart-icon">
                        📈
                      </div>

                      <p>
                        Add money to start your savings growth chart.
                      </p>

                    </div>

                  ) : (

                    <div className="stock-chart-container">


                      <svg
                        className="stock-chart"

                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}

                        preserveAspectRatio="none"
                      >


                        {/* HORIZONTAL GRID LINES */}

                        {[0, 25, 50, 75, 100].map(
                          (value) => {

                            const y =
                              paddingTop +
                              graphHeight -
                              (value / 100) *
                              graphHeight;

                            return (

                              <line
                                key={value}

                                x1={paddingLeft}
                                x2={
                                  chartWidth -
                                  paddingRight
                                }

                                y1={y}
                                y2={y}

                                className="chart-grid-line"
                              />

                            );

                          }
                        )}



                        {/* LEFT AXIS */}

                        <line
                          x1={paddingLeft}
                          x2={paddingLeft}

                          y1={paddingTop}
                          y2={
                            paddingTop +
                            graphHeight
                          }

                          className="chart-axis"
                        />



                        {/* BOTTOM AXIS */}

                        <line
                          x1={paddingLeft}
                          x2={
                            chartWidth -
                            paddingRight
                          }

                          y1={
                            paddingTop +
                            graphHeight
                          }

                          y2={
                            paddingTop +
                            graphHeight
                          }

                          className="chart-axis"
                        />



                        {/* FILLED AREA */}

                        {areaPoints && (

                          <polygon
                            points={areaPoints}
                            className="chart-area-fill"
                          />

                        )}



                        {/* RISING LINE */}

                        {chartPoints.length === 1 ? (

                          <line
                            x1={paddingLeft}
                            y1={
                              paddingTop +
                              graphHeight
                            }

                            x2={
                              chartPoints[0].x
                            }

                            y2={
                              chartPoints[0].y
                            }

                            className="growth-svg-line"
                          />

                        ) : (

                          <polyline
                            points={linePoints}
                            className="growth-svg-line"
                          />

                        )}



                        {/* POINTS */}

                        {chartPoints.map(
                          (point, index) => (

                            <g
                              key={index}
                              className="chart-point-group"
                            >

                              <circle
                                cx={point.x}
                                cy={point.y}
                                r="6"
                                className="growth-svg-point"
                              />

                              <title>
                                ₹{point.value.toLocaleString(
                                  "en-IN"
                                )}
                                {point.date
                                  ? ` - ${formatDate(
                                      point.date
                                    )}`
                                  : ""}
                              </title>

                            </g>

                          )
                        )}



                        {/* TARGET LABEL */}

                        <text
                          x={5}
                          y={paddingTop + 5}
                          className="chart-y-label"
                        >
                          ₹{target.toLocaleString("en-IN")}
                        </text>


                        <text
                          x={5}
                          y={
                            paddingTop +
                            graphHeight
                          }
                          className="chart-y-label"
                        >
                          ₹0
                        </text>


                      </svg>



                      {/* X AXIS DATES */}

                      <div className="chart-date-labels">

                        {chartPoints.map(
                          (point, index) => (

                            <span
                              key={index}
                            >

                              {formatDate(
                                point.date
                              )}

                            </span>

                          )
                        )}

                      </div>


                    </div>

                  )}


                </div>



                {/* CHART FOOTER */}

                <div className="chart-footer">

                  <span>

                    {contributions.length} contribution
                    {contributions.length !== 1
                      ? "s"
                      : ""}

                  </span>


                  <span>

                    Target ₹
                    {target.toLocaleString("en-IN")}

                  </span>

                </div>


              </div>


            </div>

          )}

        </>

      )}



      {/* ======================================
          CREATE GOAL MODAL
      ====================================== */}

      {showCreateModal && (

        <div className="modal-overlay">


          <div className="savings-modal">


            {/* CLOSE */}

            <button
              className="modal-close"
              type="button"
              onClick={closeCreateModal}
            >
              ×
            </button>



            <h2>
              Create Savings Goal
            </h2>


            <p>
              Set a target and start saving towards it.
            </p>



            <form
              onSubmit={handleCreateGoal}
            >


              {/* GOAL NAME */}

              <label>
                Goal Name
              </label>

              <input
                type="text"
                placeholder="Example: New Laptop"

                value={goalName}

                onChange={(e) =>
                  setGoalName(
                    e.target.value
                  )
                }
              />



              {/* TARGET AMOUNT */}

              <label>
                Target Amount
              </label>

              <input
                type="number"
                min="1"
                placeholder="₹50,000"

                value={targetAmount}

                onChange={(e) =>
                  setTargetAmount(
                    e.target.value
                  )
                }
              />



              {/* TARGET DATE */}

              <label>
                Target Date

                <span>
                  {" "} (Optional)
                </span>

              </label>

              <input
                type="date"

                value={targetDate}

                onChange={(e) =>
                  setTargetDate(
                    e.target.value
                  )
                }
              />



              {/* CREATE */}

              <button
                type="submit"
                className="modal-primary-btn"
                disabled={loading}
              >

                {loading
                  ? "Creating..."
                  : "Create Goal"}

              </button>


            </form>


          </div>


        </div>

      )}



      {/* ======================================
          ADD MONEY MODAL
      ====================================== */}

      {showAddModal &&
        selectedGoal && (

          <div className="modal-overlay">


            <div className="savings-modal">


              {/* CLOSE */}

              <button
                className="modal-close"
                type="button"
                onClick={closeAddModal}
              >
                ×
              </button>



              <h2>
                Add Money
              </h2>


              <p>

                Add money to{" "}

                <strong>
                  {selectedGoal.goal_name}
                </strong>

              </p>



              <form
                onSubmit={handleAddMoney}
              >


                {/* AMOUNT */}

                <label>
                  Amount
                </label>

                <input
                  type="number"
                  min="1"
                  max={remaining}

                  placeholder={`Maximum ₹${remaining.toLocaleString(
                    "en-IN"
                  )}`}

                  value={addAmount}

                  onChange={(e) =>
                    setAddAmount(
                      e.target.value
                    )
                  }
                />



                {/* PIN */}

                <label>
                  4-Digit PIN
                </label>

                <input
                  type="password"
                  maxLength="4"
                  inputMode="numeric"
                  placeholder="Enter PIN"

                  value={pin}

                  onChange={(e) => {

                    const value =
                      e.target.value.replace(
                        /\D/g,
                        ""
                      );

                    if (
                      value.length <= 4
                    ) {

                      setPin(value);

                    }

                  }}
                />



                {/* REMAINING INFO */}

                <div className="add-money-info">

                  ₹
                  {remaining.toLocaleString(
                    "en-IN"
                  )} remaining to reach your goal.

                </div>



                {/* ADD MONEY BUTTON */}

                <button
                  type="submit"
                  className="modal-primary-btn"
                  disabled={loading}
                >

                  {loading
                    ? "Processing..."
                    : "Add Money"}

                </button>


              </form>


            </div>


          </div>

        )}


    </main>

  );
}

export default SavingsGoals;