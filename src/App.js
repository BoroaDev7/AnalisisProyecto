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

function Navigation() {
  let navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate("/tps")}>Ir a Tps</button>
      <button onClick={() => navigate("/hamilton")}>Ir a Hamilton</button>
      <button onClick={() => navigate("/Knapsack")}>Ir a Knapsack</button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div>
        <Navigation />
        <Routes>
          <Route path="/tps" element={<Tps />} />
          <Route path="/hamilton" element={<Hamilton />} />
          <Route path="/Knapsack" element={<Knapsack />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
