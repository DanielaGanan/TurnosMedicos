import { useState } from "react";

function Registro() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    telefono: "",
    dni: "",
    fecha_nacimiento: "",
    direccion: "",
  });
  const [mensaje, setMensaje] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/usuarios/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje("Usuario registrado exitosamente");
        // Limpiar formulario
        setFormData({
          nombre: "",
          apellido: "",
          email: "",
          password: "",
          telefono: "",
          dni: "",
          fecha_nacimiento: "",
          direccion: "",
        });
      } else {
        setMensaje(data.detail || "Error al registrar");
      }
    } catch (error) {
      setMensaje("Error de conexión: " + error.message);
    }
  };

  return (
    <div>
      <h2>Registrarse</h2>

      {mensaje && (
        <p>
          {mensaje}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <div>
            <label>Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Apellido:</label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>DNI:</label>
            <input
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Teléfono:</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Fecha de Nacimiento:</label>
            <input
              type="date"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <label>Dirección:</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">
          Registrarse
        </button>
      </form>

      <p>
        ¿Ya tenés cuenta? <a href="/login">Iniciá sesión aquí</a>
      </p>
    </div>
  );
}

export default Registro;
