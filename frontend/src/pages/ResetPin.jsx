import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ResetPin.css";

function ResetPin() {

    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const [showConfirmPin, setShowConfirmPin] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleResetPin = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        // Validate PIN
        if (!/^\d{4}$/.test(newPin)) {
            setError("New PIN must contain exactly 4 digits.");
            return;
        }

        // Confirm PIN
        if (newPin !== confirmPin) {
            setError("New PIN and confirm PIN do not match.");
            return;
        }

        const token =localStorage.getItem("token");

        if (!token) {
            setError("Your session has expired. Please login again.");
            return;
        }

        try {

            setLoading(true);
           

            const response = await fetch(
                 `${import.meta.env.VITE_API_URL}/api/reset-pin`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        password: password,
                        new_pin: newPin
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to reset PIN"
                );
            }

            setSuccess("Your PIN has been reset successfully.");

            setPassword("");
            setNewPin("");
            setConfirmPin("");

            // Go to balance after 2 seconds
            setTimeout(() => {
                navigate("/balance");
            }, 2000);

        } catch (error) {

            setError(error.message);

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="reset-pin-page">

            <div className="reset-pin-card">

                <div className="reset-pin-icon">
                    🔐
                </div>

                <h1>Reset PIN</h1>

                <p className="reset-description">
                    Create a new 4-digit transaction PIN for your
                    FINVERSE account.
                </p>

                {error && (
                    <div className="reset-message error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="reset-message success">
                        {success}
                    </div>
                )}

                <form onSubmit={handleResetPin}>

                    {/* Password */}

                    <div className="reset-field">

                        <label>Account Password</label>

                        <div className="input-wrapper">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Enter your password"
                                required
                            />

                            <button
                                type="button"
                                className="eye-button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>

                        </div>

                    </div>


                    {/* New PIN */}

                    <div className="reset-field">

                        <label>New PIN</label>

                        <div className="input-wrapper">

                            <input
                                type={
                                    showPin
                                        ? "text"
                                        : "password"
                                }
                                value={newPin}
                                onChange={(e) => {

                                    const value =
                                        e.target.value.replace(/\D/g, "");

                                    if (value.length <= 4) {
                                        setNewPin(value);
                                    }

                                }}
                                placeholder="Enter 4-digit PIN"
                                inputMode="numeric"
                                maxLength="4"
                                required
                            />

                            <button
                                type="button"
                                className="eye-button"
                                onClick={() =>
                                    setShowPin(!showPin)
                                }
                            >
                                {showPin ? "🙈" : "👁️"}
                            </button>

                        </div>

                    </div>


                    {/* Confirm PIN */}

                    <div className="reset-field">

                        <label>Confirm New PIN</label>

                        <div className="input-wrapper">

                            <input
                                type={
                                    showConfirmPin
                                        ? "text"
                                        : "password"
                                }
                                value={confirmPin}
                                onChange={(e) => {

                                    const value =
                                        e.target.value.replace(/\D/g, "");

                                    if (value.length <= 4) {
                                        setConfirmPin(value);
                                    }

                                }}
                                placeholder="Re-enter new PIN"
                                inputMode="numeric"
                                maxLength="4"
                                required
                            />

                            <button
                                type="button"
                                className="eye-button"
                                onClick={() =>
                                    setShowConfirmPin(
                                        !showConfirmPin
                                    )
                                }
                            >
                                {showConfirmPin ? "🙈" : "👁️"}
                            </button>

                        </div>

                    </div>


                    <button
                        type="submit"
                        className="reset-pin-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Resetting PIN..."
                            : "Reset PIN"}

                    </button>

                </form>


                <Link
                    to="/balance"
                    className="back-link"
                >
                    ← Back to Balance
                </Link>

            </div>

        </div>
    );
}

export default ResetPin;