import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { DivIcon } from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function createIcon(number) {
  return new DivIcon({
    html: `<div style="background-color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; justify-content: center; align-items: center;">${number}</div>`,
    className: "",
    iconSize: [25, 25],
  });
}

function LocationMarker({ markers, setMarkers, tspPath }) {
  useMapEvents({
    click(e) {
      const newMarkers = [...markers, e.latlng];
      setMarkers(newMarkers);
    },
    contextmenu(e) {
      e.originalEvent.preventDefault();
      const newMarkers = markers.slice(0, markers.length - 1);
      setMarkers(newMarkers);
    },
  });

  return (
    <>
      {markers.map((position, idx) => (
        <Marker key={idx} position={position} icon={createIcon(idx + 1)} />
      ))}
      <Polyline
        positions={markers.map((marker) => [marker.lat, marker.lng])}
        color="blue"
      />
      <Polyline positions={tspPath} color="red" />
    </>
  );
}

function Tsp() {
  const [markers, setMarkers] = useState([]);
  const [initialPathDistance, setInitialPathDistance] = useState(0);
  const [tspPath, setTspPath] = useState([]);
  const [tiempoAlg, setTiempoAlg] = useState(null);
  const [numNodos, setNumNodos] = useState(0);
  const [tspResults, setTspResults] = useState(null);

  const generateRandomMarkers = (num) => {
    const newMarkers = [];
    const latRange = { min: 12.0, max: 16.0 };
    const lngRange = { min: -89.0, max: -83.0 };

    for (let i = 0; i < num; i++) {
      const lat = Math.random() * (latRange.max - latRange.min) + latRange.min;
      const lng = Math.random() * (lngRange.max - lngRange.min) + lngRange.min;
      newMarkers.push(L.latLng(lat, lng));
    }
    setMarkers(newMarkers);
  };

  const handleNumNodosChange = (e) => {
    setNumNodos(parseInt(e.target.value) || 0);
  };

  const addRandomMarkers = () => {
    generateRandomMarkers(numNodos);
  };

  const resetMap = () => {
    setMarkers([]);
    setTiempoAlg(0);
    setInitialPathDistance(0);
    setTspPath([]);
    setTspResults(null);
  };

  const calculateTSP = (points) => {
    if (points.length < 2) return;

    const inicioAlgo = performance.now();
    const path = [0];
    let totalDistance = 0;
    let adjacencyList = [];

    while (path.length < points.length) {
      let last = path[path.length - 1];
      let nextMinDist = Infinity;
      let nextIndex = -1;

      for (let i = 0; i < points.length; i++) {
        if (!path.includes(i)) {
          let dist = points[last].distanceTo(points[i]);
          if (dist < nextMinDist) {
            nextMinDist = dist;
            nextIndex = i;
          }
        }
      }

      if (nextIndex >= 0) {
        path.push(nextIndex);
        adjacencyList.push({
          from: last,
          to: nextIndex,
          distance: nextMinDist,
        });
        totalDistance += nextMinDist;
      }
    }

    totalDistance += points[path[0]].distanceTo(points[path[path.length - 1]]);
    adjacencyList.push({
      from: path[path.length - 1],
      to: path[0],
      distance: points[path[0]].distanceTo(points[path[path.length - 1]]),
    });

    let improved = true;
    while (improved) {
      improved = false;
      for (let i = 0; i < path.length - 1; i++) {
        for (let j = i + 1; j < path.length; j++) {
          if (twoOptSwap(points, path, i, j)) {
            improved = true;
          }
        }
      }
    }

    totalDistance = 0;
    adjacencyList = [];
    for (let i = 0; i < path.length - 1; i++) {
      let dist = points[path[i]].distanceTo(points[path[i + 1]]);
      totalDistance += dist;
      adjacencyList.push({ from: path[i], to: path[i + 1], distance: dist });
    }
    totalDistance += points[path[0]].distanceTo(points[path[path.length - 1]]);
    adjacencyList.push({
      from: path[path.length - 1],
      to: path[0],
      distance: points[path[0]].distanceTo(points[path[path.length - 1]]),
    });

    const finalAlgo = performance.now();
    setTiempoAlg(finalAlgo - inicioAlgo);
    setInitialPathDistance(totalDistance / 1000);

    const latLngPath = path.map((index) => points[index]);
    latLngPath.push(points[0]);
    setTspPath(latLngPath.map((point) => [point.lat, point.lng]));
    setTspResults({ path: adjacencyList, totalDistance: totalDistance / 1000 });
  };

  function twoOptSwap(points, path, i, j) {
    let needToSwap = false;
    let distBefore =
      points[path[i]].distanceTo(points[path[i + 1]]) +
      points[path[j]].distanceTo(points[path[(j + 1) % path.length]]);
    let distAfter =
      points[path[i]].distanceTo(points[path[j]]) +
      points[path[i + 1]].distanceTo(points[path[(j + 1) % path.length]]);

    if (distAfter < distBefore) {
      needToSwap = true;
      reversePathSegment(path, i + 1, j);
    }

    return needToSwap;
  }

  function reversePathSegment(path, start, end) {
    while (start < end) {
      [path[start], path[end]] = [path[end], path[start]];
      start++;
      end--;
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "80%" }}>
        <MapContainer
          center={[14.1, -86.5]}
          zoom={7}
          style={{ height: "100vh" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <LocationMarker
            markers={markers}
            setMarkers={setMarkers}
            tspPath={tspPath}
          />
        </MapContainer>
      </div>
      <div style={{ width: "20%", padding: "10px", overflowY: "auto" }}>
        <input
          type="number"
          value={numNodos}
          onChange={handleNumNodosChange}
          placeholder="Número de nodos"
        />
        <button onClick={addRandomMarkers}>Generar nodos aleatorios</button>
        <button onClick={() => calculateTSP(markers)}>
          Iniciar simulación
        </button>
        <button onClick={resetMap}>Resetear Mapa</button>
        <p>Distancia total: {initialPathDistance.toFixed(2)} km</p>
        <p>
          Tiempo de ejecución del algoritmo: {(tiempoAlg / 1000).toFixed(3)}{" "}
          segundos
        </p>
        {tspResults && (
          <div>
            <h3>Lista de Adyacencia (TSP)</h3>
            {tspResults.path.map((entry, index) => (
              <div key={index}>
                {`De ${entry.from + 1} a ${entry.to + 1} - Distancia: ${(
                  entry.distance / 1000
                ).toFixed(2)} km`}
              </div>
            ))}
            <p>Distancia total TSP: {tspResults.totalDistance.toFixed(2)} km</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tsp;
