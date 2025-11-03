import "../styles/colors.css";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
const { isAuthenticated } = useAuth();
return (
<div className="container mt-5">
<div className="text-center mb-4">
<h1 className="fw-bold text-primary">Bienvenido a Turnos Médicos</h1>
<p className="text-muted">Gestioná tus turnos y consultá médicos de manera rápida y sencilla.</p>
<div className="d-flex justify-content-center gap-3 mt-4">
{!isAuthenticated ? (
<>
<Link to="/login" className="btn btn-outline-primary px-4">Iniciar Sesión</Link>
<Link to="/registro" className="btn btn-primary px-4">Registrarse</Link>
</>
) : (
<Link to="/mis-turnos" className="btn btn-primary px-4">Ir a mis turnos</Link>
)}
</div>
</div>
</div>
);
}