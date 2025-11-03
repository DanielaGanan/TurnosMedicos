import "../styles/colors.css";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function IconSteth() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 3v5a4 4 0 1 0 8 0V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M14 8a4 4 0 0 0 8 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M10 12v2a6 6 0 0 0 6 6h1a3 3 0 0 0 3-3v-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M8 13h4l-3 4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

function IconHospital() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M9 8h6M12 5v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M8 21v-4h8v4" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  return (
    <section className="hero-wrap py-5">
      <div className="container py-4">
        <div className="row align-items-center g-4">
          <div className="col-lg-7 text-center text-lg-start">
            <h1 className="display-5 fw-bold" style={{ color: 'var(--accent-pale)' }}>Turnos Médicos</h1>
            <p className="lead text-muted mt-2">
              Reservá, gestioná y cancelá tus turnos de forma simple. Accedé a especialidades y médicos en un entorno moderno y seguro.
            </p>
            <div className="d-flex gap-3 justify-content-center justify-content-lg-start mt-3">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="btn btn-outline-primary px-4">Iniciar sesión</Link>
                  <Link to="/registro" className="btn btn-primary px-4">Registrarse</Link>
                </>
              ) : (
                <Link to="/mis-turnos" className="btn btn-primary px-4">Ir a mis turnos</Link>
              )}
            </div>
          </div>
          <div className="col-lg-5">
            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <div className="card card-accent feature-card p-3 h-100 text-center">
                  <div className="icon-circle mx-auto mb-2"><IconSteth /></div>
                  <h6 className="fw-bold">Especialistas</h6>
                  <p className="text-muted small mb-0">Elegí entre múltiples especialidades médicas.</p>
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div className="card card-accent feature-card p-3 h-100 text-center">
                  <div className="icon-circle mx-auto mb-2"><IconCalendar /></div>
                  <h6 className="fw-bold">Turnos Online</h6>
                  <p className="text-muted small mb-0">Reservá y cancelá tus turnos cuando quieras.</p>
                </div>
              </div>
              <div className="col-12">
                <div className="card card-accent feature-card p-3 h-100 text-center">
                  <div className="icon-circle mx-auto mb-2"><IconHospital /></div>
                  <h6 className="fw-bold">Atención Segura</h6>
                  <p className="text-muted small mb-0">Tu información se maneja de forma segura.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

