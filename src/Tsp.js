import React, { useState } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { DivIcon } from "leaflet";
import { Marker, Polyline } from "react-leaflet";

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

function LocationMarker({
  markers,
  setMarkers,
  setInitialPathDistance,
  tspPath,
}) {
  useMapEvents({
    click(e) {
      const newMarkers = [...markers, e.latlng];
      setMarkers(newMarkers);
      calculateInitialPathDistance(newMarkers);
    },
    contextmenu(e) {
      e.originalEvent.preventDefault();
      const newMarkers = markers.slice(0, markers.length - 1);
      setMarkers(newMarkers);
      calculateInitialPathDistance(newMarkers);
    },
  });

  const calculateInitialPathDistance = (points) => {
    let distance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      distance += points[i].distanceTo(points[i + 1]);
    }
    setInitialPathDistance(distance / 1000); // Convert meters to kilometers
  };

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
  const [tspResults, setTspResults] = useState(null);

  const calculateTSP = (points) => {
    if (points.length < 2) return;

    const distances = points.map((point, i) =>
      points.map((otherPoint, j) =>
        i === j ? Infinity : point.distanceTo(otherPoint)
      )
    );

    let path = [0];
    let visited = new Set(path);
    let totalDistance = 0;
    let adjacencyList = [];

    while (path.length < points.length) {
      let last = path[path.length - 1];
      let nextMinDist = Infinity;
      let nextIndex = -1;

      distances[last].forEach((dist, index) => {
        if (dist < nextMinDist && !visited.has(index)) {
          nextMinDist = dist;
          nextIndex = index;
        }
      });

      if (nextIndex >= 0) {
        path.push(nextIndex);
        visited.add(nextIndex);
        totalDistance += nextMinDist;
        adjacencyList.push({
          from: last,
          to: nextIndex,
          distance: nextMinDist / 1000,
        });
      }
    }

    if (path.length > 1) {
      const returnDistance = distances[path[path.length - 1]][0];
      totalDistance += returnDistance;
      adjacencyList.push({
        from: path[path.length - 1],
        to: 0,
        distance: returnDistance / 1000,
      });
    }

    const latLngPath = path.map((index) => points[index]);
    latLngPath.push(points[0]);
    setTspPath(latLngPath.map((point) => [point.lat, point.lng]));
    setTspResults({ path: adjacencyList, totalDistance: totalDistance / 1000 });
  };

  const startSimulation = () => {
    calculateTSP(markers);
  };

  const resetMap = () => {
    setMarkers([]);
    setInitialPathDistance(0);
    setTspPath([]);
    setTspResults(null);
  };

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
            setInitialPathDistance={setInitialPathDistance}
            tspPath={tspPath}
          />
        </MapContainer>
      </div>
      <div style={{ width: "20%", padding: "10px", overflowY: "auto" }}>
        <button onClick={startSimulation}>Iniciar simulación</button>
        <button onClick={resetMap}>Resetear Mapa</button>
        <p>Distancia total inicial: {initialPathDistance.toFixed(2)} km</p>
        {tspResults && (
          <>
            <h3>Lista de Adyacencia (TSP)</h3>
            {tspResults.path.map((entry, index) => (
              <div key={index}>
                {`De ${entry.from + 1} a ${
                  entry.to + 1
                } - Distancia: ${entry.distance.toFixed(2)} km`}
              </div>
            ))}
            <p>Distancia total TSP: {tspResults.totalDistance.toFixed(2)} km</p>
          </>
        )}
      </div>
    </div>
  );
}

export default Tsp;
