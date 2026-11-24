import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState(window.innerWidth <= 650);
  const [hovered, setHovered] = useState("");

  useEffect(() => {
    const handleResize = () => {
      setMobile(window.innerWidth <= 650);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /* =====================================================
     FOOTER NAVIGATION
  ===================================================== */

  const handleNavigation = (path) => {
    navigate(path);

    // Scroll to top after changing page
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const links = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "About",
      path: "/about",
    },
    {
      name: "Features",
      path: "/features",
    },
    {
      name: "Security",
      path: "/security",
    },
  ];

  return (
    <footer
      style={{
        padding: mobile
          ? "45px 6% 22px"
          : "60px 8% 25px",

        background: `
          radial-gradient(
            circle at 10% 50%,
            rgba(0, 190, 255, 0.40),
            transparent 28%
          ),
          radial-gradient(
            circle at 85% 20%,
            rgba(23, 105, 255, 0.35),
            transparent 30%
          ),
          linear-gradient(
            90deg,
            #dff8ff 0%,
            #b9eaff 30%,
            #f0f8ff 55%,
            #c5e4ff 80%,
            #e5f5ff 100%
          )
        `,

        color: "black",

        boxSizing: "border-box",

        width: "100%",
      }}
    >

      {/* =====================================================
          TOP FOOTER
      ===================================================== */}

      <div
        style={{
          display: "flex",

          flexDirection: mobile
            ? "column"
            : "row",

          justifyContent: "space-between",

          alignItems: mobile
            ? "flex-start"
            : "center",

          gap: mobile
            ? "28px"
            : "20px",

          paddingBottom: "30px",

          borderBottom:
            "1px solid rgba(0,0,0,0.12)",

          width: "100%",

          boxSizing: "border-box",
        }}
      >

        {/* =====================================================
            BRAND
        ===================================================== */}

        <div>
          <h2
            style={{
              fontSize: mobile
                ? "20px"
                : "22px",

              letterSpacing: "2px",

              margin: 0,

              color: "#06182d",

              fontWeight: "800",
            }}
          >
            FINVERSE
          </h2>

          <p
            style={{
              marginTop: "8px",

              marginBottom: 0,

              color: "#26384f",

              fontSize: "13px",

              lineHeight: "1.6",
            }}
          >
            An Integrated Online Banking Ecosystem
          </p>
        </div>


        {/* =====================================================
            FOOTER LINKS
        ===================================================== */}

        <div
          style={{
            display: "flex",

            flexWrap: "wrap",

            gap: mobile
              ? "15px 22px"
              : "25px",

            alignItems: "center",
          }}
        >

          {links.map((item) => (
            <button
              key={item.name}

              onClick={() =>
                handleNavigation(item.path)
              }

              onMouseEnter={() =>
                setHovered(item.name)
              }

              onMouseLeave={() =>
                setHovered("")
              }

              style={{
                border: "none",

                background: "transparent",

                color:
                  hovered === item.name
                    ? "#1769ff"
                    : "#06182d",

                fontSize: "13px",

                fontWeight: "600",

                cursor: "pointer",

                padding: 0,

                transition:
                  "all 0.25s ease",

                transform:
                  hovered === item.name
                    ? "translateY(-2px)"
                    : "translateY(0)",

                textDecoration:
                  hovered === item.name
                    ? "underline"
                    : "none",

                textUnderlineOffset: "4px",
              }}
            >
              {item.name}
            </button>
          ))}

        </div>
      </div>


      {/* =====================================================
          BOTTOM FOOTER
      ===================================================== */}

      <div
        style={{
          paddingTop: "22px",

          display: "flex",

          flexDirection: mobile
            ? "column"
            : "row",

          justifyContent: "space-between",

          alignItems: mobile
            ? "flex-start"
            : "center",

          gap: "10px",

          color: "#26384f",

          fontSize: "12px",

          width: "100%",

          boxSizing: "border-box",
        }}
      >

        <p
          style={{
            margin: 0,
          }}
        >
          © 2026 FINVERSE. All rights reserved.
        </p>

        <p
          style={{
            margin: 0,

            color: "#06182d",

            fontWeight: "600",
          }}
        >
          Secure • Smart • Simple
        </p>

      </div>

    </footer>
  );
}

export default Footer;