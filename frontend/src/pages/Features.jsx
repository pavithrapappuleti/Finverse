import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Features() {
  const navigate = useNavigate();

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

  /* =====================================================
     MAIN FEATURES
  ===================================================== */

  const features = [
    {
      icon: "💰",
      title: "Easy Deposits",
      text: "Add money to your FINVERSE account quickly and conveniently.",
    },
    {
      icon: "💸",
      title: "Quick Withdrawals",
      text: "Withdraw available funds easily with secure PIN verification.",
    },
    {
      icon: "↗️",
      title: "Instant Transfers",
      text: "Send money to another account quickly and conveniently.",
    },
    {
      icon: "📊",
      title: "Transaction History",
      text: "View and track your deposits, withdrawals and transfers in one place.",
    },
  ];

  /* =====================================================
     SMART FEATURES
  ===================================================== */

  const smartFeatures = [
    {
      icon: "💳",
      title: "Virtual Cards",
      text: "Create and manage virtual cards for convenient digital payments.",
    },
    {
      icon: "📅",
      title: "Scheduled Payments",
      text: "Plan future payments and keep your upcoming transactions organized.",
    },
    {
      icon: "🎯",
      title: "Savings Goals",
      text: "Set savings targets and monitor your progress toward your financial goals.",
    },
    {
      
      icon: "🤖",
      title: "FINVERSE Assistant",
      text: "Get quick help with banking activities, transactions and common account-related questions.",
    },
  ];

  /* =====================================================
     HOW IT WORKS
  ===================================================== */

  const steps = [
    {
      number: "01",
      icon: "👤",
      title: "Create Your Account",
      text: "Register with FINVERSE and set up your banking account.",
    },
    {
      number: "02",
      icon: "⚙️",
      title: "Manage Your Money",
      text: "Deposit, withdraw, transfer and monitor your transactions.",
    },
    {
      number: "03",
      icon: "📈",
      title: "Track Your Finances",
      text: "Use history, savings goals and smart tools to stay organized.",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",

        backgroundImage: `
          linear-gradient(
            rgba(255,255,255,0.48),
            rgba(255,255,255,0.48)
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
          HERO / INTRO
      ===================================================== */}

      <section
        style={{
          padding: mobile
            ? "65px 6% 55px"
            : tablet
            ? "75px 6% 65px"
            : "90px 8% 70px",

          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Background Glow */}

        <div
          style={{
            position: "absolute",

            width: mobile ? "180px" : "320px",
            height: mobile ? "180px" : "320px",

            borderRadius: "50%",

            background: "rgba(23,105,255,0.15)",

            filter: "blur(90px)",

            top: "-80px",

            right: mobile ? "-80px" : "-100px",

            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",

            width: mobile ? "150px" : "280px",
            height: mobile ? "150px" : "280px",

            borderRadius: "50%",

            background: "rgba(0,190,255,0.12)",

            filter: "blur(80px)",

            bottom: "-50px",

            left: mobile ? "-70px" : "-100px",

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
              display: "inline-block",

              color: "#1769ff",

              fontSize: mobile ? "13px" : "17px",

              fontWeight: "800",

              letterSpacing: "2px",

              marginBottom: "12px",
            }}
          >
            POWERFUL FEATURES
          </span>

          <h1
            style={{
              color: "#071b45",

              fontSize: mobile
                ? "34px"
                : tablet
                ? "42px"
                : "52px",

              lineHeight: "1.15",

              margin: "10px 0 18px",

              fontWeight: "800",

              letterSpacing: "-1.5px",
            }}
          >
            Everything you need to
            <span style={{ color: "#1769ff" }}>
              {" "}
              manage your money.
            </span>
          </h1>

          <p
            style={{
              maxWidth: "720px",

              margin: "0 auto",

              color: "#334155",

              fontSize: mobile ? "14px" : "17px",

              lineHeight: "1.8",
            }}
          >
            FINVERSE brings essential banking services and smart
            financial tools together in one simple digital banking
            experience.
          </p>
        </div>
      </section>

      {/* =====================================================
          CORE BANKING FEATURES
      ===================================================== */}

      <section
        style={{
          padding: mobile
            ? "20px 6% 65px"
            : tablet
            ? "25px 6% 75px"
            : "30px 8% 85px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "auto",
          }}
        >
          {/* SECTION HEADING */}

          <div
            style={{
              marginBottom: "35px",

              textAlign:
                mobile
                  ? "center"
                  : "left",
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
              CORE BANKING
            </span>

            <h2
              style={{
                margin: "8px 0",

                color: "#071b45",

                fontSize:
                  mobile
                    ? "27px"
                    : "34px",

                fontWeight: "800",
              }}
            >
              Banking made simple
            </h2>

            <p
              style={{
                margin: 0,

                color: "#64748b",

                fontSize: "14px",

                lineHeight: "1.7",
              }}
            >
              Perform your everyday banking activities from one
              convenient platform.
            </p>
          </div>

          {/* FEATURE CARDS */}

          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                mobile
                  ? "1fr"
                  : tablet
                  ? "repeat(2, 1fr)"
                  : "repeat(4, 1fr)",

              gap: "20px",
            }}
          >
            {features.map((feature, index) => (
              <div
                key={feature.title}
                onMouseEnter={() =>
                  setHovered(`feature-${index}`)
                }
                onMouseLeave={() =>
                  setHovered("")
                }
                style={{
                  padding: mobile
                    ? "25px 22px"
                    : "28px 22px",

                  background:
                    hovered === `feature-${index}`
                      ? "rgba(255,255,255,0.98)"
                      : "rgba(255,255,255,0.82)",

                  backdropFilter: "blur(12px)",

                  WebkitBackdropFilter:
                    "blur(12px)",

                  border:
                    hovered === `feature-${index}`
                      ? "1px solid #b9d7ff"
                      : "1px solid rgba(255,255,255,0.9)",

                  borderRadius: "18px",

                  boxShadow:
                    hovered === `feature-${index}`
                      ? "0 22px 45px rgba(23,105,255,0.16)"
                      : "0 12px 35px rgba(15,23,42,0.09)",

                  transform:
                    hovered === `feature-${index}`
                      ? "translateY(-7px)"
                      : "translateY(0)",

                  transition:
                    "all 0.3s ease",

                  minWidth: 0,
                }}
              >
                {/* ICON */}

                <div
                  style={{
                    width: "54px",

                    height: "54px",

                    borderRadius: "15px",

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center",

                    background:
                      "linear-gradient(135deg,#edf4ff,#dbeafe)",

                    border:
                      "1px solid #cfe0f8",

                    fontSize: "25px",

                    marginBottom: "20px",

                    color: "#1769ff",

                    boxShadow:
                      "0 8px 20px rgba(23,105,255,0.10)",
                  }}
                >
                  {feature.icon}
                </div>

                <h3
                  style={{
                    color: "#071b45",

                    fontSize: "18px",

                    margin: "0 0 10px",

                    fontWeight: "700",
                  }}
                >
                  {feature.title}
                </h3>

                <p
                  style={{
                    color: "#64748b",

                    fontSize: "13px",

                    lineHeight: "1.7",

                    margin: 0,
                  }}
                >
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SMART FINANCIAL TOOLS
      ===================================================== */}

      <section
        style={{
          padding: mobile
            ? "65px 6%"
            : tablet
            ? "75px 6%"
            : "90px 8%",

          background:
            "linear-gradient(135deg, rgba(7,27,69,0.97), rgba(13,75,150,0.95))",

          position: "relative",

          overflow: "hidden",
        }}
      >
        {/* GLOW */}

        <div
          style={{
            position: "absolute",

            width: "300px",

            height: "300px",

            borderRadius: "50%",

            background:
              "rgba(0,198,255,0.14)",

            filter: "blur(80px)",

            top: "-130px",

            right: "-100px",
          }}
        />

        <div
          style={{
            position: "absolute",

            width: "260px",

            height: "260px",

            borderRadius: "50%",

            background:
              "rgba(23,105,255,0.15)",

            filter: "blur(90px)",

            bottom: "-120px",

            left: "-100px",
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
          {/* HEADING */}

          <div
            style={{
              textAlign: "center",

              marginBottom: "40px",
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
              SMART FINANCIAL TOOLS
            </span>

            <h2
              style={{
                color: "white",

                fontSize:
                  mobile
                    ? "28px"
                    : tablet
                    ? "34px"
                    : "40px",

                margin:
                  "10px 0 13px",

                fontWeight: "800",
              }}
            >
              More than just banking
            </h2>

            <p
              style={{
                color: "#cbdcf2",

                maxWidth: "680px",

                margin: "auto",

                fontSize:
                  mobile
                    ? "13px"
                    : "15px",

                lineHeight: "1.8",
              }}
            >
              FINVERSE also gives you tools to organize your
              payments, manage digital cards, work toward savings
              goals and get help through your digital banking
              assistant.
            </p>
          </div>

          {/* SMART FEATURE CARDS */}

          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                mobile
                  ? "1fr"
                  : tablet
                  ? "repeat(2, 1fr)"
                  : "repeat(4, 1fr)",

              gap: "20px",
            }}
          >
            {smartFeatures.map(
              (feature, index) => (
                <div
                  key={feature.title}
                  onMouseEnter={() =>
                    setHovered(`smart-${index}`)
                  }
                  onMouseLeave={() =>
                    setHovered("")
                  }
                  style={{
                    padding:
                      mobile
                        ? "25px 22px"
                        : "28px 22px",

                    borderRadius: "18px",

                    background:
                      hovered ===
                      `smart-${index}`
                        ? "rgba(255,255,255,0.17)"
                        : "rgba(255,255,255,0.09)",

                    border:
                      hovered ===
                      `smart-${index}`
                        ? "1px solid rgba(109,220,255,0.45)"
                        : "1px solid rgba(255,255,255,0.14)",

                    backdropFilter:
                      "blur(10px)",

                    WebkitBackdropFilter:
                      "blur(10px)",

                    transform:
                      hovered ===
                      `smart-${index}`
                        ? "translateY(-7px)"
                        : "translateY(0)",

                    boxShadow:
                      hovered ===
                      `smart-${index}`
                        ? "0 22px 45px rgba(0,0,0,0.28)"
                        : "0 10px 25px rgba(0,0,0,0.10)",

                    transition:
                      "all 0.3s ease",

                    minWidth: 0,
                  }}
                >
                  {/* CHATBOT IMAGE */}

                  {feature.image ? (
                    <div
                      style={{
                        width: "60px",

                        height: "60px",

                        borderRadius: "16px",

                        background:
                          "rgba(255,255,255,0.12)",

                        border:
                          "1px solid rgba(255,255,255,0.16)",

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center",

                        marginBottom: "20px",

                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={feature.image}
                        alt="FINVERSE Assistant"
                        style={{
                          width: "100%",

                          height: "100%",

                          objectFit: "cover",

                          display: "block",
                        }}
                      />
                    </div>
                  ) : (
                    /* NORMAL ICON */

                    <div
                      style={{
                        width: "54px",

                        height: "54px",

                        borderRadius: "15px",

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center",

                        background:
                          "rgba(255,255,255,0.12)",

                        border:
                          "1px solid rgba(255,255,255,0.14)",

                        fontSize: "24px",

                        marginBottom: "20px",

                        color: "#6ddcff",
                      }}
                    >
                      {feature.icon}
                    </div>
                  )}

                  <h3
                    style={{
                      color: "white",

                      fontSize: "18px",

                      margin:
                        "0 0 10px",

                      fontWeight: "700",
                    }}
                  >
                    {feature.title}
                  </h3>

                  <p
                    style={{
                      color: "#c4d4e9",

                      fontSize: "13px",

                      lineHeight: "1.7",

                      margin: 0,
                    }}
                  >
                    {feature.text}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

    

      {/* =====================================================
          FEATURE HIGHLIGHTS
      ===================================================== */}

      <section
        style={{
          padding: mobile
            ? "65px 6%"
            : tablet
            ? "75px 6%"
            : "90px 8%",

          background:
            "rgba(255,255,255,0.65)",
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
              FINVERSE AT A GLANCE
            </span>

            <h2
              style={{
                color: "#071b45",

                fontSize:
                  mobile
                    ? "28px"
                    : "36px",

                margin: "10px 0",

                fontWeight: "800",
              }}
            >
              One platform. Multiple possibilities.
            </h2>
          </div>

          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                mobile
                  ? "1fr 1fr"
                  : "repeat(4, 1fr)",

              gap: "15px",
            }}
          >
            {[
              [
                "04",
                "Core Banking",
                "Essential services",
              ],
              [
                "03",
                "Smart Tools",
                "Financial management",
              ],
              [
                "24/7",
                "Digital Access",
                "Anytime convenience",
              ],
              [
                "01",
                "Unified Platform",
                "Everything together",
              ],
            ].map((item) => (
              <div
                key={item[1]}
                style={{
                  background: "white",

                  border:
                    "1px solid #e2e8f0",

                  borderRadius: "15px",

                  padding: mobile
                    ? "22px 12px"
                    : "25px 15px",

                  textAlign: "center",

                  boxShadow:
                    "0 10px 30px rgba(15,23,42,0.07)",
                }}
              >
                <div
                  style={{
                    color: "#1769ff",

                    fontSize:
                      mobile
                        ? "24px"
                        : "28px",

                    fontWeight: "800",

                    marginBottom: "7px",
                  }}
                >
                  {item[0]}
                </div>

                <h3
                  style={{
                    color: "#071b45",

                    fontSize:
                      mobile
                        ? "13px"
                        : "15px",

                    margin:
                      "0 0 6px",
                  }}
                >
                  {item[1]}
                </h3>

                <p
                  style={{
                    color: "#7a8ba3",

                    fontSize: "11px",

                    margin: 0,
                  }}
                >
                  {item[2]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section
        style={{
          padding: mobile
            ? "70px 6%"
            : tablet
            ? "80px 6%"
            : "95px 8%",

          background:
            "rgba(5,20,50,0.07)",
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

              marginBottom: "45px",
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
              HOW IT WORKS
            </span>

            <h2
              style={{
                color: "#071b45",

                fontSize:
                  mobile
                    ? "29px"
                    : "38px",

                margin: "10px 0",

                fontWeight: "800",
              }}
            >
              Start banking in three simple steps
            </h2>

            <p
              style={{
                color: "#64748b",

                fontSize: "14px",

                maxWidth: "650px",

                margin: "auto",

                lineHeight: "1.7",
              }}
            >
              FINVERSE is designed to keep your banking experience
              simple from registration to everyday money management.
            </p>
          </div>

          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                mobile
                  ? "1fr"
                  : tablet
                  ? "1fr"
                  : "repeat(3, 1fr)",

              gap: "25px",
            }}
          >
            {steps.map((step) => (
              <div
                key={step.number}
                style={{
                  background: "white",

                  borderRadius: "18px",

                  padding:
                    mobile
                      ? "28px 23px"
                      : "32px 25px",

                  border:
                    "1px solid #e1eaf5",

                  position: "relative",

                  boxShadow:
                    "0 12px 35px rgba(23,105,255,0.07)",
                }}
              >
                <div
                  style={{
                    display: "flex",

                    justifyContent:
                      "space-between",

                    alignItems: "center",

                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      width: "48px",

                      height: "48px",

                      borderRadius: "13px",

                      background:
                        "#edf4ff",

                      display: "flex",

                      alignItems: "center",

                      justifyContent:
                        "center",

                      fontSize: "21px",
                    }}
                  >
                    {step.icon}
                  </div>

                  <span
                    style={{
                      color: "#d7e5f7",

                      fontSize: "25px",

                      fontWeight: "800",
                    }}
                  >
                    {step.number}
                  </span>
                </div>

                <h3
                  style={{
                    color: "#071b45",

                    fontSize: "18px",

                    margin:
                      "0 0 10px",
                  }}
                >
                  {step.title}
                </h3>

                <p
                  style={{
                    color: "#64748b",

                    fontSize: "13px",

                    lineHeight: "1.7",

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
          CTA
      ===================================================== */}

      <section
        style={{
          padding: mobile
            ? "70px 6%"
            : tablet
            ? "80px 6%"
            : "100px 8%",

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
              fontSize:
                mobile
                  ? "32px"
                  : "42px",

              marginBottom: "15px",
            }}
          >
            ✦
          </div>

          <h2
            style={{
              color: "white",

              fontSize:
                mobile
                  ? "28px"
                  : "40px",

              lineHeight: "1.2",

              margin:
                "0 0 15px",

              fontWeight: "800",
            }}
          >
            Ready for smarter banking?
          </h2>

          <p
            style={{
              color: "#c8daf3",

              fontSize:
                mobile
                  ? "14px"
                  : "17px",

              lineHeight: "1.7",

              margin:
                "0 auto 28px",

              maxWidth: "600px",
            }}
          >
            Create your FINVERSE account and experience a simpler
            way to manage your everyday banking.
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
              padding:
                mobile
                  ? "13px 23px"
                  : "14px 28px",

              border: "none",

              borderRadius: "9px",

              background:
                hovered === "cta"
                  ? "#ffffff"
                  : "linear-gradient(135deg,#00c6ff,#39e7ff)",

              color:
                hovered === "cta"
                  ? "#0753bb"
                  : "#001b35",

              fontWeight: "800",

              fontSize: "14px",

              cursor: "pointer",

              transition:
                "all 0.3s ease",

              transform:
                hovered === "cta"
                  ? "translateY(-4px)"
                  : "translateY(0)",

              boxShadow:
                hovered === "cta"
                  ? "0 15px 35px rgba(0,198,255,0.35)"
                  : "0 10px 25px rgba(0,0,0,0.18)",
            }}
          >
            Create Your Account →
          </button>
        </div>
      </section>
    </div>
  );
}

export default Features;