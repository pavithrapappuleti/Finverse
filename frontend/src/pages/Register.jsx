import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    account_type: "Savings Account",
    account_pin: "",
    date_of_birth: "",
    address: "",

    // KYC details
    document_type: "Aadhaar",
    document_number: "",
    document: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  // =========================================================
  // HANDLE NORMAL INPUT CHANGES
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // HANDLE PHONE NUMBER
  // =========================================================

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");

    if (value.length <= 10) {
      setFormData((prev) => ({
        ...prev,
        phone: value,
      }));
    }
  };

  // =========================================================
  // HANDLE PIN
  // =========================================================

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");

    if (value.length <= 4) {
      setFormData((prev) => ({
        ...prev,
        account_pin: value,
      }));
    }
  };

  // =========================================================
  // HANDLE DOCUMENT TYPE CHANGE
  // =========================================================

  const handleDocumentTypeChange = (e) => {
    const documentType = e.target.value;

    setFormData((prev) => ({
      ...prev,
      document_type: documentType,
      document_number: "",
    }));
  };

  // =========================================================
  // HANDLE DOCUMENT NUMBER
  // =========================================================

  const handleDocumentNumberChange = (e) => {
    let value = e.target.value;

    // Remove spaces
    value = value.replace(/\s/g, "");

    // Convert to uppercase
    value = value.toUpperCase();

    setFormData((prev) => ({
      ...prev,
      document_number: value,
    }));
  };

  // =========================================================
  // HANDLE KYC DOCUMENT UPLOAD
  // =========================================================

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setFormData((prev) => ({
        ...prev,
        document: null,
      }));

      return;
    }

    // Allowed file types
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, JPG, JPEG and PNG files are allowed.");

      e.target.value = "";

      setFormData((prev) => ({
        ...prev,
        document: null,
      }));

      return;
    }

    // Maximum file size = 5 MB
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("KYC document size must be less than 5 MB.");

      e.target.value = "";

      setFormData((prev) => ({
        ...prev,
        document: null,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      document: file,
    }));
  };

  // =========================================================
  // VALIDATE DOCUMENT NUMBER
  // =========================================================

  const validateDocumentNumber = () => {
    const documentNumber = formData.document_number.trim();
    const documentType = formData.document_type;

    // -------------------------
    // AADHAAR
    // -------------------------

    if (documentType === "Aadhaar") {
      if (!/^\d{12}$/.test(documentNumber)) {
        alert("Aadhaar number must contain exactly 12 digits.");
        return false;
      }
    }

    // -------------------------
    // PAN
    // -------------------------

    if (documentType === "PAN") {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(documentNumber)) {
        alert(
          "PAN number must contain 10 characters in the format ABCDE1234F."
        );
        return false;
      }
    }

    // -------------------------
    // PASSPORT
    // -------------------------

    if (documentType === "Passport") {
      if (!/^[A-Z0-9]{8}$/.test(documentNumber)) {
        alert(
          "Passport number must contain exactly 8 letters or digits."
        );
        return false;
      }
    }

    // -------------------------
    // DRIVING LICENCE
    // -------------------------

    if (documentType === "Driving Licence") {
      if (!/^[A-Z0-9]{13,16}$/.test(documentNumber)) {
        alert(
          "Driving Licence number must contain 13 to 16 letters or digits."
        );
        return false;
      }
    }

    // -------------------------
    // VOTER ID
    // -------------------------

    if (documentType === "Voter ID") {
      if (!/^[A-Z0-9]{10}$/.test(documentNumber)) {
        alert(
          "Voter ID must contain exactly 10 letters or digits."
        );
        return false;
      }
    }

    return true;
  };

  // =========================================================
  // SUBMIT REGISTRATION
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // =====================================================
    // FULL NAME
    // =====================================================

    if (!formData.full_name.trim()) {
      alert("Please enter your full name.");
      return;
    }

    // =====================================================
    // PHONE VALIDATION
    // =====================================================

    if (!/^\d{10}$/.test(formData.phone)) {
      alert("Phone number must contain exactly 10 digits.");
      return;
    }

    // =====================================================
    // PASSWORD VALIDATION
    // =====================================================

    if (formData.password !== formData.confirm_password) {
      alert("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    // =====================================================
    // PIN VALIDATION
    // =====================================================

    if (!/^\d{4}$/.test(formData.account_pin)) {
      alert("Account PIN must be exactly 4 digits.");
      return;
    }

    // =====================================================
    // ACCOUNT TYPE VALIDATION
    // =====================================================

    if (!formData.account_type) {
      alert("Please select an account type.");
      return;
    }

    // =====================================================
    // DOCUMENT NUMBER VALIDATION
    // =====================================================

    if (!formData.document_number.trim()) {
      alert("Please enter your document number.");
      return;
    }

    if (!validateDocumentNumber()) {
      return;
    }

    // =====================================================
    // DOCUMENT FILE VALIDATION
    // =====================================================

    if (!formData.document) {
      alert("Please upload your KYC document.");
      return;
    }

    setLoading(true);

    try {
      // ===================================================
      // CREATE FORMDATA
      // ===================================================

      const dataToSend = new FormData();

      // ---------------------------------------------------
      // Personal details
      // ---------------------------------------------------

      dataToSend.append(
        "full_name",
        formData.full_name.trim()
      );

      dataToSend.append(
        "email",
        formData.email.trim().toLowerCase()
      );

      dataToSend.append(
        "phone",
        formData.phone
      );

      dataToSend.append(
        "password",
        formData.password
      );

      dataToSend.append(
        "date_of_birth",
        formData.date_of_birth
      );

      dataToSend.append(
        "address",
        formData.address.trim()
      );

      // ---------------------------------------------------
      // Account details
      // ---------------------------------------------------

      dataToSend.append(
        "account_type",
        formData.account_type
      );

      dataToSend.append(
        "account_pin",
        formData.account_pin
      );

      // ---------------------------------------------------
      // KYC details
      // ---------------------------------------------------

      dataToSend.append(
        "document_type",
        formData.document_type
      );

      dataToSend.append(
        "document_number",
        formData.document_number.trim()
      );

      dataToSend.append(
        "document",
        formData.document
      );

      // ===================================================
      // SEND TO FLASK BACKEND
      // ===================================================

      const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/register`,
        {
          method: "POST",
          body: dataToSend,
        }
      );

      const data = await response.json();

      console.log(
        "Registration Response:",
        data
      );

      // ===================================================
      // SUCCESS
      // ===================================================

      if (response.ok) {
        alert(
          "Registration successful! Your account and KYC are pending admin approval."
        );

        navigate("/login");
      }

      // ===================================================
      // ERROR
      // ===================================================

      else {
        alert(
          data.message ||
            "Registration failed."
        );
      }

    } catch (error) {

      console.error(
        "Registration Error:",
        error
      );

      alert(
        "Unable to connect to server. Please make sure Flask is running."
      );

    } finally {

      setLoading(false);

    }
  };

  // =========================================================
  // DOCUMENT PLACEHOLDER
  // =========================================================

  const getDocumentPlaceholder = () => {

    switch (formData.document_type) {

      case "Aadhaar":
        return "Enter 12-digit Aadhaar number";

      case "PAN":
        return "Enter PAN number";

      case "Passport":
        return "Enter 8-character Passport number";

      case "Driving Licence":
        return "Enter Driving Licence number";

      case "Voter ID":
        return "Enter 10-character Voter ID";

      default:
        return "Enter document number";
    }
  };

  // =========================================================
  // DOCUMENT HELP TEXT
  // =========================================================

  const getDocumentHelpText = () => {

    switch (formData.document_type) {

      case "Aadhaar":
        return "Aadhaar: exactly 12 digits.";

      case "PAN":
        return "PAN: 10 characters, for example ABCDE1234F.";

      case "Passport":
        return "Passport: exactly 8 letters or digits.";

      case "Driving Licence":
        return "Driving Licence: 13 to 16 letters or digits.";

      case "Voter ID":
        return "Voter ID: exactly 10 letters or digits.";

      default:
        return "";
    }
  };

  return (
    <div className="register-page">

      {/* =====================================================
          BACKGROUND GLOW
      ====================================================== */}

      <div className="register-glow register-glow-one"></div>

      <div className="register-glow register-glow-two"></div>

      <div className="register-container">

        {/* ===================================================
            LOGO
        ==================================================== */}

        <div className="register-logo">

          <img
            src="/images/finverse-logo.png"
            alt="FINVERSE"
          />

        </div>

        {/* ===================================================
            HEADING
        ==================================================== */}

        <div className="register-heading">

          <h1>Create Account</h1>

          <p>
            Join FINVERSE for smarter banking
          </p>

        </div>

        {/* ===================================================
            REGISTER CARD
        ==================================================== */}

        <div className="register-card">

          <form onSubmit={handleSubmit}>

            {/* =================================================
                FULL NAME
            ================================================== */}

            <div className="register-input-group">

              <label htmlFor="full_name">
                Full Name
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  👤
                </span>

                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            {/* =================================================
                EMAIL + PHONE
            ================================================== */}

            <div className="register-row">

              {/* EMAIL */}

              <div className="register-input-group">

                <label htmlFor="email">
                  Email Address
                </label>

                <div className="register-input-wrapper">

                  <span className="register-input-icon">
                    ✉
                  </span>

                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* PHONE */}

              <div className="register-input-group">

                <label htmlFor="phone">
                  Phone Number
                </label>

                <div className="register-input-wrapper">

                  <span className="register-input-icon">
                    ☎
                  </span>

                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Enter 10-digit phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    maxLength="10"
                    inputMode="numeric"
                    required
                  />

                </div>

              </div>

            </div>

            {/* =================================================
                DATE OF BIRTH
            ================================================== */}

            <div className="register-input-group">

              <label htmlFor="date_of_birth">
                Date of Birth
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  📅
                </span>

                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            {/* =================================================
                ADDRESS
            ================================================== */}

            <div className="register-input-group">

              <label htmlFor="address">
                Address
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon address-icon">
                  📍
                </span>

                <textarea
                  id="address"
                  name="address"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  required
                ></textarea>

              </div>

            </div>

            {/* =================================================
                PASSWORD + CONFIRM PASSWORD
            ================================================== */}

            <div className="register-row">

              {/* PASSWORD */}

              <div className="register-input-group">

                <label htmlFor="password">
                  Password
                </label>

                <div className="register-input-wrapper">

                  <span className="register-input-icon">
                    🔒
                  </span>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    id="password"
                    name="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >
                    {showPassword
                      ? "🙈"
                      : "👁"}
                  </button>

                </div>

              </div>

              {/* CONFIRM PASSWORD */}

              <div className="register-input-group">

                <label htmlFor="confirm_password">
                  Confirm Password
                </label>

                <div className="register-input-wrapper">

                  <span className="register-input-icon">
                    🔒
                  </span>

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    id="confirm_password"
                    name="confirm_password"
                    placeholder="Confirm password"
                    value={
                      formData.confirm_password
                    }
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword
                      ? "🙈"
                      : "👁"}
                  </button>

                </div>

              </div>

            </div>

            {/* =================================================
                ACCOUNT TYPE
            ================================================== */}

            <div className="register-input-group">

              <label htmlFor="account_type">
                Account Type
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  🏦
                </span>

                <select
                  id="account_type"
                  name="account_type"
                  value={formData.account_type}
                  onChange={handleChange}
                  required
                >

                  <option value="Savings Account">
                    Savings Account
                  </option>

                  <option value="Current Account">
                    Current Account
                  </option>

                  <option value="Loan Account">
                    Loan Account
                  </option>

                </select>

              </div>

            </div>

            {/* =================================================
                ACCOUNT PIN
            ================================================== */}

            <div className="register-input-group">

              <label htmlFor="account_pin">
                Account PIN
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  🔐
                </span>

                <input
                  type={
                    showPin
                      ? "text"
                      : "password"
                  }
                  id="account_pin"
                  name="account_pin"
                  placeholder="Create 4-digit PIN"
                  value={formData.account_pin}
                  onChange={handlePinChange}
                  maxLength="4"
                  inputMode="numeric"
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowPin(!showPin)
                  }
                >
                  {showPin
                    ? "🙈"
                    : "👁"}
                </button>

              </div>

              <small
                style={{
                  color: "#6b7c93",
                  marginTop: "6px",
                  display: "block",
                }}
              >
                Create a 4-digit PIN for
                transaction verification.
              </small>

            </div>

            {/* =================================================
                KYC SECTION
            ================================================== */}

            <div
              style={{
                marginTop: "25px",
                marginBottom: "20px",
                paddingBottom: "10px",
                borderBottom:
                  "1px solid rgba(0, 200, 255, 0.2)",
              }}
            >

              <h3
                style={{
                  color: "#00c8ff",
                  marginBottom: "5px",
                  fontSize: "18px",
                }}
              >
                KYC Verification
              </h3>

              <p
                style={{
                  color: "#6b7c93",
                  fontSize: "13px",
                  margin: 0,
                }}
              >
                Submit your identification details
                for account verification.
              </p>

            </div>

            {/* =================================================
                DOCUMENT TYPE
            ================================================== */}

            <div className="register-input-group">

              <label htmlFor="document_type">
                Document Type
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  🪪
                </span>

                <select
                  id="document_type"
                  name="document_type"
                  value={formData.document_type}
                  onChange={
                    handleDocumentTypeChange
                  }
                  required
                >

                  <option value="Aadhaar">
                    Aadhaar
                  </option>

                  <option value="PAN">
                    PAN
                  </option>

                  <option value="Passport">
                    Passport
                  </option>

                  <option value="Driving Licence">
                    Driving Licence
                  </option>

                  <option value="Voter ID">
                    Voter ID
                  </option>

                </select>

              </div>

            </div>

            {/* =================================================
                DOCUMENT NUMBER
            ================================================== */}

            <div className="register-input-group">

              <label htmlFor="document_number">
                Document Number
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  🔢
                </span>

                <input
                  type="text"
                  id="document_number"
                  name="document_number"
                  placeholder={
                    getDocumentPlaceholder()
                  }
                  value={
                    formData.document_number
                  }
                  onChange={
                    handleDocumentNumberChange
                  }
                  maxLength={
                    formData.document_type ===
                    "Aadhaar"
                      ? 12
                      : formData.document_type ===
                        "PAN"
                      ? 10
                      : formData.document_type ===
                        "Passport"
                      ? 8
                      : formData.document_type ===
                        "Voter ID"
                      ? 10
                      : 16
                  }
                  inputMode={
                    formData.document_type ===
                    "Aadhaar"
                      ? "numeric"
                      : "text"
                  }
                  required
                />

              </div>

              <small
                style={{
                  color: "#6b7c93",
                  marginTop: "6px",
                  display: "block",
                }}
              >
                {getDocumentHelpText()}
              </small>

            </div>

            {/* =================================================
                DOCUMENT UPLOAD
            ================================================== */}

            <div className="register-input-group">

              <label htmlFor="document">
                Upload KYC Document
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  📄
                </span>

                <input
                  type="file"
                  id="document"
                  name="document"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={
                    handleDocumentChange
                  }
                  required
                />

              </div>

              <small
                style={{
                  color: "#6b7c93",
                  marginTop: "6px",
                  display: "block",
                }}
              >
                Accepted formats: PDF, JPG,
                JPEG, PNG. Maximum size: 5 MB.
              </small>

              {formData.document && (

                <small
                  style={{
                    color: "#00c8ff",
                    marginTop: "5px",
                    display: "block",
                  }}
                >
                  Selected:{" "}
                  {formData.document.name}
                </small>

              )}

            </div>

            {/* =================================================
                KYC INFORMATION
            ================================================== */}

            <div
              style={{
                marginTop: "10px",
                marginBottom: "20px",
                padding: "12px",
                borderRadius: "8px",
                background:
                  "rgba(0, 200, 255, 0.05)",
                border:
                  "1px solid rgba(0, 200, 255, 0.12)",
              }}
            >

              <small
                style={{
                  color: "#6b7c93",
                  lineHeight: "1.5",
                }}
              >
                🔐 Your KYC details will remain
                pending until reviewed by the
                FINVERSE Admin.
              </small>

            </div>

            {/* =================================================
                TERMS
            ================================================== */}

            <label className="register-terms">

              <input
                type="checkbox"
                required
              />

              <span>
                I agree to the FINVERSE Terms &
                Conditions and Privacy Policy.
              </span>

            </label>

            {/* =================================================
                REGISTER BUTTON
            ================================================== */}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >

              {loading
                ? "Creating Account..."
                : "Create Account"}

              {!loading && (
                <span>→</span>
              )}

            </button>

          </form>

          {/* =================================================
              LOGIN LINK
          ================================================== */}

          <div className="already-account">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
            >
              Login
            </button>

          </div>

        </div>

        {/* ===================================================
            SECURITY
        ==================================================== */}

        <div className="register-security">

          🔐 Your information is protected with
          secure encryption

        </div>

      </div>

    </div>
  );
}

export default Register;