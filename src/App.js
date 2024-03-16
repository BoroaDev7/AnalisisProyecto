import React from "react";
import Tps from "./Tsp";
import Hamilton from "./hamilton"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

function Navigation() {
  let navigate = useNavigate();

  return <button onClick={() => navigate("/tps")}>Ir a Tps</button>;
   <button onClick={() =>navigate("/hamilton"}}> Ir a Hamilton </button>;
}

function App() {
  return (
    <Router>
      <div>
        <Navigation />
        <Routes>
          <Route path="/tps" element={<Tps />} />
          <Route path="/hamilton" element={<Hamilton/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
