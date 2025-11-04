import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/layout/NavBar.jsx";
import Footer from "./components/layout/Footer.jsx";
import Home from "./components/Home.jsx";
import Login from "./components/Login.jsx";
import Registro from "./components/Registro.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import MisTurnos from "./components/paciente/MisTurnos.jsx";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute.jsx";
import AdminLogin from "./components/admin/AdminLogin.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";
import UsuariosAdmin from "./components/admin/UsuariosAdmin.jsx";
import EspecialidadesAdmin from "./components/admin/EspecialidadesAdmin.jsx";
import MedicosAdmin from "./components/admin/MedicosAdmin.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route
            path="/mis-turnos"
            element={
              <ProtectedRoute>
                <MisTurnos />
              </ProtectedRoute>
            }
          />
          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route path="usuarios" element={<UsuariosAdmin />} />
            <Route path="especialidades" element={<EspecialidadesAdmin />} />
            <Route path="medicos" element={<MedicosAdmin />} />
          </Route>
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}
