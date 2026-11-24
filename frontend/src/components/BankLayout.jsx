import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";

function BankLayout() {

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="dashboard">

      {/* COMMON SIDEBAR */}
      <Sidebar
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />


      {/* CURRENT PAGE */}
      <Outlet
        context={{
          menuOpen,
          setMenuOpen
        }}
      />

    </div>
  );
}

export default BankLayout;