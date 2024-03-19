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

function crearIcono(numero) {
  return new DivIcon({
    html: `<div style="background-color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; justify-content: center; align-items: center;">${numero}</div>`,
    className: "",
    iconSize: [25, 25],
  });
}

function MarcadorUbicacion({ marcadores, setMarcadores, caminoTSP }) {
  useMapEvents({
    click(e) {
      const nuevosMarcadores = [...marcadores, e.latlng];
      setMarcadores(nuevosMarcadores);
    },
    contextmenu(e) {
      e.originalEvent.preventDefault();
      const nuevosMarcadores = marcadores.slice(0, marcadores.length - 1);
      setMarcadores(nuevosMarcadores);
    },
  });

  return (
    <>
      {marcadores.map((position, idx) => (
        <Marker key={idx} position={position} icon={crearIcono(idx + 1)} />
      ))}
      <Polyline
        positions={marcadores.map((marcador) => [marcador.lat, marcador.lng])}
        color="blue"
      />
      <Polyline positions={caminoTSP} color="red" />
    </>
  );
}

function TSP() {
  const [marcadores, setMarcadores] = useState([]);
  const [distanciaInicial, setDistanciaInicial] = useState(0);
  const [caminoTSP, setCaminoTSP] = useState([]);
  const [tiempoAlgoritmo, setTiempoAlgoritmo] = useState(null);
  const [numeroNodos, setNumeroNodos] = useState(0);
  const [resultadosTSP, setResultadosTSP] = useState(null);

  const generarMarcadoresAleatorios = (num) => {
    const nuevosMarcadores = [];
    const rangoLat = { min: 12.0, max: 16.0 };
    const rangoLng = { min: -89.0, max: -83.0 };

    for (let i = 0; i < num; i++) {
      const lat = Math.random() * (rangoLat.max - rangoLat.min) + rangoLat.min;
      const lng = Math.random() * (rangoLng.max - rangoLng.min) + rangoLng.min;
      nuevosMarcadores.push(L.latLng(lat, lng));
    }
    setMarcadores(nuevosMarcadores);
  };

  const manejarCambioNumeroNodos = (e) => {
    setNumeroNodos(parseInt(e.target.value) || 0);
  };

  const agregarMarcadoresAleatorios = () => {
    generarMarcadoresAleatorios(numeroNodos);
  };

  const reiniciarMapa = () => {
    setMarcadores([]);
    setTiempoAlgoritmo(0);
    setDistanciaInicial(0);
    setCaminoTSP([]);
    setResultadosTSP(null);
  };

  const calcularTSP = (puntos) => {
    if (puntos.length < 2) return;

    const inicioAlgoritmo = performance.now();
    const puntosLatLng = puntos.map((punto) => L.latLng(punto.lat, punto.lng));

    let camino = [0];
    let distanciaTotal = 0;

    for (let i = 0; i < puntosLatLng.length - 1; i++) {
      let ultimo = camino[camino.length - 1];
      let distanciaMinimaProximo = Infinity;
      let indiceProximo = -1;

      for (let j = 0; j < puntosLatLng.length; j++) {
        if (!camino.includes(j)) {
          let dist = puntosLatLng[ultimo].distanceTo(puntosLatLng[j]);
          if (dist < distanciaMinimaProximo) {
            distanciaMinimaProximo = dist;
            indiceProximo = j;
          }
        }
      }

      if (indiceProximo !== -1) {
        camino.push(indiceProximo);
        distanciaTotal += distanciaMinimaProximo;
      }
    }

    distanciaTotal += puntosLatLng[camino[0]].distanceTo(
      puntosLatLng[camino[camino.length - 1]]
    );
    let distanciaInicial = distanciaTotal;

    let mejorado = true;
    while (mejorado) {
      mejorado = false;
      for (let i = 0; i < camino.length - 1; i++) {
        for (let j = i + 1; j < camino.length; j++) {
          if (twoOptSwap(puntosLatLng, camino, i, j)) {
            mejorado = true;
          }
        }
      }
    }

    let listaAdyacencia = camino.map((actual, indice) => {
      let siguiente = camino[(indice + 1) % camino.length];
      return {
        from: actual,
        to: siguiente,
        distance: puntosLatLng[actual].distanceTo(puntosLatLng[siguiente]),
      };
    });

    distanciaTotal = 0;
    for (let i = 0; i < camino.length - 1; i++) {
      distanciaTotal += puntosLatLng[camino[i]].distanceTo(
        puntosLatLng[camino[i + 1]]
      );
    }
    distanciaTotal += puntosLatLng[camino[0]].distanceTo(
      puntosLatLng[camino[camino.length - 1]]
    );

    setTiempoAlgoritmo(performance.now() - inicioAlgoritmo);

    const caminoLatLng = camino.map((indice) => puntosLatLng[indice]);
    caminoLatLng.push(puntosLatLng[camino[0]]);
    setCaminoTSP(caminoLatLng.map((punto) => [punto.lat, punto.lng]));
    setDistanciaInicial(distanciaInicial / 1000);
    setResultadosTSP({
      distanciaTotal: distanciaTotal / 1000,
      camino: listaAdyacencia,
      distanciaInicial: distanciaInicial / 1000,
    });
  };

  const twoOptSwap = (puntosLatLng, camino, i, j) => {
    let distAntes =
      puntosLatLng[camino[i]].distanceTo(puntosLatLng[camino[i + 1]]) +
      puntosLatLng[camino[j]].distanceTo(
        puntosLatLng[camino[(j + 1) % camino.length]]
      );
    let distDespues =
      puntosLatLng[camino[i]].distanceTo(puntosLatLng[camino[j]]) +
      puntosLatLng[camino[i + 1]].distanceTo(
        puntosLatLng[camino[(j + 1) % camino.length]]
      );

    if (distDespues < distAntes) {
      invertirSegmentoCamino(camino, i + 1, j);
      return true;
    }

    return false;
  };

  const invertirSegmentoCamino = (camino, inicio, fin) => {
    while (inicio < fin) {
      [camino[inicio], camino[fin]] = [camino[fin], camino[inicio]];
      inicio++;
      fin--;
    }
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
          <MarcadorUbicacion
            marcadores={marcadores}
            setMarcadores={setMarcadores}
            caminoTSP={caminoTSP}
          />
        </MapContainer>
      </div>
      <div style={{ width: "20%", padding: "10px", overflowY: "auto" }}>
        <input
          type="number"
          value={numeroNodos}
          onChange={manejarCambioNumeroNodos}
          placeholder="Número de nodos"
        />
        <button onClick={agregarMarcadoresAleatorios}>
          Generar nodos aleatorios
        </button>
        <button onClick={() => calcularTSP(marcadores)}>
          Iniciar simulación
        </button>
        <button onClick={reiniciarMapa}>Resetear Mapa</button>
        <p>Distancia total: {distanciaInicial.toFixed(2)} km</p>
        <p>
          Tiempo de ejecución del algoritmo:{" "}
          {(tiempoAlgoritmo / 1000).toFixed(3)} segundos
        </p>
        {resultadosTSP && (
          <div>
            <h3>Lista de Adyacencia (TSP)</h3>
            {resultadosTSP.camino.map((entry, index) => (
              <div key={index}>
                {`De ${entry.from + 1} a ${entry.to + 1} - Distancia: ${(
                  entry.distance / 1000
                ).toFixed(2)} km`}
              </div>
            ))}
            <p>
              Distancia total TSP: {resultadosTSP.distanciaTotal.toFixed(2)} km
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TSP;
