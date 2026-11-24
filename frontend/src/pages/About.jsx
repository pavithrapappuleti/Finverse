import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function About() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight: "100vh",
          padding: "90px 8% 80px",
          boxSizing: "border-box",
          color: "#0b1736",
          background: "rgba(5,20,50,0.10)",
          overflow: "hidden",
        }}
      >

        {/* =====================================================
            ABOUT HERO
        ===================================================== */}

        <section
          style={{
            maxWidth: "1050px",
            margin: "0 auto",
            textAlign: "center",
            padding: "20px 0 80px",
          }}
        >
          <span
            style={{
              color: "#1769ff",
              fontSize: "14px",
              fontWeight: "800",
              letterSpacing: "2.5px",
            }}
          >
            ABOUT FINVERSE
          </span>

          <h1
            style={{
              fontSize: "clamp(38px, 6vw, 58px)",
              margin: "16px 0",
              fontWeight: "800",
              color: "#071b45",
              lineHeight: "1.1",
            }}
          >
            Banking Made
            <span style={{ color: "#1769ff" }}>
              {" "}Smarter.
            </span>
          </h1>

          <p
            style={{
              maxWidth: "780px",
              margin: "0 auto",
              fontSize: "17px",
              lineHeight: "1.8",
              color: "#475569",
            }}
          >
            FINVERSE is a modern online banking ecosystem designed
            to bring everyday banking activities together in one
            simple, convenient and user-friendly digital platform.
          </p>
        </section>


        {/* =====================================================
            WHAT IS FINVERSE
        ===================================================== */}

        <section
          style={{
            maxWidth: "1100px",
            margin: "0 auto 70px",
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "30px",
            alignItems: "stretch",
          }}
        >

          {/* LEFT CONTENT */}

          <div
            style={{
              padding: "38px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.88)",
              border: "1px solid #dbeafe",
              boxShadow: "0 15px 40px rgba(23,105,255,0.08)",
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
              THE FINVERSE IDEA
            </span>

            <h2
              style={{
                color: "#071b45",
                fontSize: "30px",
                margin: "12px 0 18px",
              }}
            >
              What is FINVERSE?
            </h2>

            <p
              style={{
                color: "#64748b",
                lineHeight: "1.9",
                fontSize: "15px",
                margin: "0 0 15px",
              }}
            >
              FINVERSE is an integrated online banking platform
              created to provide users with a centralized digital
              environment for managing their banking activities.
            </p>

            <p
              style={{
                color: "#64748b",
                lineHeight: "1.9",
                fontSize: "15px",
                margin: 0,
              }}
            >
              Instead of depending on multiple traditional banking
              interactions, FINVERSE brings important account
              activities into one digital experience that can be
              accessed conveniently through a web application.
            </p>
          </div>


          {/* RIGHT HIGHLIGHT */}

          <div
            style={{
              padding: "35px",
              borderRadius: "20px",
              background:
                "linear-gradient(135deg, #071b45, #0c3477, #1769ff)",
              color: "white",
              boxShadow: "0 18px 45px rgba(23,105,255,0.22)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: "38px",
                marginBottom: "18px",
              }}
            >
              🌐
            </div>

            <h2
              style={{
                margin: "0 0 15px",
                fontSize: "27px",
              }}
            >
              One Digital Banking Space
            </h2>

            <p
              style={{
                margin: 0,
                color: "#dbeafe",
                fontSize: "14px",
                lineHeight: "1.8",
              }}
            >
              FINVERSE brings account management, transactions
              and financial activities together into a connected
              online banking experience.
            </p>

            <div
              style={{
                marginTop: "25px",
                display: "flex",
                flexWrap: "wrap",
                gap: "9px",
              }}
            >
              {[
                "Account Management",
                "Digital Transactions",
                "Financial Tracking",
              ].map((item) => (
                <span
                  key={item}
                  style={{
                    padding: "8px 11px",
                    borderRadius: "20px",
                    background: "rgba(255,255,255,0.12)",
                    border:
                      "1px solid rgba(255,255,255,0.18)",
                    fontSize: "11px",
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>


        {/* =====================================================
            MISSION + VISION
        ===================================================== */}

        <section
          style={{
            maxWidth: "1100px",
            margin: "0 auto 75px",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "35px",
            }}
          >
            <span
              style={{
                color: "#1769ff",
                fontSize: "12px",
                fontWeight: "800",
                letterSpacing: "2px",
              }}
            >
              OUR PURPOSE
            </span>

            <h2
              style={{
                fontSize: "36px",
                color: "#071b45",
                margin: "12px 0 10px",
              }}
            >
              Mission & Vision
            </h2>

            <p
              style={{
                color: "#64748b",
                fontSize: "14px",
                margin: 0,
              }}
            >
              The idea behind building a simpler digital banking experience.
            </p>
          </div>


          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "25px",
            }}
          >

            {/* MISSION */}

            <div
              style={{
                padding: "32px",
                borderRadius: "18px",
                background: "#ffffff",
                border: "1px solid #dbeafe",
                boxShadow:
                  "0 12px 35px rgba(23,105,255,0.07)",
              }}
            >
              <div
                style={{
                  width: "55px",
                  height: "55px",
                  borderRadius: "14px",
                  background: "#edf4ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "25px",
                  marginBottom: "18px",
                }}
              >
                🎯
              </div>

              <h3
                style={{
                  color: "#071b45",
                  fontSize: "23px",
                  margin: "0 0 12px",
                }}
              >
                Our Mission
              </h3>

              <p
                style={{
                  color: "#64748b",
                  lineHeight: "1.8",
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                Our mission is to create a convenient digital
                banking environment where users can manage their
                accounts and everyday banking activities with
                greater simplicity and ease.
              </p>
            </div>


            {/* VISION */}

            <div
              style={{
                padding: "32px",
                borderRadius: "18px",
                background: "#ffffff",
                border: "1px solid #dbeafe",
                boxShadow:
                  "0 12px 35px rgba(23,105,255,0.07)",
              }}
            >
              <div
                style={{
                  width: "55px",
                  height: "55px",
                  borderRadius: "14px",
                  background: "#edf4ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "25px",
                  marginBottom: "18px",
                }}
              >
                🚀
              </div>

              <h3
                style={{
                  color: "#071b45",
                  fontSize: "23px",
                  margin: "0 0 12px",
                }}
              >
                Our Vision
              </h3>

              <p
                style={{
                  color: "#64748b",
                  lineHeight: "1.8",
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                We envision a future where digital technology makes
                banking more accessible, organized and convenient,
                allowing users to interact with their finances
                through a simple online platform.
              </p>
            </div>

          </div>
        </section>


        {/* =====================================================
            WHY FINVERSE WAS CREATED
        ===================================================== */}

        <section
          style={{
            maxWidth: "1100px",
            margin: "0 auto 75px",
            padding: "42px",
            borderRadius: "22px",
            background:
              "linear-gradient(120deg, #eef6ff, #ffffff)",
            border: "1px solid #d6e8ff",
            boxShadow:
              "0 15px 40px rgba(23,105,255,0.07)",
          }}
        >

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "0.8fr 1.2fr",
              gap: "40px",
              alignItems: "center",
            }}
          >

            <div>
              <span
                style={{
                  color: "#1769ff",
                  fontSize: "12px",
                  fontWeight: "800",
                  letterSpacing: "1.5px",
                }}
              >
                THE IDEA
              </span>

              <h2
                style={{
                  color: "#071b45",
                  fontSize: "30px",
                  margin: "12px 0 0",
                  lineHeight: "1.25",
                }}
              >
                Why was FINVERSE created?
              </h2>
            </div>


            <div>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                  lineHeight: "1.9",
                  margin: "0 0 14px",
                }}
              >
                Traditional banking can involve physical visits,
                paperwork and waiting for certain services.
                Digital banking provides an opportunity to simplify
                many of these everyday interactions.
              </p>

              <p
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                  lineHeight: "1.9",
                  margin: 0,
                }}
              >
                FINVERSE was conceptualized around this idea:
                create a centralized online environment where
                banking activities can be performed and monitored
                through a clean and organized interface.
              </p>
            </div>

          </div>
        </section>


        {/* =====================================================
            HOW FINVERSE FITS INTO BANKING
        ===================================================== */}

        <section
          style={{
            maxWidth: "1100px",
            margin: "0 auto 75px",
            textAlign: "center",
          }}
        >

          <span
            style={{
              color: "#1769ff",
              fontSize: "12px",
              fontWeight: "800",
              letterSpacing: "2px",
            }}
          >
            THE FINVERSE JOURNEY
          </span>

          <h2
            style={{
              color: "#071b45",
              fontSize: "34px",
              margin: "12px 0",
            }}
          >
            Banking in a Connected Way
          </h2>

          <p
            style={{
              maxWidth: "700px",
              margin: "0 auto 40px",
              color: "#64748b",
              lineHeight: "1.8",
              fontSize: "14px",
            }}
          >
            FINVERSE is designed around a simple journey that
            keeps the user's banking activities organized from
            beginning to end.
          </p>


          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "18px",
            }}
          >

            {[
              {
                icon: "👤",
                title: "Create",
                text: "Create your digital banking account and set up your profile.",
              },
              {
                icon: "📊",
                title: "Manage",
                text: "Access your account and keep track of your banking information.",
              },
              {
                icon: "💳",
                title: "Transact",
                text: "Carry out everyday banking transactions through the platform.",
              },
              {
                icon: "📈",
                title: "Monitor",
                text: "Review your financial activity and keep your account organized.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  padding: "25px 18px",
                  borderRadius: "16px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow:
                    "0 8px 25px rgba(23,105,255,0.05)",
                }}
              >
                <div
                  style={{
                    fontSize: "29px",
                    marginBottom: "12px",
                  }}
                >
                  {item.icon}
                </div>

                <h3
                  style={{
                    color: "#071b45",
                    fontSize: "17px",
                    margin: "0 0 8px",
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "12px",
                    lineHeight: "1.7",
                    margin: 0,
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}

          </div>
        </section>


        {/* =====================================================
            FINVERSE PRINCIPLES
        ===================================================== */}

        <section
          style={{
            maxWidth: "1100px",
            margin: "0 auto 75px",
          }}
        >

          <div
            style={{
              textAlign: "center",
              marginBottom: "35px",
            }}
          >
            <span
              style={{
                color: "#1769ff",
                fontSize: "12px",
                fontWeight: "800",
                letterSpacing: "2px",
              }}
            >
              OUR APPROACH
            </span>

            <h2
              style={{
                color: "#071b45",
                fontSize: "34px",
                margin: "12px 0",
              }}
            >
              Built Around Simplicity
            </h2>

            <p
              style={{
                color: "#64748b",
                fontSize: "14px",
                lineHeight: "1.8",
                maxWidth: "680px",
                margin: "0 auto",
              }}
            >
              Every part of the FINVERSE experience is designed
              around making online banking easier to understand
              and easier to use.
            </p>
          </div>


          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
            }}
          >

            {[
              {
                icon: "🧭",
                title: "Simple Experience",
                text: "A clean interface helps users navigate their banking activities without unnecessary complexity.",
              },
              {
                icon: "🔗",
                title: "Connected Banking",
                text: "Different banking activities are brought together into one organized digital environment.",
              },
              {
                icon: "📱",
                title: "Accessible Platform",
                text: "A web-based experience allows users to interact with their banking information conveniently.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  padding: "30px 25px",
                  borderRadius: "17px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                }}
              >

                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "13px",
                    background: "#edf4ff",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "24px",
                    marginBottom: "18px",
                  }}
                >
                  {item.icon}
                </div>

                <h3
                  style={{
                    color: "#071b45",
                    fontSize: "18px",
                    margin: "0 0 10px",
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "13px",
                    lineHeight: "1.8",
                    margin: 0,
                  }}
                >
                  {item.text}
                </p>

              </div>
            ))}

          </div>
        </section>


        {/* =====================================================
            PROJECT HIGHLIGHT
        ===================================================== */}

        <section
          style={{
            maxWidth: "1100px",
            margin: "0 auto 70px",
            padding: "40px",
            borderRadius: "22px",
            background:
              "linear-gradient(135deg, #061735, #0c3477)",
            color: "white",
            textAlign: "center",
            boxShadow:
              "0 20px 50px rgba(7,27,69,0.2)",
          }}
        >

          <div
            style={{
              fontSize: "35px",
              marginBottom: "15px",
            }}
          >
            ✦
          </div>

          <h2
            style={{
              fontSize: "30px",
              margin: "0 0 14px",
            }}
          >
            More Than Just a Banking Interface
          </h2>

          <p
            style={{
              maxWidth: "720px",
              margin: "0 auto",
              color: "#dbeafe",
              fontSize: "14px",
              lineHeight: "1.9",
            }}
          >
            FINVERSE represents the idea of bringing modern web
            technology and banking concepts together to create
            a practical digital banking ecosystem. The platform
            focuses on organizing everyday banking activities
            into one connected experience.
          </p>

        </section>


        {/* =====================================================
            CTA
        ===================================================== */}

        <section
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            textAlign: "center",
            padding: "20px 0 30px",
          }}
        >

          <h2
            style={{
              color: "#071b45",
              fontSize: "clamp(28px, 5vw, 40px)",
              margin: "0 0 14px",
            }}
          >
            Experience Smarter Banking
          </h2>

          <p
            style={{
              color: "#64748b",
              fontSize: "15px",
              lineHeight: "1.7",
              marginBottom: "25px",
            }}
          >
            Explore the FINVERSE platform and discover a
            modern approach to online banking.
          </p>

          <button
            onClick={() => navigate("/register")}
            style={{
              border: "none",
              borderRadius: "9px",
              padding: "14px 27px",
              background:
                "linear-gradient(135deg, #0d5be0, #39e7ff)",
              color: "white",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow:
                "0 10px 25px rgba(23,105,255,0.25)",
            }}
          >
            Create Your Account →
          </button>

        </section>


        {/* =====================================================
            RESPONSIVE STYLE
        ===================================================== */}

        <style>
          {`
            @media (max-width: 900px) {

              .about-main-grid {
                grid-template-columns: 1fr !important;
              }

            }

            @media (max-width: 750px) {

              .about-purpose-grid {
                grid-template-columns: 1fr !important;
              }

              .about-journey-grid {
                grid-template-columns: repeat(2, 1fr) !important;
              }

              .about-principles-grid {
                grid-template-columns: 1fr !important;
              }

            }

            @media (max-width: 600px) {

              .about-main-grid {
                grid-template-columns: 1fr !important;
              }

              .about-journey-grid {
                grid-template-columns: 1fr !important;
              }

              .about-page-padding {
                padding-left: 5% !important;
                padding-right: 5% !important;
              }

            }

            @media (max-width: 450px) {

              .about-card-padding {
                padding: 24px !important;
              }

            }
          `}
        </style>

      </div>
    </>
  );
}

export default About;