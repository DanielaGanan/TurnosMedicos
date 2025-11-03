export default function TablaUsuarios({ usuarios = [] }) {
  if (!Array.isArray(usuarios) || usuarios.length === 0) {
    return (
      <div className="alert alert-secondary" role="alert">
        No hay usuarios para mostrar.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-dark table-striped align-middle">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Nombre</th>
            <th scope="col">Apellido</th>
            <th scope="col">Email</th>
            <th scope="col">DNI</th>
            <th scope="col">Teléfono</th>
            <th scope="col">Dirección</th>
            <th scope="col">Activo</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u, idx) => (
            <tr key={u.id_usuario ?? u.id ?? idx}>
              <td>{u.id_usuario ?? u.id ?? "-"}</td>
              <td>{u.nombre ?? "-"}</td>
              <td>{u.apellido ?? "-"}</td>
              <td>{u.email ?? "-"}</td>
              <td>{u.dni ?? "-"}</td>
              <td>{u.telefono ?? "-"}</td>
              <td>{u.direccion ?? "-"}</td>
              <td>{typeof u.activo === 'boolean' ? (u.activo ? 'Sí' : 'No') : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

