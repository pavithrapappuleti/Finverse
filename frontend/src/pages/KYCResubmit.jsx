import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function KYCResubmit() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");

    const [formData, setFormData] = useState({
        document_type: "Aadhaar",
        document_number: "",
        document: null
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const documentTypes = [
        "Aadhaar",
        "PAN",
        "Passport",
        "Driving Licence",
        "Voter ID"
    ];

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        setError("");
        setMessage("");
    };


    const handleFileChange = (e) => {

        const file = e.target.files[0];

        setError("");
        setMessage("");

        if (!file) {
            setFormData({
                ...formData,
                document: null
            });
            return;
        }

        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png"
        ];

        if (!allowedTypes.includes(file.type)) {

            setError(
                "Only PDF, JPG, JPEG and PNG files are allowed."
            );

            e.target.value = "";

            return;
        }

        const maxSize = 5 * 1024 * 1024;

        if (file.size > maxSize) {

            setError(
                "Document size must be less than 5 MB."
            );

            e.target.value = "";

            return;
        }

        setFormData({
            ...formData,
            document: file
        });
    };


    const validateDocumentNumber = () => {

        const documentNumber =
            formData.document_number.trim().toUpperCase();

        if (!documentNumber) {

            return "Document number is required.";
        }

        if (formData.document_type === "Aadhaar") {

            if (!/^\d{12}$/.test(documentNumber)) {

                return "Aadhaar number must contain exactly 12 digits.";
            }
        }

        if (formData.document_type === "PAN") {

            if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(documentNumber)) {

                return "Please enter a valid PAN number.";
            }
        }

        if (formData.document_type === "Passport") {

            if (!/^[A-Z0-9]{8}$/.test(documentNumber)) {

                return "Passport number must contain 8 characters.";
            }
        }

        if (formData.document_type === "Driving Licence") {

            if (!/^[A-Z0-9]{13,16}$/.test(documentNumber)) {

                return "Please enter a valid Driving Licence number.";
            }
        }

        if (formData.document_type === "Voter ID") {

            if (!/^[A-Z0-9]{10}$/.test(documentNumber)) {

                return "Please enter a valid Voter ID number.";
            }
        }

        return "";
    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setMessage("");

        if (!token) {

            setError(
                "Invalid resubmission link. The token is missing."
            );

            return;
        }

        const validationError =
            validateDocumentNumber();

        if (validationError) {

            setError(validationError);

            return;
        }

        if (!formData.document) {

            setError(
                "Please select your KYC document."
            );

            return;
        }

        try {

            setLoading(true);

            const dataToSend = new FormData();

            dataToSend.append(
                "token",
                token
            );

            dataToSend.append(
                "document_type",
                formData.document_type
            );

            dataToSend.append(
                "document_number",
                formData.document_number
                    .trim()
                    .toUpperCase()
            );

            dataToSend.append(
                "document",
                formData.document
            );


            const response = await fetch(
                 `${import.meta.env.VITE_API_URL}/api/kyc/resubmit`,
                {
                    method: "PUT",
                    body: dataToSend
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "KYC resubmission failed."
                );
            }


            setSuccess(true);

            setMessage(
                data.message ||
                "KYC resubmitted successfully."
            );


            setFormData({
                document_type: "Aadhaar",
                document_number: "",
                document: null
            });


        } catch (error) {

            console.error(
                "KYC Resubmission Error:",
                error
            );

            setError(
                error.message ||
                "Something went wrong while submitting your KYC."
            );

        } finally {

            setLoading(false);
        }
    };


    if (!token) {

        return (

            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background:
                        "linear-gradient(135deg, #020b1c, #06182d)",
                    padding: "20px",
                    boxSizing: "border-box"
                }}
            >

                <div
                    style={{
                        width: "100%",
                        maxWidth: "500px",
                        background: "#ffffff",
                        borderRadius: "18px",
                        padding: "40px",
                        textAlign: "center",
                        boxSizing: "border-box",
                        boxShadow:
                            "0 15px 40px rgba(0,0,0,0.25)"
                    }}
                >

                    <div
                        style={{
                            fontSize: "50px",
                            marginBottom: "15px"
                        }}
                    >
                        ⚠️
                    </div>

                    <h2
                        style={{
                            margin: "0 0 12px",
                            color: "#06182d"
                        }}
                    >
                        Invalid Resubmission Link
                    </h2>

                    <p
                        style={{
                            color: "#666",
                            lineHeight: "1.6",
                            marginBottom: "25px"
                        }}
                    >
                        The KYC resubmission link is invalid
                        or the required token is missing.
                    </p>

                    <button
                        onClick={() => navigate("/login")}
                        style={{
                            border: "none",
                            borderRadius: "8px",
                            padding: "12px 25px",
                            background: "#0d6efd",
                            color: "#ffffff",
                            fontSize: "15px",
                            fontWeight: "600",
                            cursor: "pointer"
                        }}
                    >
                        Go to Login
                    </button>

                </div>

            </div>
        );
    }


    if (success) {

        return (

            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background:
                        "linear-gradient(135deg, #020b1c, #06182d)",
                    padding: "20px",
                    boxSizing: "border-box"
                }}
            >

                <div
                    style={{
                        width: "100%",
                        maxWidth: "520px",
                        background: "#ffffff",
                        borderRadius: "18px",
                        padding: "45px 35px",
                        textAlign: "center",
                        boxSizing: "border-box",
                        boxShadow:
                            "0 15px 40px rgba(0,0,0,0.25)"
                    }}
                >

                    <div
                        style={{
                            width: "70px",
                            height: "70px",
                            borderRadius: "50%",
                            background: "#e8f8ee",
                            color: "#198754",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "38px",
                            margin: "0 auto 20px"
                        }}
                    >
                        ✓
                    </div>

                    <h2
                        style={{
                            color: "#06182d",
                            marginBottom: "15px"
                        }}
                    >
                        KYC Submitted Successfully
                    </h2>

                    <p
                        style={{
                            color: "#555",
                            lineHeight: "1.7",
                            marginBottom: "10px"
                        }}
                    >
                        {message}
                    </p>

                    <p
                        style={{
                            color: "#777",
                            fontSize: "14px",
                            lineHeight: "1.6",
                            marginBottom: "25px"
                        }}
                    >
                        Your new KYC document is now under
                        admin review. Your account will remain
                        inactive until the verification is completed.
                    </p>

                    <button
                        onClick={() => navigate("/login")}
                        style={{
                            border: "none",
                            borderRadius: "8px",
                            padding: "12px 28px",
                            background: "#0d6efd",
                            color: "#ffffff",
                            fontSize: "15px",
                            fontWeight: "600",
                            cursor: "pointer"
                        }}
                    >
                        Go to Login
                    </button>

                </div>

            </div>
        );
    }


    return (

        <div
            style={{
                minHeight: "100vh",
                background:
                    "linear-gradient(135deg, #020b1c, #06182d)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "30px 20px",
                boxSizing: "border-box"
            }}
        >

            <div
                style={{
                    width: "100%",
                    maxWidth: "650px",
                    background: "#ffffff",
                    borderRadius: "18px",
                    padding: "35px",
                    boxSizing: "border-box",
                    boxShadow:
                        "0 15px 40px rgba(0,0,0,0.25)"
                }}
            >

                {/* HEADER */}

                <div
                    style={{
                        textAlign: "center",
                        marginBottom: "30px"
                    }}
                >

                    <h1
                        style={{
                            margin: "0 0 8px",
                            color: "#06182d",
                            fontSize: "30px"
                        }}
                    >
                        FINVERSE
                    </h1>

                    <h2
                        style={{
                            margin: "0 0 10px",
                            color: "#0d6efd",
                            fontSize: "22px"
                        }}
                    >
                        KYC Resubmission
                    </h2>

                    <p
                        style={{
                            margin: 0,
                            color: "#666",
                            fontSize: "14px",
                            lineHeight: "1.6"
                        }}
                    >
                        Your previous KYC document was rejected.
                        Please submit a valid document for verification.
                    </p>

                </div>


                {/* REJECTION INFORMATION */}

                <div
                    style={{
                        background: "#fff4f4",
                        borderLeft: "4px solid #dc3545",
                        padding: "15px",
                        borderRadius: "6px",
                        marginBottom: "25px"
                    }}
                >

                    <strong
                        style={{
                            color: "#dc3545"
                        }}
                    >
                        Important
                    </strong>

                    <p
                        style={{
                            margin:
                                "7px 0 0",
                            color: "#555",
                            fontSize: "14px",
                            lineHeight: "1.5"
                        }}
                    >
                        Please make sure that the new document
                        is clear, valid and matches the information
                        provided during registration.
                    </p>

                </div>


                {/* ERROR */}

                {error && (

                    <div
                        style={{
                            background: "#fff1f1",
                            color: "#dc3545",
                            padding: "12px 15px",
                            borderRadius: "8px",
                            marginBottom: "20px",
                            fontSize: "14px",
                            border:
                                "1px solid #f5c2c7"
                        }}
                    >
                        {error}
                    </div>

                )}


                {/* MESSAGE */}

                {message && !success && (

                    <div
                        style={{
                            background: "#eef7ff",
                            color: "#0d6efd",
                            padding: "12px 15px",
                            borderRadius: "8px",
                            marginBottom: "20px",
                            fontSize: "14px"
                        }}
                    >
                        {message}
                    </div>

                )}


                {/* FORM */}

                <form onSubmit={handleSubmit}>

                    {/* DOCUMENT TYPE */}

                    <div
                        style={{
                            marginBottom: "20px"
                        }}
                    >

                        <label
                            style={{
                                display: "block",
                                marginBottom: "8px",
                                color: "#222",
                                fontWeight: "600",
                                fontSize: "14px"
                            }}
                        >
                            Document Type
                        </label>

                        <select
                            name="document_type"
                            value={formData.document_type}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "13px",
                                border:
                                    "1px solid #d5dbe3",
                                borderRadius: "8px",
                                fontSize: "15px",
                                outline: "none",
                                boxSizing: "border-box",
                                background: "#ffffff"
                            }}
                        >

                            {documentTypes.map(
                                (type) => (

                                    <option
                                        key={type}
                                        value={type}
                                    >
                                        {type}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* DOCUMENT NUMBER */}

                    <div
                        style={{
                            marginBottom: "20px"
                        }}
                    >

                        <label
                            style={{
                                display: "block",
                                marginBottom: "8px",
                                color: "#222",
                                fontWeight: "600",
                                fontSize: "14px"
                            }}
                        >
                            Document Number
                        </label>

                        <input
                            type="text"
                            name="document_number"
                            value={
                                formData.document_number
                            }
                            onChange={handleChange}
                            placeholder={
                                "Enter " +
                                formData.document_type +
                                " number"
                            }
                            style={{
                                width: "100%",
                                padding: "13px",
                                border:
                                    "1px solid #d5dbe3",
                                borderRadius: "8px",
                                fontSize: "15px",
                                outline: "none",
                                boxSizing: "border-box",
                                textTransform: "uppercase"
                            }}
                        />

                    </div>


                    {/* DOCUMENT UPLOAD */}

                    <div
                        style={{
                            marginBottom: "25px"
                        }}
                    >

                        <label
                            style={{
                                display: "block",
                                marginBottom: "8px",
                                color: "#222",
                                fontWeight: "600",
                                fontSize: "14px"
                            }}
                        >
                            Upload New KYC Document
                        </label>

                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            style={{
                                width: "100%",
                                padding: "10px",
                                border:
                                    "1px solid #d5dbe3",
                                borderRadius: "8px",
                                boxSizing: "border-box",
                                background: "#f8f9fa"
                            }}
                        />

                        <p
                            style={{
                                margin:
                                    "8px 0 0",
                                color: "#777",
                                fontSize: "12px"
                            }}
                        >
                            Accepted formats: PDF, JPG, JPEG,
                            PNG. Maximum size: 5 MB.
                        </p>

                        {formData.document && (

                            <p
                                style={{
                                    margin:
                                        "8px 0 0",
                                    color: "#198754",
                                    fontSize: "13px",
                                    fontWeight: "500"
                                }}
                            >
                                Selected:
                                {" "}
                                {formData.document.name}
                            </p>

                        )}

                    </div>


                    {/* SUBMIT BUTTON */}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "14px",
                            border: "none",
                            borderRadius: "8px",
                            background:
                                loading
                                    ? "#8aaee0"
                                    : "#0d6efd",
                            color: "#ffffff",
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor:
                                loading
                                    ? "not-allowed"
                                    : "pointer"
                        }}
                    >

                        {loading
                            ? "Submitting..."
                            : "Resubmit KYC"
                        }

                    </button>

                </form>


                {/* FOOTER INFO */}

                <div
                    style={{
                        marginTop: "25px",
                        paddingTop: "20px",
                        borderTop:
                            "1px solid #eeeeee",
                        textAlign: "center"
                    }}
                >

                    <p
                        style={{
                            margin: 0,
                            color: "#888",
                            fontSize: "12px",
                            lineHeight: "1.6"
                        }}
                    >
                        Your resubmission link is temporary
                        and can be used only once.
                    </p>

                </div>

            </div>

        </div>
    );
}

export default KYCResubmit;