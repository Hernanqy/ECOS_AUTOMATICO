import { useState } from "react";
import "./App.css";

type Zone = {
  id: string;
  name: string;
  title: string;
  mission: string;
  next: string;
};

const zones: Zone[] = [
  {
    id: "museo",
    name: "Museo",
    title: "Ecos del pasado",
    mission: "Buscá 3 ecos en las salas.",
    next: "Ahora vayan hacia el Lago."
  },
  {
    id: "lago",
    name: "Lago",
    title: "Ecos del agua",
    mission: "Buscá 3 ecos cerca del agua.",
    next: "Ahora sigan hacia La Condorera."
  },
  {
    id: "condorera",
    name: "Condorera",
    title: "Ecos del aire",
    mission: "Buscá 3 ecos mirando alto.",
    next: "Ahora vayan hacia La Casona."
  },
  {
    id: "casona",
    name: "Casona",
    title: "Ecos de la casa",
    mission: "Buscá los últimos 3 ecos.",
    next: "Completaron la experiencia."
  }
];

function App() {
  const [screen, setScreen] = useState<"home" | "map" | "mission">("home");
  const [currentZoneIndex, setCurrentZoneIndex] = useState(0);
  const [found, setFound] = useState<Record<string, number>>({
    museo: 0,
    lago: 0,
    condorera: 0,
    casona: 0
  });

  const currentZone = zones[currentZoneIndex];
  const currentFound = found[currentZone.id];

  const handleFakeScan = () => {
    if (currentFound >= 3) return;

    setFound({
      ...found,
      [currentZone.id]: currentFound + 1
    });
  };

  const handleContinue = () => {
    if (currentZoneIndex < zones.length - 1) {
      setCurrentZoneIndex(currentZoneIndex + 1);
      setScreen("map");
    }
  };

  const restartGame = () => {
    setScreen("home");
    setCurrentZoneIndex(0);
    setFound({
      museo: 0,
      lago: 0,
      condorera: 0,
      casona: 0
    });
  };

  return (
    <main className="app">
      {screen === "home" && (
        <section className="screen home-screen">
          <img className="logo" src="/logo-municipio.png" alt="Municipio de Olavarría" />

          <div className="hero">
            <img className="character" src="/personaje.png" alt="Guía de la experiencia" />

            <div className="hero-text">
              <h1>Ecos de La Máxima</h1>
              <p>Explorá el Polo y encontrá los ecos escondidos.</p>
            </div>
          </div>

          <button className="primary-button" onClick={() => setScreen("map")}>
            Comenzar
          </button>
        </section>
      )}

      {screen === "map" && (
        <section className="screen">
          <header className="topbar">
            <button className="back-button" onClick={() => setScreen("home")}>
              ←
            </button>
            <h2>Recorrido</h2>
          </header>

          <div className="map-card">
            {zones.map((zone, index) => {
              const isDone = index < currentZoneIndex;
              const isActive = index === currentZoneIndex;

              return (
                <div
                  className={`map-zone ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}
                  key={zone.id}
                >
                  <span className="zone-dot">{isDone ? "✓" : index + 1}</span>

                  <div>
                    <strong>{zone.name}</strong>
                    <p>{isDone ? "Completo" : isActive ? "Activo" : "Bloqueado"}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="primary-button" onClick={() => setScreen("mission")}>
            Ir a la misión
          </button>
        </section>
      )}

      {screen === "mission" && (
        <section className="screen mission-screen">
          <header className="topbar">
            <button className="back-button" onClick={() => setScreen("map")}>
              ←
            </button>
            <h2>{currentZone.name}</h2>
          </header>

          <div className="mission-card">
            <img className="mini-character" src="/personaje.png" alt="Guía" />

            <span className="zone-label">{currentZone.title}</span>

            <h1>{currentZone.name}</h1>

            <p>{currentZone.mission}</p>

            <div className="progress-box">
              <strong>{currentFound}/3</strong>
              <span>ecos encontrados</span>
            </div>

            {currentFound < 3 && (
              <button className="scan-button" onClick={handleFakeScan}>
                Escanear QR
              </button>
            )}

            {currentFound === 3 && (
              <div className="success-box">
                <h3>¡Misión completa!</h3>
                <p>{currentZone.next}</p>

                {currentZoneIndex < zones.length - 1 ? (
                  <button className="light-button" onClick={handleContinue}>
                    Continuar
                  </button>
                ) : (
                  <button className="light-button" onClick={restartGame}>
                    Finalizar
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
