import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { usuariosAPI } from '../services/api.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate('/mis-turnos');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await usuariosAPI.login(email, password);
      login(data);
      setMensaje(`¡Bienvenido ${data.nombre}!`);
      navigate('/mis-turnos');
    } catch (error) {
      const detail = error?.response?.data?.detail;
      setMensaje(detail || 'Error al iniciar sesion');
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

      <p className="mt-3">¿No tenés cuenta? <a href="/registro">Registrate acá</a></p>
    </div>
  );
}

