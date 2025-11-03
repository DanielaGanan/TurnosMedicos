import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje(`¡Bienvenido ${data.nombre}!`);
        localStorage.setItem('usuario', JSON.stringify(data));
      } else {
        setMensaje(data.detail || 'Error al iniciar sesión');
      }
    } catch (error) {
      setMensaje('Error de conexión: ' + error.message);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-3">Iniciar Sesión</h2>

      {mensaje && <div className="alert alert-info py-2">{mensaje}</div>}

      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
        </div>
      </form>

      <p className="mt-3">
        ¿No tenés cuenta? <a href="/registro">Registrate acá</a>
      </p>
    </div>
  );
}

