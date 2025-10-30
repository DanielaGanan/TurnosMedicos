import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Especialidades from "./components/Especialidades";
import Medicos from "./components/Medicos";
import Turnos from "./components/Turnos";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<h3>Bienvenido al sistema de Turnos Médicos</h3>} />
          <Route path="/especialidades" element={<Especialidades />} />
          <Route path="/medicos" element={<Medicos />} />
          <Route path="/turnos" element={<Turnos />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
