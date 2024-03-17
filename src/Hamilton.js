import React, { useState } from "react";
import { Graph } from "react-d3-graph";

const RandomGraph = () => {
  const [numNodes, setNumNodes] = useState(0);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [hamiltonianPath, setHamiltonianPath] = useState([]);
  const [hasHamiltonianCycle, setHasHamiltonianCycle] = useState(false);
  // Dentro de la función generateRandomGraph
// Dentro de la función generateRandomGraph
const generateRandomGraph = () => {
  const nodes = Array.from({ length: numNodes }, (_, i) => ({ id: i }));
  
  const links = [];
  for (let i = 0; i < numNodes; i++) {
    const numEdges = Math.floor(Math.random() * (numNodes - 1)); // Genera entre 0 y numNodes - 2 enlaces para cada nodo
    const connectedNodes = new Set();
    while (connectedNodes.size < numEdges) {
      const target = Math.floor(Math.random() * numNodes);
      if (target !== i) {
        connectedNodes.add(target);
      }
    }
    connectedNodes.forEach(target => {
      links.push({ source: i, target });
    });
  }

  //setGraphData({ nodes, links });
  const hamiltonianPath = hasHamiltonian({ nodes, links });
  setHamiltonianPath(hamiltonianPath);
  setHasHamiltonianCycle(hamiltonianPath.length > 0);

  // Si hay un ciclo hamiltoniano, establecer el color del ciclo en el grafo
  if (hamiltonianPath.length > 0) {
    const coloredNodes = [...nodes]; // Copiar los nodos
    const coloredLinks = [...links]; // Copiar los enlaces
    for (let i = 0; i < hamiltonianPath.length; i++) {
      const currentNode = hamiltonianPath[i];
      const nextNode = hamiltonianPath[(i + 1) % hamiltonianPath.length]; // El siguiente nodo es el primer nodo si estamos en el último nodo
      // Colorear el nodo actual y el enlace que lo conecta con el siguiente nodo
      coloredNodes[currentNode] = { ...coloredNodes[currentNode], color: "#FF0000" }; // Colorear el nodo actual en rojo
      const linkIndex = coloredLinks.findIndex(link => (link.source === currentNode && link.target === nextNode) || (link.source === nextNode && link.target === currentNode));
      coloredLinks[linkIndex] = { ...coloredLinks[linkIndex], color: "#FF0000" }; // Establecer color rojo para el enlace del ciclo
    }
    // Establecer el estado del grafo con nodos y enlaces coloreados
    setGraphData({ nodes: coloredNodes, links: coloredLinks });
  }
  else{
    setGraphData({ nodes, links });
  }
};



  const handleNumNodesChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) { // Asegurar que el valor sea un número
      setNumNodes(value);
    }
  };


  // Función para verificar si existe un ciclo hamiltoniano y devolver el camino del ciclo si existe
  const hasHamiltonian = (graphData) => {
    const visited = new Array(graphData.nodes.length).fill(false); // Array para realizar seguimiento de los nodos visitados
    const path = []; // Camino actual
    const startNode = 0; // Empieza desde el nodo 0
  
    const dfs = (currentNode, remainingNodes) => {
      visited[currentNode] = true; // Marcar el nodo actual como visitado
      path.push(currentNode); // Agregar el nodo actual al camino
  
      // Si se han visitado todos los nodos, entonces verificar si el último nodo se conecta con el nodo inicial
      if (remainingNodes === 0) {
        if (graphData.links.some(link => link.source === currentNode && link.target === startNode)) {
          return true; // Se encontró un ciclo hamiltoniano
        } else {
          visited[currentNode] = false; // Desmarcar el nodo actual
          path.pop(); // Eliminar el nodo actual del camino
          return false;
        }
      }
  
      // Recorrer los nodos adyacentes no visitados
      for (let i = 0; i < graphData.nodes.length; i++) {
        if (!visited[i] && graphData.links.some(link => (link.source === currentNode && link.target === i) || (link.source === i && link.target === currentNode))) {
          if (dfs(i, remainingNodes - 1)) {
            return true;
          }
        }
      }
  
      // Si no se encuentra un ciclo hamiltoniano a partir del nodo actual, retroceder
      visited[currentNode] = false;
      path.pop();
      return false;
    };
  
    // Iniciar la búsqueda desde el nodo inicial
    if (dfs(startNode, graphData.nodes.length - 1)) {
      path.push(startNode); // Añadir el nodo inicial al final del camino para formar un ciclo
      return path; // Devolver el camino del ciclo hamiltoniano
    }
    return []; // No se encontró ningún ciclo hamiltoniano
  };
  


  return (
    <div style={{ height: "600px", border: "1px solid black" }}>
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



