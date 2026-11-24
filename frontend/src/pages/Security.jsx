import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";

function Security() {
  const [width, setWidth] = useState(window.innerWidth);
  const [hovered, setHovered] = useState("");

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener("resize", handleResize);
  }, []);

  const mobile = width <= 600;
  const tablet = width > 600 && width <= 950;

  const securityCards = [
    {
      icon: "🔐",
      title: "Secure Authentication",
      text: "FINVERSE uses account authentication to help ensure that banking services are accessed only by the registered user.",
    },
    {
      icon: "🛡️",
      title: "PIN Protected",
      text: "Important banking transactions require PIN verification before they are processed.",
    },
    {
      icon: "🔒",
      title: "Protected Information",
      text: "Account details and financial information are handled carefully throughout the banking experience.",
    },
  ];

  const protectionSteps = [
    {
      number: "01",
      icon: "👤",
      title: "Account Verification",
      text: "Users sign in to their FINVERSE account before accessing their banking activities.",
    },
    {
      number: "02",
      icon: "🔑",
      title: "Transaction Verification",
      text: "Sensitive transactions can require PIN verification to provide an additional layer of protection.",
    },
    {
      number: "03",
      icon: "📋",
      title: "Activity Tracking",
      text: "Banking activities are recorded in transaction history so users can review their account activity.",
    },
  ];

  const practices = [
    {
      icon: "🔑",
      title: "Keep your PIN private",
      text: "Never share your account PIN with anyone or store it where others can easily access it.",
    },
    {
      icon: "👀",
      title: "Review transactions",
      text: "Regularly check your transaction history and make sure the displayed activities are familiar.",
    },
    {
      icon: "🚪",
      title: "Log out after use",
      text: "Always log out when you finish using your banking account, especially on shared devices.",
    },
    {
      icon: "⚠️",
      title: "Stay alert",
      text: "Be careful when sharing account-related information and avoid using unknown or suspicious links.",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `
          linear-gradient(
            rgba(255,255,255,0.45),
            rgba(255,255,255,0.45)
          ),
          url("/images/finverse-banking-bg.png")
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: mobile ? "scroll" : "fixed",
        backgroundRepeat: "no-repeat",
        overflowX: "hidden",
      }}
    >
      <Navbar />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        style={{
          padding: mobile
            ? "65px 6% 60px"
            : tablet
            ? "80px 6% 70px"
            : "100px 8% 85px",

          position: "relative",
          textAlign: "center",
        }}
      >
        {/* Background glow */}

        <div
          style={{
            position: "absolute",
            width: mobile ? "180px" : "320px",
            height: mobile ? "180px" : "320px",
            borderRadius: "50%",
            background: "rgba(23,105,255,0.14)",
            filter: "blur(90px)",
            top: "-80px",
            right: mobile ? "-80px" : "-100px",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: mobile ? "160px" : "280px",
            height: mobile ? "160px" : "280px",
            borderRadius: "50%",
            background: "rgba(0,198,255,0.12)",
            filter: "blur(80px)",
            bottom: "-70px",
            left: mobile ? "-80px" : "-100px",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "850px",
            margin: "auto",
          }}
        >
          <span
            style={{
              color: "#1769ff",
              fontSize: mobile ? "13px" : "17px",
              fontWeight: "800",
              letterSpacing: "2px",
            }}
          >
            YOUR SECURITY MATTERS
          </span>

          <h1
            style={{
              color: "#071b45",
              fontSize: mobile
                ? "34px"
                : tablet
                ? "43px"
                : "52px",
              lineHeight: "1.15",
              margin: "15px 0 18px",
              fontWeight: "800",
              letterSpacing: "-1.5px",
            }}
          >
            Banking with
            <span style={{ color: "#1769ff" }}>
              {" "}
              confidence.
            </span>
          </h1>

          <p
            style={{
              maxWidth: "700px",
              margin: "0 auto",
              color: "#475569",
              fontSize: mobile ? "14px" : "17px",
              lineHeight: "1.8",
            }}
          >
            FINVERSE is designed with security in mind, helping
            users protect their accounts, verify important
            transactions and keep track of their banking activity.
          </p>
        </div>
      </section>

      {/* =====================================================
          SECURITY CARDS
      ===================================================== */}

      <section
        style={{
          padding: mobile
            ? "10px 6% 70px"
            : tablet
            ? "15px 6% 80px"
            : "20px 8% 90px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "auto",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "40px",
            }}
          >
            <span
              style={{
                color: "#1769ff",
                fontSize: "12px",
                fontWeight: "800",
                letterSpacing: "1.5px",
              }}
            >
              SECURITY FOUNDATION
            </span>

            <h2
              style={{
                color: "#071b45",
                fontSize: mobile ? "28px" : "38px",
                margin: "10px 0",
                fontWeight: "800",
              }}
            >
              Built around safer banking
            </h2>

            <p
              style={{
                maxWidth: "650px",
                margin: "auto",
                color: "#64748b",
                fontSize: "14px",
                lineHeight: "1.8",
              }}
            >
              Every important part of the FINVERSE banking
              experience is designed to keep account access and
              transactions more controlled and transparent.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: mobile
                ? "1fr"
                : tablet
                ? "1fr"
                : "repeat(3, 1fr)",
              gap: "22px",
            }}
          >
            {securityCards.map((item, index) => (
              <div
                key={item.title}
                onMouseEnter={() =>
                  setHovered(`security-${index}`)
                }
                onMouseLeave={() => setHovered("")}
                style={{
                  padding: mobile
                    ? "28px 23px"
                    : "32px 27px",

                  background:
                    hovered === `security-${index}`
                      ? "rgba(255,255,255,0.98)"
                      : "rgba(255,255,255,0.82)",

                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",

                  border:
                    hovered === `security-${index}`
                      ? "1px solid #b9d7ff"
                      : "1px solid rgba(255,255,255,0.9)",

                  borderRadius: "18px",

                  boxShadow:
                    hovered === `security-${index}`
                      ? "0 22px 45px rgba(23,105,255,0.15)"
                      : "0 15px 40px rgba(15,23,42,0.10)",

                  transform:
                    hovered === `security-${index}`
                      ? "translateY(-7px)"
                      : "translateY(0)",

                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    width: "58px",
                    height: "58px",
                    borderRadius: "15px",
                    background: "#edf4ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "27px",
                    marginBottom: "20px",
                  }}
                >
                  {item.icon}
                </div>

                <h3
                  style={{
                    color: "#071b45",
                    fontSize: "19px",
                    margin: "0 0 10px",
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "14px",
                    lineHeight: "1.75",
                    margin: 0,
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW FINVERSE PROTECTS YOU
      ===================================================== */}

      <section
        style={{
          padding: mobile
            ? "70px 6%"
            : tablet
            ? "80px 6%"
            : "95px 8%",

          background:
            "linear-gradient(135deg, rgba(7,27,69,0.98), rgba(13,75,150,0.96))",

          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "rgba(0,198,255,0.12)",
            filter: "blur(90px)",
            top: "-160px",
            right: "-100px",
          }}
        />

        <div
          style={{
            maxWidth: "1100px",
            margin: "auto",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "45px",
            }}
          >
            <span
              style={{
                color: "#6ddcff",
                fontSize: "12px",
                fontWeight: "800",
                letterSpacing: "1.7px",
              }}
            >
              PROTECTION IN ACTION
            </span>

            <h2
              style={{
                color: "white",
                fontSize: mobile ? "29px" : "40px",
                margin: "10px 0 14px",
                fontWeight: "800",
              }}
            >
              How your banking activity is protected
            </h2>

            <p
              style={{
                color: "#c7d8ed",
                maxWidth: "680px",
                margin: "auto",
                fontSize: mobile ? "13px" : "15px",
                lineHeight: "1.8",
              }}
            >
              FINVERSE combines account access, transaction
              verification and activity tracking to create a more
              controlled banking experience.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: mobile
                ? "1fr"
                : tablet
                ? "1fr"
                : "repeat(3, 1fr)",
              gap: "22px",
            }}
          >
            {protectionSteps.map((step) => (
              <div
                key={step.number}
                style={{
                  padding: mobile
                    ? "28px 23px"
                    : "30px 25px",

                  borderRadius: "18px",
                  background: "rgba(255,255,255,0.09)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "22px",
                  }}
                >
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "14px",
                      background: "rgba(255,255,255,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "23px",
                    }}
                  >
                    {step.icon}
                  </div>

                  <span
                    style={{
                      color: "rgba(255,255,255,0.25)",
                      fontSize: "27px",
                      fontWeight: "800",
                    }}
                  >
                    {step.number}
                  </span>
                </div>

                <h3
                  style={{
                    color: "white",
                    fontSize: "18px",
                    margin: "0 0 10px",
                  }}
                >
                  {step.title}
                </h3>

                <p
                  style={{
                    color: "#c5d5e9",
                    fontSize: "13px",
                    lineHeight: "1.75",
                    margin: 0,
                  }}
                >
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          USER SECURITY PRACTICES
      ===================================================== */}

      <section
        style={{
          padding: mobile
            ? "70px 6%"
            : tablet
            ? "80px 6%"
            : "95px 8%",

          background: "rgba(255,255,255,0.70)",
        }}
      >
        <div
          style={{
            maxWidth: "1050px",
            margin: "auto",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "42px",
            }}
          >
            <span
              style={{
                color: "#1769ff",
                fontSize: "12px",
                fontWeight: "800",
                letterSpacing: "1.5px",
              }}
            >
              YOUR ROLE IN SECURITY
            </span>

            <h2
              style={{
                color: "#071b45",
                fontSize: mobile ? "29px" : "38px",
                margin: "10px 0 13px",
                fontWeight: "800",
              }}
            >
              Stay secure while banking
            </h2>

            <p
              style={{
                maxWidth: "650px",
                margin: "auto",
                color: "#64748b",
                fontSize: "14px",
                lineHeight: "1.8",
              }}
            >
              Good security is a shared responsibility. Follow
              simple practices to keep your FINVERSE account safer.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: mobile
                ? "1fr"
                : "1fr 1fr",
              gap: "18px",
            }}
          >
            {practices.map((item, index) => (
              <div
                key={item.title}
                onMouseEnter={() =>
                  setHovered(`practice-${index}`)
                }
                onMouseLeave={() => setHovered("")}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "17px",

                  padding: mobile
                    ? "22px"
                    : "25px",

                  background: "white",
                  borderRadius: "16px",

                  border:
                    hovered === `practice-${index}`
                      ? "1px solid #b9d7ff"
                      : "1px solid #e2e8f0",

                  boxShadow:
                    hovered === `practice-${index}`
                      ? "0 15px 35px rgba(23,105,255,0.10)"
                      : "0 8px 25px rgba(15,23,42,0.05)",

                  transform:
                    hovered === `practice-${index}`
                      ? "translateY(-4px)"
                      : "translateY(0)",

                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    minWidth: "48px",
                    width: "48px",
                    height: "48px",
                    borderRadius: "13px",
                    background: "#edf4ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "21px",
                  }}
                >
                  {item.icon}
                </div>

                <div>
                  <h3
                    style={{
                      color: "#071b45",
                      fontSize: "16px",
                      margin: "0 0 7px",
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "13px",
                      lineHeight: "1.7",
                      margin: 0,
                    }}
                  >
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECURITY MESSAGE
      ===================================================== */}

      <section
        style={{
          padding: mobile
            ? "65px 6%"
            : tablet
            ? "75px 6%"
            : "90px 8%",

          textAlign: "center",

          background:
            "linear-gradient(135deg, #071b45, #0d5be0)",
        }}
      >
        <div
          style={{
            maxWidth: "750px",
            margin: "auto",
          }}
        >
          <div
            style={{
              width: "65px",
              height: "65px",
              margin: "0 auto 20px",
              borderRadius: "18px",
              background: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
            }}
          >
            🛡️
          </div>

          <h2
            style={{
              color: "white",
              fontSize: mobile ? "28px" : "39px",
              margin: "0 0 15px",
              fontWeight: "800",
            }}
          >
            Your account. Your control.
          </h2>

          <p
            style={{
              color: "#c9dbf3",
              fontSize: mobile ? "14px" : "16px",
              lineHeight: "1.8",
              maxWidth: "650px",
              margin: "0 auto",
            }}
          >
            FINVERSE gives you the tools to manage your banking
            activities while keeping verification and transaction
            visibility at the center of the experience.
          </p>

          <div
            style={{
              marginTop: "28px",
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            {[
              "Secure Access",
              "PIN Verification",
              "Transaction Tracking",
            ].map((item) => (
              <span
                key={item}
                style={{
                  padding: "9px 15px",
                  borderRadius: "30px",
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "#e4efff",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                ✓ {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Security;