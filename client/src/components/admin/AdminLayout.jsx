import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminLayout() {
  const { logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const onLogout = () => {
    logoutAdmin();
    navigate("/");
  };
  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        <aside className="col-12 col-md-3 col-lg-2 p-3 admin-aside">
          <h5>Admin</h5>
          <ul className="nav flex-column gap-1 admin-menu">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/admin/usuarios">Usuarios</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/admin/especialidades">Especialidades</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/admin/medicos">Medicos</NavLink>
            </li>
            <li className="nav-item">
              <button className="btn btn-sm btn-outline-light mt-3" onClick={onLogout}>Cerrar sesion admin</button>
            </li>
          </ul>
        </aside>
        <main className="col-12 col-md-9 col-lg-10 p-4 admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

