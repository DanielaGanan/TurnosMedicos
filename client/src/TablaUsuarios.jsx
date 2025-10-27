function TablaUsuarios({ usuarios }) {
    return (
      <table className="table table-hover table-striped">
        <thead className="table-primary">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
            {usuarios.map((usuarios) => (
                <tr key={usuarios.id}>
                    <td>{usuarios.id}</td>
                    <td>{usuarios.nombre}</td>
                    <td>{usuarios.apellido}</td>
                    <td>{usuarios.email}</td>
                </tr>
            ))}
        </tbody>
      </table>
    );
}

export default TablaUsuarios;