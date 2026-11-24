import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState("");

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      setMobile(isMobile);

      if (!isMobile) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const scrollTo = (section) => {
    setMenuOpen(false);

    const element = document.getElementById(section);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const navItems = ["Home", "About", "Features", "Security"];

  return (
    <nav
      style={{
  width: "100%",
  minHeight: "76px",

  padding: mobile ? "14px 5%" : "0 7%",

  display: "flex",

  alignItems:
    mobile && menuOpen
      ? "flex-start"
      : "center",

  justifyContent: "space-between",

  /* BLUE GRADIENT + GLITTER EFFECT */
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

  /* GLASS EFFECT */
  backdropFilter: "blur(15px)",
  WebkitBackdropFilter: "blur(15px)",

  borderBottom:
    "1px solid rgba(255,255,255,0.75)",

  position: "sticky",
  top: 0,
  zIndex: 1000,

  boxSizing: "border-box",

  flexWrap: "wrap",

  /* BLUE GLOW */
  boxShadow: `
    0 4px 25px rgba(23,105,255,0.20),
    0 0 35px rgba(0,190,255,0.12),
    inset 0 -1px 0 rgba(255,255,255,0.8)
  `,
}}
    >
      {/* LOGO */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "45px",
        }}
      >
        <img
  src="/images/finverse-logo.png"
  alt="FINVERSE"
  style={{
    width: mobile ? "120px" : "140px",
    height: "auto",
    maxHeight: mobile ? "40px" : "80px",
    objectFit: "contain",
    display: "block",
    cursor: "pointer",
    transition: "transform 0.3s ease",
    transform:
      hovered === "logo"
        ? "scale(1.04)"
        : "scale(1)",
  }}
  onMouseEnter={() => setHovered("logo")}
  onMouseLeave={() => setHovered("")}
/>
 <span
  style={{
    fontFamily: "'Montserrat', sans-serif",
    fontSize: mobile ? "20px" : "20px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    color: "#0756ca",
    whiteSpace: "nowrap",
  }}
>
  Finverse
</span>
      </div>

      {/* DESKTOP NAVIGATION */}
      {!mobile && (
       <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "27px",
          }}
        >
          {navItems.map((item) => (
  <button
    key={item}
    onClick={() => {
  if (item === "Home") {
    goTo("/");
  } else if (item === "About") {
    goTo("/about");
  } else if (item === "Features") {
    goTo("/features");
  } else if (item === "Security") {
    goTo("/security");
  }
}}
              onMouseEnter={() => setHovered(item)}
              onMouseLeave={() => setHovered("")}
              style={{
                border: "none",
                background: "transparent",
                color:
  hovered === item ? "#55d9ff" : "black",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                padding: "8px 2px",
                transition: "all 0.25s ease",
                transform:
                  hovered === item
                    ? "translateY(-2px)"
                    : "translateY(0)",
              }}
            >
              {item}
            </button>
          ))}

          {/* LOGIN */}
          <button
            onClick={() => goTo("/login")}
            onMouseEnter={() => setHovered("login")}
            onMouseLeave={() => setHovered("")}
            style={{
              padding: "10px 20px",
              borderRadius: "9px",
              border: "1px solid #1769ff",
              background:
                hovered === "login" ? "#edf4ff" : "white",
              color: "#1769ff",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              transform:
                hovered === "login"
                  ? "translateY(-2px)"
                  : "translateY(0)",
              boxShadow:
                hovered === "login"
                  ? "0 8px 20px rgba(23,105,255,0.12)"
                  : "none",
            }}
          >
            Login
          </button>

          {/* REGISTER */}
          <button
            onClick={() => goTo("/register")}
            onMouseEnter={() => setHovered("register")}
            onMouseLeave={() => setHovered("")}
            style={{
              padding: "11px 21px",
              borderRadius: "9px",
              border: "none",
              background:
                hovered === "register"
                  ? "#0d5be0"
                  : "#1769ff",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              transform:
                hovered === "register"
                  ? "translateY(-2px)"
                  : "translateY(0)",
              boxShadow:
                hovered === "register"
                  ? "0 12px 28px rgba(23,105,255,0.28)"
                  : "0 8px 20px rgba(23,105,255,0.18)",
            }}
          >
            Register
          </button>
        </div>
      )}

      {/* MOBILE MENU BUTTON */}
      {mobile && (
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          style={{
            width: "42px",
            height: "42px",
            border: "1px solid #dbe5f2",
            borderRadius: "9px",
            background: menuOpen ? "#edf4ff" : "#f7faff",
            color: "#0b1736",
            fontSize: "22px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.25s ease",
            boxShadow: menuOpen
              ? "0 8px 20px rgba(23,105,255,0.12)"
              : "none",
          }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      )}

      {/* MOBILE MENU */}
      {mobile && menuOpen && (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            paddingTop: "18px",
            paddingBottom: "8px",
            borderTop: "1px solid #eef2f7",
            marginTop: "12px",
            animation: "fadeIn 0.25s ease",
          }}
        >
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => scrollTo(item.toLowerCase())}
              onMouseEnter={() => setHovered(`mobile-${item}`)}
              onMouseLeave={() => setHovered("")}
              style={{
                width: "100%",
                padding: "13px",
                border: "none",
                borderRadius: "8px",
                background:
                  hovered === `mobile-${item}`
                    ? "#edf4ff"
                    : "#f7faff",
                color:
                  hovered === `mobile-${item}`
                    ? "#1769ff"
                    : "#334155",
                textAlign: "left",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.25s ease",
                transform:
                  hovered === `mobile-${item}`
                    ? "translateX(4px)"
                    : "translateX(0)",
              }}
            >
              {item}
            </button>
          ))}

          <button
            onClick={() => goTo("/login")}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "9px",
              border: "1px solid #1769ff",
              background: "white",
              color: "#1769ff",
              fontWeight: "600",
              cursor: "pointer",
              marginTop: "5px",
            }}
          >
            Login
          </button>

          <button
            onClick={() => goTo("/register")}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "9px",
              border: "none",
              background: "#1769ff",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(23,105,255,0.18)",
            }}
          >
            Register
          </button>
          
        </div>
        
      )}
      
    </nav>
  );
}

export default Navbar;