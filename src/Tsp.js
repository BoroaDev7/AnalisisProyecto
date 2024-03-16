import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function LocationMarker() {
  const [markers, setMarkers] = useState([]);
  const [tspPath, setTspPath] = useState([]);
  const [directDistance, setDirectDistance] = useState(0);
  const [tspDistance, setTspDistance] = useState(0);

  useMapEvents({
    click(e) {
      const newMarkers = [...markers, e.latlng];
      setMarkers(newMarkers);
      updateDistances(newMarkers);
    },
    contextmenu(e) {
      e.originalEvent.preventDefault();
      const newMarkers = markers.slice(0, markers.length - 1);
      setMarkers(newMarkers);
      updateDistances(newMarkers);
    },
  });

  const updateDistances = (newMarkers) => {
    calculateDirectDistance(newMarkers);
    if (newMarkers.length > 2) {
      calculateTSP(newMarkers);
    } else {
      setTspPath([]);
      setTspDistance(0);
    }
  };

  const calculateTSP = (points) => {
    const distances = points.map((point, i) =>
      points.map(
        (otherPoint, j) =>
          i === j ? Infinity : point.distanceTo(otherPoint) / 1000 // Convertir metros a kilómetros
      )
    );

    const included = new Set([0]);
    const remaining = new Set(points.keys());
    remaining.delete(0);

    const mstEdges = [];

    while (remaining.size > 0) {
      let minDistance = Infinity;
      let minEdge = null;

      for (let i of included) {
        for (let j of remaining) {
          if (distances[i][j] < minDistance) {
            minDistance = distances[i][j];
            minEdge = { from: i, to: j, distance: minDistance };
          }
        }
      }

      if (minEdge) {
        mstEdges.push(minEdge);
        included.add(minEdge.to);
        remaining.delete(minEdge.to);
      }
    }

    const tspPath = [points[0]];
    let tspDistance = 0;

    while (mstEdges.length > 0) {
      for (let i = 0; i < mstEdges.length; i++) {
        const edge = mstEdges[i];
        if (tspPath.some((point) => points.indexOf(point) === edge.from)) {
          tspPath.push(points[edge.to]);
          tspDistance += edge.distance;
          mstEdges.splice(i, 1);
          break;
        }
      }
    }

    setTspPath(tspPath.map((point) => [point.lat, point.lng]));
    setTspDistance(tspDistance);
  };

  const calculateDirectDistance = (points) => {
    setDirectDistance(calculateTotalDistance(points));
  };

  const calculateTotalDistance = (points) => {
    let totalDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      totalDistance += points[i].distanceTo(points[i + 1]);
    }
    return totalDistance / 1000;
  };

  const resetMap = () => {
    setMarkers([]);
    setTspPath([]);
    setDirectDistance(0);
    setTspDistance(0);
  };

  return (
    <>
      {markers.map((position, idx) => (
        <Marker key={idx} position={position}></Marker>
      ))}
      <Polyline positions={markers} color="blue" />
      <Polyline positions={tspPath} color="red" />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1000,
          backgroundColor: "white",
          padding: "10px",
        }}
      >
        <p>Distancia directa: {directDistance.toFixed(2)} km</p>
        <p>Distancia TSP: {tspDistance.toFixed(2)} km</p>
        <button onClick={resetMap}>Resetear Mapa</button>
      </div>
    </>
  );
}

function Tsp() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <MapContainer
        center={[14.1, -86.5]}
        zoom={7}
        style={{ height: "800px", width: "80%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <LocationMarker />
      </MapContainer>
    </div>
  );
}

export default Tsp;
