"use client";

import { useEffect, useMemo, useState } from "react";

type OrderStatus = "reservado" | "pagado" | "preparando" | "listo" | "retirado" | "cancelado";
type Product = "hallullas" | "marraquetas";
type Order = { id: string; code: string; customer: string; rut: string; product: Product; kilos: number; status: OrderStatus; createdAt: number; estimatedMinutes: number; readyAt?: number };

const initialOrder: Order = { id: "demo-1", code: "PAN-247", customer: "María González", rut: "12.345.678-9", product: "hallullas", kilos: 2, status: "preparando", createdAt: Date.now() - 8 * 60_000, estimatedMinutes: 15 };
const statusLabels: Record<OrderStatus, string> = { reservado: "Reservado", pagado: "Pagado", preparando: "Preparando", listo: "Listo para retirar", retirado: "Retirado", cancelado: "Cancelado" };
const productLabels: Record<Product, string> = { hallullas: "Hallullas", marraquetas: "Marraquetas" };
const productPrices: Record<Product, number> = { hallullas: 1800, marraquetas: 2200 };
const palettes = { principal: "Principal Pantone", verde: "Verde fresco", noche: "Noche" } as const;
type Palette = keyof typeof palettes;

function formatKilos(kilos: number) { return `${kilos.toLocaleString("es-CL", { maximumFractionDigits: 1 })} kg`; }
function timeLeft(readyAt?: number) {
  if (!readyAt) return "--:--";
  const seconds = Math.max(0, Math.floor((readyAt + 15 * 60_000 - Date.now()) / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function Home() {
  const [view, setView] = useState<"cliente" | "comercio">("cliente");
  const [palette, setPalette] = useState<Palette>("principal");
  const [product, setProduct] = useState<Product>("hallullas");
  const [order, setOrder] = useState<Order>(initialOrder);
  const [kilos, setKilos] = useState(2);
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [custom, setCustom] = useState("");
  const [step, setStep] = useState<"home" | "quantity" | "review" | "pickup">("home");
  const [notification, setNotification] = useState(false);
  const [breadArrived, setBreadArrived] = useState(true);
  const [mapUpdatedAt, setMapUpdatedAt] = useState(Date.now());
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const saved = localStorage.getItem("fila-facil-order");
    if (saved) setOrder(JSON.parse(saved));
    const savedPalette = localStorage.getItem("fila-facil-palette") as Palette | "azul" | null;
    if (savedPalette === "azul") setPalette("principal");
    else if (savedPalette && savedPalette in palettes) setPalette(savedPalette as Palette);
  }, []);
  useEffect(() => { localStorage.setItem("fila-facil-palette", palette); }, [palette]);
  useEffect(() => { localStorage.setItem("fila-facil-order", JSON.stringify(order)); }, [order]);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => { if (order.status === "listo") setNotification(true); }, [order.status]);

  const countdown = useMemo(() => timeLeft(order.readyAt), [order.readyAt, now]);
  const createOrder = () => { setOrder({ ...order, product, kilos, estimatedMinutes, status: "reservado", code: `PAN-${Math.floor(100 + Math.random() * 899)}`, createdAt: Date.now(), readyAt: undefined }); setStep("pickup"); };
  const markReady = () => { setOrder({ ...order, status: "listo", readyAt: Date.now() }); setNotification(true); };
  const announceFreshBread = () => { setBreadArrived(true); setMapUpdatedAt(Date.now()); setNotification(true); };

  return <main className={`shell palette-${palette}`}>
    <header className="topbar"><div className="brand-mark bread-pair" aria-label="Hallullas y marraquetas calentitas"><span>◉</span><span>✚</span></div><div><p className="eyebrow">PANA</p><h1>Hallullas y marraquetas calentitas</h1></div><label className="palette-picker">Colores<select value={palette} onChange={event => setPalette(event.target.value as Palette)} aria-label="Elegir colores">{Object.entries(palettes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><div className="view-switch" role="group" aria-label="Cambiar vista"><button className={view === "cliente" ? "active" : ""} onClick={() => setView("cliente")}>Soy cliente</button><button className={view === "comercio" ? "active" : ""} onClick={() => setView("comercio")}>Soy del local</button></div></header>
    {notification && <div className="notice" role="status"><span className="notice-icon">✓</span><div><strong>¡Tu pedido ya está listo!</strong><span>Puedes retirarlo mostrando el código {order.code}.</span></div><button aria-label="Cerrar notificación" onClick={() => setNotification(false)}>×</button></div>}
    {view === "cliente" ? <section className="content">
      <div className="hero"><div><span className="pill green">● PANA</span><h2>¿Qué deseas?</h2><p>Elige tu pan favorito y dinos cuántos kilos quieres llevar.</p></div><div className="bread-illustration" aria-hidden="true"><span>◉</span><span>✚</span></div></div>
      {step === "home" && <div className="customer-actions product-actions"><button className="primary giant product-choice" onClick={() => { setProduct("hallullas"); setStep("quantity"); }}><span className="product-emoji">◉</span><span><strong>Hallullas</strong><small>Suavecitas y caseras</small></span><b>→</b></button><button className="secondary giant product-choice" onClick={() => { setProduct("marraquetas"); setStep("quantity"); }}><span className="product-emoji">✚</span><span><strong>Marraquetas</strong><small>Crocantes y recién hechas</small></span><b>→</b></button><button className="text-button" onClick={() => setStep("pickup")}>Ya hice un pedido · Ver retiro</button></div>}
      {step === "home" && <section className="nearby-section" aria-labelledby="nearby-title"><div className="section-heading"><div><span className="step-label">Pan calentito cerca de ti</span><h2 id="nearby-title">Encuentra un local cercano</h2></div><span className="map-live"><i /> En vivo</span></div><div className="map-preview"><div className="map-roads" aria-hidden="true"><span /><span /><span /><span /></div><div className="map-pin pin-one">🥖</div><div className="map-pin pin-two">🥖</div><div className="map-you">Tú</div></div><div className="nearby-card"><div><strong>{breadArrived ? "Pan calentito disponible" : "Buscando locales cercanos"}</strong><span>{breadArrived ? "Panadería Los Trigales · a 4 min" : "Activa tu ubicación para encontrar pan cerca"}</span></div><span className="fresh-time">Actualizado {Math.max(1, Math.floor((Date.now() - mapUpdatedAt) / 60000))} min</span></div></section>}
      {step === "quantity" && <div className="card flow-card"><span className="step-label">{productLabels[product]} · 1 de 2</span><h2>¿Cuántos kilos quieres?</h2><p className="muted">Elige una cantidad para tus {productLabels[product].toLowerCase()}.</p><div className="quantity-grid">{[1, 2, 3, 4].map(value => <button key={value} className={kilos === value ? "selected" : ""} onClick={() => { setKilos(value); setCustom(""); }}>{value} kg</button>)}<button className={custom ? "selected" : ""} onClick={() => setCustom(custom || "1,5")}>Otra cantidad</button></div>{custom && <label className="input-label">¿Cuántos kilos?<input autoFocus inputMode="decimal" value={custom} onChange={event => setCustom(event.target.value)} onBlur={() => setKilos(Number(custom.replace(",", ".")) || 1)} placeholder="Ejemplo: 1,5" /></label>}<button className="primary full" onClick={() => setStep("review")}>Seguir con mi pedido</button><button className="text-button" onClick={() => setStep("home")}>Volver</button></div>}
      {step === "review" && <div className="card flow-card"><span className="step-label">Ya casi · 2 de 2</span><h2>Confirmemos tu pedido</h2><div className="summary"><div><span>Vas a llevar</span><strong>{productLabels[product]}</strong></div><div><span>Cantidad</span><strong>{formatKilos(kilos)}</strong></div><div><span>Total aproximado</span><strong>${(kilos * productPrices[product]).toLocaleString("es-CL")}</strong></div></div><label className="input-label">¿En cuánto rato estaría listo?<select value={estimatedMinutes} onChange={event => setEstimatedMinutes(Number(event.target.value))}><option value="10">En unos 10 minutos</option><option value="15">En unos 15 minutos</option><option value="20">En unos 20 minutos</option><option value="30">En unos 30 minutos</option></select></label><p className="helper-text">Si queda listo antes, te avisamos de inmediato 😊</p><label className="input-label">Tu nombre <small>(opcional)</small><input defaultValue="María González" /></label><label className="input-label">RUT <small>(opcional)</small><input defaultValue="12.345.678-9" /></label><button className="primary full" onClick={createOrder}>Reservar y pagar aquí</button><button className="secondary full" onClick={createOrder}>Pagar en línea <small>(por ahora simulado)</small></button><button className="text-button" onClick={() => setStep("quantity")}>Volver</button></div>}
      {step === "pickup" && <div className="card pickup-card"><span className="step-label">Aquí está tu pedido</span><h2>{order.status === "listo" ? "¡Pasa a buscarlo! 😊" : "¡Gracias por reservar!"}</h2><p className="muted">{order.status === "listo" ? "Muéstrale este código a la persona del local y te entregamos tu pan." : `Lo tendremos listo aproximadamente en ${order.estimatedMinutes} minutos. Quédate tranquilo/a: te avisaremos por aquí.`}</p><div className="ticket"><span>Tu código de retiro</span><strong>{order.code}</strong><span>{formatKilos(order.kilos)} · {statusLabels[order.status]}</span></div>{order.status !== "listo" && order.status !== "retirado" && <div className="estimate"><span>Estará listo en</span><strong>~ {order.estimatedMinutes} min</strong></div>}{order.status === "listo" && <div className="countdown"><span>Te recomendamos retirarlo dentro de</span><strong>{countdown}</strong></div>}<button className="secondary full" onClick={() => setStep("home")}>Volver al inicio</button></div>}
    </section> : <section className="content admin-content"><div className="admin-heading"><div><span className="eyebrow">PANA · Para el equipo</span><h2>Pedidos para preparar</h2></div><span className="pill">{order.status === "listo" ? "1 listo 😊" : "1 por preparar"}</span></div><div className="order-card"><div className="order-top"><div><span className="order-code">{order.code}</span><h3>{order.customer} reservó pan</h3><p>{formatKilos(order.kilos)} de pan corriente · Hace 8 min</p></div><span className={`status status-${order.status}`}>{statusLabels[order.status]}</span></div><div className="order-details"><span>RUT <b>{order.rut}</b></span><span>Pago <b>En el local</b></span><span>Listo aprox. <b>{order.estimatedMinutes} min</b></span></div>{order.status !== "listo" && order.status !== "retirado" && order.status !== "cancelado" && <button className="primary full ready-button" onClick={markReady}>✓ Ya lo embolsé · Avisar que está listo</button>}{order.status === "listo" && <div className="ready-confirmation"><strong>¡Aviso enviado! 😊</strong><span>La persona ya sabe que puede venir a retirar su pedido.</span></div>}<button className="text-button" onClick={() => setOrder({ ...order, status: "preparando" })}>Volver a “en preparación”</button></div><div className="admin-note"><strong>¿Llegó pan calentito?</strong><p>Avisa a las personas del barrio para que puedan encontrarlo en el mapa.</p><button className="secondary full" onClick={announceFreshBread}>✓ Avisar que llegó pan calentito</button></div></section>}
    {view === "cliente" && <button className="cart-bar" aria-label="Abrir mi pedido" onClick={() => setStep(order.status === "preparando" || order.status === "reservado" || order.status === "listo" ? "pickup" : "home")}><span className="cart-icon" aria-hidden="true">🛒</span><span className="cart-label">Mi pedido</span><strong>{order.status === "cancelado" ? "0" : "1"}</strong></button>}
    <footer><span>PANA · Hecho con cariño · Pagos en línea simulados</span><button onClick={() => { setOrder(initialOrder); setEstimatedMinutes(15); setStep("home"); setNotification(false); }}>Reiniciar demo</button></footer>
  </main>;
}
