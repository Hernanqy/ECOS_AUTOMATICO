import "./App.css";

type RouteItem = {
  id: string;
  label: string;
  icon: string;
};

const routeItems: RouteItem[] = [
  { id: "museo", label: "Museo", icon: "/icons/museo.png" },
  { id: "lago", label: "Lago", icon: "/icons/lago.png" },
  { id: "condorera", label: "Condorera", icon: "/icons/condorera.png" },
  { id: "casona", label: "Casona", icon: "/icons/casona.png" }
];

function NavIcon({ type }: { type: "inicio" | "mapa" | "eco" | "logros" | "menu" }) {
  if (type === "inicio") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M5 15 16 6l11 9" />
        <path d="M9 15v12h14V15" />
      </svg>
    );
  }

  if (type === "mapa") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M4 8l7-3 10 4 7-3v18l-7 3-10-4-7 3V8Z" />
        <path d="M11 5v18" />
        <path d="M21 9v18" />
      </svg>
    );
  }

  if (type === "eco") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="3" />
        <path d="M10 11a8 8 0 0 0 0 10" />
        <path d="M22 11a8 8 0 0 1 0 10" />
        <path d="M6 7a14 14 0 0 0 0 18" />
        <path d="M26 7a14 14 0 0 1 0 18" />
      </svg>
    );
  }

  if (type === "logros") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="m16 4 3.6 7.4 8.1 1.2-5.9 5.7 1.4 8.1-7.2-3.8-7.2 3.8 1.4-8.1-5.9-5.7 8.1-1.2L16 4Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M7 10h18" />
      <path d="M7 16h18" />
      <path d="M7 22h18" />
    </svg>
  );
}

function App() {
  return (
    <main className="app-shell">
      <section className="phone-screen">
        <header className="top-brand centered-brand">
          <div className="maxima-brand-box">
            <img src="/logo-la-maxima.png" alt="Polo Educativo y Recreativo La Máxima" />
          </div>
        </header>

        <div className="background-lines" aria-hidden="true">
          <svg className="line-dome" viewBox="0 0 180 240">
            <path d="M22 210h120" />
            <path d="M40 210V105" />
            <path d="M128 210V105" />
            <path d="M34 105h102" />
            <path d="M46 105c4-38 28-61 39-61s35 23 39 61" />
            <path d="M85 44V18" />
            <path d="M72 18h26" />
            <path d="M60 210v-66" />
            <path d="M84 210v-66" />
            <path d="M108 210v-66" />
          </svg>

          <svg className="line-bird" viewBox="0 0 160 100">
            <path d="M15 50c28-20 50-22 75-6" />
            <path d="M90 44c18-28 39-36 58-34" />
            <path d="M90 44c15 26 36 38 58 39" />
          </svg>

          <svg className="line-waves" viewBox="0 0 360 120">
            <path d="M0 45c45-28 90 28 135 0s90-28 135 0 60 19 90 0" />
            <path d="M0 75c45-28 90 28 135 0s90-28 135 0 60 19 90 0" />
          </svg>
        </div>

        <section className="hero-section">
          <div className="title-block">
            <h1>
              <span>Ecos de</span>
              <strong>La Máxima</strong>
            </h1>

            <div className="echo-mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>

            <p>Explorá el Polo y encontrá los ecos escondidos.</p>
          </div>

          <div className="guide-wrap">
            <div className="speech-bubble">
              <strong>¡Hola!</strong>
              <span>Soy tu guía.</span>
            </div>

            <img className="guide-character" src="/personaje.png" alt="Guía de la experiencia" />
          </div>
        </section>

        <section className="route-card">
          <div className="route-path" aria-hidden="true">
            <svg viewBox="0 0 760 120" preserveAspectRatio="none">
              <path d="M78 67 C160 20, 214 110, 292 67 S432 20, 510 67 S650 110, 730 67" />
            </svg>
          </div>

          <div className="route-grid">
            {routeItems.map((item) => (
              <div className="route-item" key={item.id}>
                <div className="zone-icon">
                  <img src={item.icon} alt={item.label} />
                </div>
                <span className="route-dot" />
                <strong>{item.label}</strong>
              </div>
            ))}
          </div>

          <button className="start-button">
            <span>Comenzar</span>
            <svg viewBox="0 0 40 40" aria-hidden="true">
              <path d="M8 20h22" />
              <path d="m22 11 9 9-9 9" />
            </svg>
          </button>
        </section>

        <nav className="bottom-nav" aria-label="Navegación principal">
          <button className="nav-item active">
            <NavIcon type="inicio" />
            <span>Inicio</span>
          </button>

          <button className="nav-item">
            <NavIcon type="mapa" />
            <span>Mapa</span>
          </button>

          <button className="scan-nav">
            <NavIcon type="eco" />
          </button>

          <button className="nav-item">
            <NavIcon type="logros" />
            <span>Logros</span>
          </button>

          <button className="nav-item">
            <NavIcon type="menu" />
            <span>Menú</span>
          </button>
        </nav>
      </section>
    </main>
  );
}

export default App;
