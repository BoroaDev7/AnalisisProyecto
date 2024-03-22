import React from "react";
import Tps from "./Tsp";
import Hamilton from "./Hamilton";
import Knapsack from "./Knapsack";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import "./App.css";

function Navigation() {
  let navigate = useNavigate();

  return (
    <div className="body-container">
      <h2 className="titulo">Bienvenido al Visualizador de Problemas NP</h2>
      <div className="cards-container">
        <div className="card">
          <button onClick={() => navigate("/tps")}>Ir a Tps</button>
        </div>
        <div className="card">
          <button onClick={() => navigate("/hamilton")}>Ir a Hamilton</button>
        </div>
        <div className="card">
          <button onClick={() => navigate("/knapsack")}>Ir a Knapsack</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigation />} />
        <Route path="/tps" element={<Tps />} />
        <Route path="/hamilton" element={<Hamilton />} />
        <Route path="/knapsack" element={<Knapsack />} />
      </Routes>
    </Router>
  );
}
export default App;
