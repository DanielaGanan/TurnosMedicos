import { useState } from 'react';

function Login() {
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
        // Aquí podés guardar los datos del usuario si querés
        localStorage.setItem('usuario', JSON.stringify(data));
      } else {
        setMensaje(data.detail || 'Error al iniciar sesión');
      }
    } catch (error) {
      setMensaje("Error de conexión" + error.message);
    }
  };

  return (
    <div>
      <h2>Iniciar Sesion</h2>
      
      {mensaje && <p>{mensaje}</p>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">
          Iniciar Sesión
        </button>
      </form>

      <p>
        ¿No tenés cuenta? <a href="/registro">Registrate aquí</a>
      </p>
    </div>
  );
}

export default Login;