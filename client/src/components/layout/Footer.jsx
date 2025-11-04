export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="app-footer mt-5">
      <div className="container py-3 d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
        <div className="fw-semibold">
          © {year} Turnos Médicos — Todos los derechos reservados
        </div>
        <div className="credits text-muted">
          Desarrollado por <span className="credit-name">Gañan Daniela</span> y <span className="credit-name">Gonzalez Joaquin</span>
        </div>
      </div>
    </footer>
  );
}

