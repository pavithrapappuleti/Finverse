import { useState } from "react";

function Topbar() {
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <header
            style={{
                height: "80px",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 30px",
                borderBottom: "1px solid #e5e7eb",
                position: "relative",
                boxSizing: "border-box"
            }}
        >

            {/* Welcome message */}
            <div>
                <h2
                    style={{
                        margin: "0 0 5px 0",
                        fontSize: "20px",
                        fontWeight: "600",
                        color: "#003366",
                        fontFamily: "Poppins, sans-serif"
                    }}
                >
                    Welcome back, Pavithra 👋
                </h2>

                <p
                    style={{
                        margin: "0",
                        fontSize: "13px",
                        color: "#718096",
                        fontFamily: "Poppins, sans-serif"
                    }}
                >
                    Manage your banking easily and securely.
                </p>
            </div>


            {/* Notification */}
            <div
                style={{
                    position: "relative"
                }}
            >

                <button
                    onClick={() =>
                        setShowNotifications(!showNotifications)
                    }
                    style={{
                        width: "45px",
                        height: "45px",
                        borderRadius: "50%",
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        fontSize: "20px",
                        cursor: "pointer",
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    🔔

                    {/* Badge */}
                    <span
                        style={{
                            position: "absolute",
                            top: "-3px",
                            right: "-3px",
                            width: "19px",
                            height: "19px",
                            background: "#ef4444",
                            color: "#ffffff",
                            borderRadius: "50%",
                            fontSize: "10px",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid #ffffff"
                        }}
                    >
                        3
                    </span>
                </button>


                {/* Notification popup */}
                {showNotifications && (

                    <div
                        style={{
                            position: "absolute",
                            top: "55px",
                            right: "0",
                            width: "350px",
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                            zIndex: 1000,
                            overflow: "hidden"
                        }}
                    >

                        {/* Header */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "15px 18px",
                                borderBottom: "1px solid #edf2f7"
                            }}
                        >
                            <h3
                                style={{
                                    margin: "0",
                                    color: "#003366",
                                    fontSize: "16px",
                                    fontFamily: "Poppins, sans-serif"
                                }}
                            >
                                Notifications
                            </h3>

                            <button
                                onClick={() =>
                                    setShowNotifications(false)
                                }
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    fontSize: "24px",
                                    color: "#718096",
                                    cursor: "pointer",
                                    lineHeight: "1"
                                }}
                            >
                                ×
                            </button>
                        </div>


                        {/* Notification 1 */}
                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                padding: "15px 18px",
                                borderBottom: "1px solid #edf2f7"
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "22px"
                                }}
                            >
                                💰
                            </span>

                            <div>
                                <strong
                                    style={{
                                        fontSize: "14px",
                                        color: "#1a202c",
                                        fontFamily: "Poppins, sans-serif"
                                    }}
                                >
                                    Deposit successful
                                </strong>

                                <p
                                    style={{
                                        margin: "4px 0 0",
                                        fontSize: "12px",
                                        color: "#718096",
                                        lineHeight: "1.5"
                                    }}
                                >
                                    Your deposit was completed successfully.
                                </p>
                            </div>
                        </div>


                        {/* Notification 2 */}
                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                padding: "15px 18px",
                                borderBottom: "1px solid #edf2f7"
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "22px"
                                }}
                            >
                                🔄
                            </span>

                            <div>
                                <strong
                                    style={{
                                        fontSize: "14px",
                                        color: "#1a202c",
                                        fontFamily: "Poppins, sans-serif"
                                    }}
                                >
                                    Transfer completed
                                </strong>

                                <p
                                    style={{
                                        margin: "4px 0 0",
                                        fontSize: "12px",
                                        color: "#718096",
                                        lineHeight: "1.5"
                                    }}
                                >
                                    Your recent transfer was successful.
                                </p>
                            </div>
                        </div>


                        {/* Notification 3 */}
                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                padding: "15px 18px"
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "22px"
                                }}
                            >
                                🔐
                            </span>

                            <div>
                                <strong
                                    style={{
                                        fontSize: "14px",
                                        color: "#1a202c",
                                        fontFamily: "Poppins, sans-serif"
                                    }}
                                >
                                    Security alert
                                </strong>

                                <p
                                    style={{
                                        margin: "4px 0 0",
                                        fontSize: "12px",
                                        color: "#718096",
                                        lineHeight: "1.5"
                                    }}
                                >
                                    Your account was logged in successfully.
                                </p>
                            </div>
                        </div>

                    </div>
                )}

            </div>

        </header>
    );
}

export default Topbar;