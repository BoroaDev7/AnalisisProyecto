import React, { useState } from "react";
import { Graph } from "react-d3-graph";

const RandomGraph = () => {
  const [numNodes, setNumNodes] = useState(0);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [hamiltonianPath, setHamiltonianPath] = useState([]);
  const [hasHamiltonianCycle, setHasHamiltonianCycle] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  
const generateRandomGraph = () => {
  const nodes = Array.from({ length: numNodes }, (_, i) => ({ id: i }));
  
  const links = [];
  for (let i = 0; i < numNodes; i++) {
    const numEdges = Math.floor(Math.random() * (numNodes - 1)); 
    const connectedNodes = new Set(); 
    let attempts = 0; 
  
    while (connectedNodes.size < numEdges && attempts < numNodes) {
      const target = Math.floor(Math.random() * numNodes);
      if (target !== i && !connectedNodes.has(target) && !links.some(link => link.source === target && link.target === i)) {
        connectedNodes.add(target);
        links.push({ source: i, target });
      } else {
        attempts++; 
      }
    }
  }

  setGraphData({ nodes, links });
  setHasHamiltonianCycle(false);
  setExecutionTime(null);
};



  const handleNumNodesChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) { 
      setNumNodes(value);
    }
  };


  const hasHamiltonian = (graphData) => {
    const visited = new Array(graphData.nodes.length).fill(false); 
    const path = []; 
  
    const search = (currentNode, remainingNodes) => {
      visited[currentNode] = true; 
      path.push(currentNode); 

      if (remainingNodes === 0) {
        if (graphData.links.some(link => (link.source === currentNode && link.target === 0) || (link.source === 0 && link.target === currentNode))) {
          return true; 
        } else {
          visited[currentNode] = false; 
          path.pop(); 
          return false;
        }
      }
  
      for (let i = 0; i < graphData.nodes.length; i++) {
        if (!visited[i] && graphData.links.some(link => (link.source === currentNode && link.target === i) || (link.source === i && link.target === currentNode))) {
          if (search(i, remainingNodes - 1)) {
            return true;
          }
        }
      }
  
      visited[currentNode] = false;
      path.pop();
      return false;
    };
  
    if (search(0, graphData.nodes.length - 1)) {
      path.push(0);
      return path;
    }
    return []; 
  };
  
  const findHamiltonianCycle = () => {
    const startTime = performance.now(); 
    const hamiltonianPath = hasHamiltonian({ nodes: graphData.nodes, links: graphData.links });
    setHamiltonianPath(hamiltonianPath);
    setHasHamiltonianCycle(hamiltonianPath.length > 0);
    if (hamiltonianPath.length > 0) {
      const coloredNodes = [...graphData.nodes]; 
      const coloredLinks = [...graphData.links]; 
      for (let i = 0; i < hamiltonianPath.length; i++) {
        const currentNode = hamiltonianPath[i];
        const nextNode = hamiltonianPath[(i + 1) % hamiltonianPath.length];
        coloredNodes[currentNode] = { ...coloredNodes[currentNode], color: "#FF0000" }; 
        const linkIndex = coloredLinks.findIndex(link => (link.source === currentNode && link.target === nextNode) || (link.source === nextNode && link.target === currentNode));
        coloredLinks[linkIndex] = { ...coloredLinks[linkIndex], color: "#FF0000" }; 
      }
      setGraphData({ nodes: coloredNodes, links: coloredLinks });
    }
    const endTime = performance.now(); 
    setExecutionTime(endTime - startTime);
  };

  return (
    <div style={{ height: "700px", border: "1px solid black" }}>
      <Graph id="random-graph" data={graphData} config={{ directed: false }} />
      <div style={{ marginTop: "10px" }}>
        <label htmlFor="numNodesInput">Cantidad de Nodos:</label>
        <input
          id="numNodesInput"
          type="text"
          value={numNodes}
          onChange={handleNumNodesChange}
          style={{ marginLeft: "5px" }}
        />
      </div>
      <button onClick={generateRandomGraph} style={{ marginTop: "10px" }}>
        Generar Nuevo Grafo
      </button>
      <button onClick={findHamiltonianCycle} style={{ marginTop: "10px", marginLeft: "10px" }}>
        Encontrar Ciclo Hamiltoniano
      </button>
      <div style={{ marginTop: "10px" }}>
        {executionTime !== null && <p>Tiempo de ejecución del algoritmo: {executionTime} milisegundos</p>}
      </div>
      <div style={{ marginTop: "10px" }}>
        {hasHamiltonianCycle && (
          <div>
            <p>Ciclo Hamiltoniano encontrado:</p>
            <p>{hamiltonianPath.join(' -> ')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RandomGraph;



