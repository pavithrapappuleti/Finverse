import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="admin-dashboard">

      <AdminSidebar
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      <Outlet
        context={{
          menuOpen,
          setMenuOpen
        }}
      />

    </div>
  );
}

export default AdminLayout;