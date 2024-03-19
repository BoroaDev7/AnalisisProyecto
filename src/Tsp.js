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

  function calculateTSP(points) {
    if (points.length < 2) return;

    const inicioAlgo = performance.now();
    const latLngPoints = points.map((point) => L.latLng(point.lat, point.lng));

    let path = [0];
    let totalDistance = 0;

    for (let i = 0; i < latLngPoints.length - 1; i++) {
      let last = path[path.length - 1];
      let nextMinDist = Infinity;
      let nextIndex = -1;

      for (let j = 0; j < latLngPoints.length; j++) {
        if (!path.includes(j)) {
          let dist = latLngPoints[last].distanceTo(latLngPoints[j]);
          if (dist < nextMinDist) {
            nextMinDist = dist;
            nextIndex = j;
          }
        }
      }

      if (nextIndex !== -1) {
        path.push(nextIndex);
        totalDistance += nextMinDist;
      }
    }

    totalDistance += latLngPoints[path[0]].distanceTo(
      latLngPoints[path[path.length - 1]]
    );
    let initialDistance = totalDistance;

    let improved = true;
    while (improved) {
      improved = false;
      for (let i = 0; i < path.length - 1; i++) {
        for (let j = i + 1; j < path.length; j++) {
          if (twoOptSwap(latLngPoints, path, i, j)) {
            improved = true;
          }
        }
      }
    }
    let adjList = path.map((current, index) => {
      let next = path[(index + 1) % path.length];
      return {
        from: current,
        to: next,
        distance: latLngPoints[current].distanceTo(latLngPoints[next]),
      };
    });

    totalDistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      totalDistance += latLngPoints[path[i]].distanceTo(
        latLngPoints[path[i + 1]]
      );
    }
    totalDistance += latLngPoints[path[0]].distanceTo(
      latLngPoints[path[path.length - 1]]
    );

    setTiempoAlg(performance.now() - inicioAlgo);

    const latLngPath = path.map((index) => latLngPoints[index]);
    latLngPath.push(latLngPoints[path[0]]);
    setTspPath(latLngPath.map((point) => [point.lat, point.lng]));
    setInitialPathDistance(initialDistance / 1000);
    setTspResults({
      totalDistance: totalDistance / 1000,
      path: adjList,
      initialDistance: initialDistance / 1000,
    });
  }

  function twoOptSwap(latLngPoints, path, i, j) {
    let distBefore =
      latLngPoints[path[i]].distanceTo(latLngPoints[path[i + 1]]) +
      latLngPoints[path[j]].distanceTo(
        latLngPoints[path[(j + 1) % path.length]]
      );
    let distAfter =
      latLngPoints[path[i]].distanceTo(latLngPoints[path[j]]) +
      latLngPoints[path[i + 1]].distanceTo(
        latLngPoints[path[(j + 1) % path.length]]
      );

    if (distAfter < distBefore) {
      reversePathSegment(path, i + 1, j);
      return true;
    }

    return false;
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
