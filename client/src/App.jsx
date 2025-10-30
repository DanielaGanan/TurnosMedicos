import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import TablaUsuarios from "./TablaUsuarios";
import Login from "./Login";
import Registro from "./Registro";

// Pagina principal
function Home() {
  const [count, setCount] = useState(0);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Para cargar tablaUsuarios
  useEffect(() => {
    fetch("http://127.0.0.1:8000/usuarios/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al cargar usuarios");
        }
        return response.json();
      })
      .then((data) => {
        setUsuarios(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <>
      {/* menu */}
      <nav>
        <Link to="/">
          Home
        </Link>
        <Link to="/login">
          Login
        </Link>
        <Link to="/registro">
          Registro
        </Link>
      </nav>

      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>

      <div>
        <h2>Lista de Usuarios</h2>
        {loading && <p>Cargando usuarios</p>}
        {error && <p> Error: {error}</p>}
        {!loading && !error && <TablaUsuarios usuarios={usuarios} />}
      </div>

    </>
  );
}


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
