import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import TablaUsuarios from "./TablaUsuarios";

function App() {
  const [count, setCount] = useState(0);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Para cargar tablaUsuarios
  useEffect(() => {
    fetch('http://127.0.0.1:8000/usuarios/')
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }
      return response.json();
    })
    .then(data => {
      setUsuarios(data);
      setLoading(false);
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
  }, []);


  return (
    <>
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

      
      <div style={{ marginTop: '2rem'}}>
        <h2>Lista de Usuarios</h2>
        {loading && <p>Cargando usuarios</p>}
        {error && <p style={{color: 'red'}}> Error: {error}</p>}
        {!loading && !error && <TablaUsuarios usuarios={usuarios} /> }
      </div>


      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
