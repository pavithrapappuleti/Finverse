import { useEffect, useState } from "react";
import { Link,useNavigate } from "react-router-dom";

function HeroSection() {
  const navigate = useNavigate();

  const [width, setWidth] = useState(window.innerWidth);
  const [hovered, setHovered] = useState("");

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mobile = width <= 600;
  const tablet = width > 600 && width <= 900;

  return (
    <>
      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section
        id="home"
        style={{
          minHeight: mobile ? "auto" : "calc(100vh - 80px)",

          padding: mobile
            ? "70px 6% 80px"
            : tablet
            ? "80px 6%"
            : "90px 8%",

          display: "flex",

          flexDirection:
            mobile || tablet ? "column" : "row",

          alignItems: "center",

          justifyContent: "space-between",

          gap: mobile
            ? "60px"
            : tablet
            ? "55px"
            : "70px",

          position: "relative",

          background: "rgba(5,20,50,0)",

          boxSizing: "border-box",

          overflow: "hidden",
        }}
      >

        {/* =====================================================
            BACKGROUND DECORATION
        ===================================================== */}

        <div
          style={{
            position: "absolute",

            width: mobile ? "220px" : "400px",

            height: mobile ? "220px" : "400px",

            borderRadius: "50%",

            background: "rgba(23,105,255,0.18)",

            filter: "blur(90px)",

            top: mobile ? "-80px" : "-150px",

            right: mobile ? "-80px" : "-120px",

            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",

            width: mobile ? "180px" : "300px",

            height: mobile ? "180px" : "300px",

            borderRadius: "50%",

            background: "rgba(0,190,255,0.12)",

            filter: "blur(80px)",

            bottom: mobile ? "-70px" : "-120px",

            left: mobile ? "-70px" : "-100px",

            pointerEvents: "none",
          }}
        />

        {/* =====================================================
            LEFT CONTENT
        ===================================================== */}

        <div
          style={{
            width: "100%",

            maxWidth: "650px",

            textAlign:
              mobile || tablet ? "center" : "left",

            position: "relative",

            zIndex: 2,
          }}
        >

          {/* BADGE */}

          <div
            style={{
              display: "inline-block",

              padding: mobile
                ? "8px 14px"
                : "9px 17px",

              borderRadius: "30px",

              background:
                "rgba(255,255,255,0.10)",

              border:
                "1px solid rgba(255,255,255,0.20)",

              backdropFilter: "blur(10px)",

              color: "blue",

              fontSize: mobile ? "11px" : "13px",

              fontWeight: "900",

              marginBottom: "22px",

              boxShadow:
                "0 8px 25px rgba(0,0,0,0.12)",
            }}
          >
            ✦ Secure • Smart • Simple Banking
          </div>

          {/* HEADING */}

          <h1
            style={{
              fontSize: mobile
                ? "42px"
                : tablet
                ? "55px"
                : "clamp(48px,6vw,76px)",

              lineHeight: "1.06",

              letterSpacing: mobile
                ? "-1.5px"
                : "-2.5px",

              color: "#071b45",

              margin: "0 0 23px",

              fontWeight: "800",

              textShadow:
                "0 5px 25px rgba(0,0,0,0.25)",
            }}
          >
            Banking Made

            <span
              style={{
                color: "#1769ff",
              }}
            >
              {" "}
              Smarter.
            </span>
          </h1>

          {/* DESCRIPTION */}

          <p
            style={{
              color: "#334155",

              fontSize: mobile
                ? "15px"
                : "17px",

              lineHeight: "1.8",

              margin:
                mobile || tablet
                  ? "0 auto 32px"
                  : "0 0 32px",

              maxWidth: "590px",

              textShadow:
                "0 1px 5px rgba(255,255,255,0.5)",
            }}
          >
            Experience a modern online banking ecosystem
            designed to make your money management simple,
            secure and effortless.
          </p>

          {/* =====================================================
              BUTTONS
          ===================================================== */}

          <div
            style={{
              display: "flex",

              flexDirection:
                mobile ? "column" : "row",

              gap: "13px",

              alignItems: "center",

              justifyContent:
                mobile || tablet
                  ? "center"
                  : "flex-start",

              width:
                mobile ? "100%" : "auto",
            }}
          >

            {/* GET STARTED */}

            <button
              onClick={() => navigate("/login")}

              onMouseEnter={() =>
                setHovered("start")
              }

              onMouseLeave={() =>
                setHovered("")
              }

              style={{
                width:
                  mobile ? "100%" : "auto",

                padding: "14px 27px",

                border: "none",

                borderRadius: "9px",

                background:
                  hovered === "start"
                    ? "#318cff"
                    : "#1769ff",

                color: "white",

                fontWeight: "700",

                cursor: "pointer",

                transition:
                  "all 0.3s ease",

                transform:
                  hovered === "start"
                    ? "translateY(-4px)"
                    : "translateY(0)",

                boxShadow:
                  hovered === "start"
                    ? "0 18px 38px rgba(23,105,255,0.42)"
                    : "0 10px 28px rgba(23,105,255,0.28)",
              }}
            >
              Get Started →
            </button>

            {/* EXPLORE */}
<Link
  to="/features"

  onMouseEnter={() =>
    setHovered("explore")
  }

  onMouseLeave={() =>
    setHovered("")
  }

  style={{
    width:
      mobile ? "100%" : "auto",

    padding: "13px 25px",

    border:
      hovered === "explore"
        ? "1px solid rgba(255,255,255,0.65)"
        : "1px solid rgba(255,255,255,0.28)",

    borderRadius: "9px",

    color: "black",

    background: "white",

    backdropFilter: "blur(8px)",

    fontSize: "14px",

    fontWeight: "700",

    textDecoration: "none",

    boxSizing: "border-box",

    textAlign: "center",

    transition:
      "all 0.3s ease",

    transform:
      hovered === "explore"
        ? "translateY(-4px)"
        : "translateY(0)",

    boxShadow:
      hovered === "explore"
        ? "0 15px 30px rgba(0,0,0,0.18)"
        : "none",
  }}
>
  Explore Features
</Link>
          </div>

          {/* =====================================================
              TRUST POINTS
          ===================================================== */}

          <div
            style={{
              display: "flex",

              gap:
                mobile ? "14px" : "25px",

              marginTop: "38px",

              flexWrap: "wrap",

              justifyContent:
                mobile || tablet
                  ? "center"
                  : "flex-start",
            }}
          >
            {[
              "🔒 Secure Banking",
              "⚡ Fast Transactions",
              "🛡️ Protected Data",
            ].map((item) => (
              <span
                key={item}
                style={{
                  color: "darkblue",

                  fontSize:
                    mobile ? "15px" : "18px",

                  fontWeight: "700",

                  textShadow:
                    "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* =====================================================
            RIGHT BANKING CARD
        ===================================================== */}

        <div
          style={{
            width: mobile
              ? "100%"
              : tablet
              ? "430px"
              : "470px",

            maxWidth: "470px",

            height:
              mobile ? "330px" : "430px",

            position: "relative",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            flexShrink: 0,

            zIndex: 2,
          }}
        >

          {/* CARD GLOW */}

          <div
            style={{
              position: "absolute",

              width:
                mobile ? "230px" : "340px",

              height:
                mobile ? "230px" : "340px",

              borderRadius: "50%",

              background:
                "rgba(23,105,255,0.30)",

              filter: "blur(60px)",
            }}
          />

          {/* BANKING CARD */}

          <div
            onMouseEnter={() =>
              setHovered("bankcard")
            }

            onMouseLeave={() =>
              setHovered("")
            }

            style={{
              width:
                mobile
                  ? "285px"
                  : tablet
                  ? "330px"
                  : "365px",

              height:
                mobile ? "175px" : "225px",

              padding:
                mobile ? "20px" : "28px",

              borderRadius:
                mobile ? "18px" : "22px",

              background:
                "linear-gradient(135deg,#061735,#0c3477,#1769ff)",

              color: "white",

              position: "relative",

              zIndex: 2,

              boxSizing: "border-box",

              border:
                "1px solid rgba(255,255,255,0.18)",

              transform:
                hovered === "bankcard"
                  ? "rotate(-3deg) translateY(-10px) scale(1.02)"
                  : "rotate(-5deg)",

              boxShadow:
                hovered === "bankcard"
                  ? "0 40px 80px rgba(0,0,0,0.40)"
                  : "0 30px 60px rgba(0,0,0,0.30)",

              transition:
                "all 0.4s ease",

              cursor: "pointer",

              backdropFilter:
                "blur(10px)",
            }}
          >

            {/* CARD HEADER */}

            <div
              style={{
                display: "flex",

                justifyContent:
                  "space-between",

                alignItems: "center",
              }}
            >
              <strong
                style={{
                  letterSpacing: "2px",

                  fontSize:
                    mobile ? "13px" : "17px",
                }}
              >
                FINVERSE
              </strong>

              <span
                style={{
                  fontSize:
                    mobile ? "18px" : "22px",

                  color: "#6dc5ff",
                }}
              >
                ✦
              </span>
            </div>

            {/* BALANCE */}

            <div
              style={{
                marginTop:
                  mobile ? "25px" : "40px",
              }}
            >
              <small
                style={{
                  opacity: 0.7,

                  fontSize:
                    mobile ? "9px" : "11px",
                }}
              >
                Available Balance
              </small>

              <h2
                style={{
                  margin: "6px 0",

                  fontSize:
                    mobile ? "21px" : "27px",

                  letterSpacing: "0.5px",
                }}
              >
                ₹23,000.00
              </h2>
            </div>

            {/* CARD FOOTER */}

            <div
              style={{
                position: "absolute",

                bottom:
                  mobile ? "18px" : "25px",

                left:
                  mobile ? "20px" : "27px",

                right:
                  mobile ? "20px" : "27px",

                display: "flex",

                justifyContent:
                  "space-between",

                alignItems: "center",
              }}
            >
              <span
                style={{
                  letterSpacing: "2px",

                  fontSize:
                    mobile ? "10px" : "13px",
                }}
              >
                •••• 0001
              </span>

              <strong
                style={{
                  fontStyle: "italic",

                  fontSize:
                    mobile ? "15px" : "19px",
                }}
              >
                VISA
              </strong>
            </div>
          </div>

          {/* =====================================================
              DEPOSIT FLOATING CARD
          ===================================================== */}

          <div
            onMouseEnter={() =>
              setHovered("deposit")
            }

            onMouseLeave={() =>
              setHovered("")
            }

            style={{
              position: "absolute",

              top:
                mobile ? "5px" : "20px",

              right:
                mobile ? "0px" : "-5px",

              zIndex: 3,

              padding:
                mobile
                  ? "10px 13px"
                  : "14px 18px",

              borderRadius: "13px",

              background:
                "rgba(255,255,255,0.96)",

              border:
                "1px solid rgba(255,255,255,0.8)",

              boxShadow:
                hovered === "deposit"
                  ? "0 22px 45px rgba(0,0,0,0.25)"
                  : "0 15px 35px rgba(0,0,0,0.18)",

              transform:
                hovered === "deposit"
                  ? "translateY(-7px) scale(1.03)"
                  : "translateY(0)",

              transition:
                "all 0.3s ease",

              cursor: "pointer",
            }}
          >
            <div
              style={{
                color: "#1769ff",

                fontSize:
                  mobile ? "10px" : "13px",

                marginBottom: "6px",
              }}
            >
              ↗ Deposit
            </div>

            <strong
              style={{
                color: "#0f172a",

                fontSize:
                  mobile ? "12px" : "15px",
              }}
            >
              ₹5,000
            </strong>
          </div>

          {/* =====================================================
              TRANSFER FLOATING CARD
          ===================================================== */}

          <div
            onMouseEnter={() =>
              setHovered("transfer")
            }

            onMouseLeave={() =>
              setHovered("")
            }

            style={{
              position: "absolute",

              bottom:
                mobile ? "5px" : "20px",

              left:
                mobile ? "0px" : "-5px",

              zIndex: 3,

              padding:
                mobile
                  ? "10px 13px"
                  : "14px 18px",

              borderRadius: "13px",

              background:
                "rgba(255,255,255,0.96)",

              border:
                "1px solid rgba(255,255,255,0.8)",

              boxShadow:
                hovered === "transfer"
                  ? "0 22px 45px rgba(0,0,0,0.25)"
                  : "0 15px 35px rgba(0,0,0,0.18)",

              transform:
                hovered === "transfer"
                  ? "translateY(-7px) scale(1.03)"
                  : "translateY(0)",

              transition:
                "all 0.3s ease",

              cursor: "pointer",
            }}
          >
            <div
              style={{
                color: "#1769ff",

                fontSize:
                  mobile ? "10px" : "13px",

                marginBottom: "6px",
              }}
            >
              ↓ Transfer
            </div>

            <strong
              style={{
                color: "#0f172a",

                fontSize:
                  mobile ? "12px" : "15px",
              }}
            >
              ₹2,000
            </strong>
          </div>

        </div>
        {/* ✅ CLOSE RIGHT BANKING CARD DIV */}

      </section>
      {/* ✅ CLOSE HERO SECTION */}


      {/* =====================================================
          CTA SECTION
      ===================================================== */}

      <section
        style={{
          padding:
            mobile
              ? "70px 6%"
              : "100px 8%",

          textAlign: "center",

          background: "rgba(5,20,50,0.10)",
        }}
      >

        <h2
          style={{
            color: "black",

            fontSize:
              mobile ? "30px" : "42px",

            lineHeight: "1.2",

            maxWidth: "800px",

            margin: "auto",

            fontWeight: "800",
          }}
        >
          Ready to take control of your finances?
        </h2>

        <p
          style={{
            color: "black",

            margin: "17px 0 28px",

            fontSize:
              mobile ? "14px" : "18px",
          }}
        >
          Start your smarter banking experience with FINVERSE.
        </p>

        <button
          onClick={() =>
            navigate("/register")
          }

          onMouseEnter={() =>
            setHovered("cta")
          }

          onMouseLeave={() =>
            setHovered("")
          }

          style={{
            padding: "14px 27px",

            border: "none",

            borderRadius: "9px",

            background:
  hovered === "cta"
    ? "linear-gradient(135deg, #00c6ff, #0d5be0, #39e7ff)"
    : "linear-gradient(135deg, #0d5be0,#39e7ff, #0d5be0)",

            color: "white",

            fontWeight: "700",

            cursor: "pointer",

            transition:
              "all 0.3s ease",

            transform:
              hovered === "cta"
                ? "translateY(-4px) scale(1.02)"
                : "translateY(0) scale(1)",

            boxShadow:
  hovered === "cta"
    ? "0 16px 35px rgba(0,198,255,0.40)"
    : "0 10px 25px rgba(23,105,255,0.25)",
          }}
        >
          Create Your Account →
        </button>

      </section>
    </>
  );
}

export default HeroSection;