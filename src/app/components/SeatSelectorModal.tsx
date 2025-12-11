'use client';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface SeatSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ActivityItem {
  message: string;
  timestamp: string;
  id: number;
}

type SeatState = 'available' | 'selected' | 'blocked' | 'reserved' | 'pending';
type StatusTone = 'info' | 'success' | 'error';

const SeatSelectorModal: React.FC<SeatSelectorModalProps> = ({ isOpen, onClose }) => {
  // Constants
  const ROWS = ["J", "I", "H", "G", "F", "E", "D", "C", "B", "A"];
  const LEFT_SEATS = 14;
  const RIGHT_SEATS = 6;
  const WHEELCHAIR = new Set(["A01", "A02", "A17", "A18"]);
  const SESSION_ID = "S001";

  // Generate stable USER_ID
  const USER_ID = useMemo(() => {
    const randomToken = (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID().slice(0, 6)
      : Math.random().toString(36).slice(2, 8);
    return "USR-" + randomToken.toUpperCase();
  }, []);

  // WebSocket URL
  const WS_URL = useMemo(() => {
    if (typeof window !== 'undefined') {
      return (window.location.protocol === "https:" ? "wss://" : "ws://") + 
             window.location.host + "/ws/reserva";
    }
    return "ws://localhost:8000/ws/reserva";
  }, []);

  // State
  const [seatState, setSeatState] = useState<Map<string, SeatState>>(new Map());
  const [statusMessage, setStatusMessage] = useState<string>("Conectando ao servidor...");
  const [statusTone, setStatusTone] = useState<StatusTone>("info");
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const socketRef = useRef<WebSocket | null>(null);

  // Helper functions
  const pad = (num: number): string => String(num).padStart(2, "0");

  const setStatus = useCallback((message: string, tone: StatusTone = "info") => {
    setStatusMessage(message);
    setStatusTone(tone);
  }, []);

  const pushActivity = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString("pt-BR", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit"
    });
    setActivityFeed(prev => {
      const newFeed: ActivityItem[] = [{ message, timestamp, id: Date.now() }, ...prev];
      return newFeed.slice(0, 3);
    });
  }, []);

  const updateSeatState = useCallback((seatId: string, state: SeatState, toneMessage?: { text: string; tone: StatusTone }) => {
    setSeatState(prev => {
      const newState = new Map(prev);
      newState.set(seatId, state);
      return newState;
    });
    if (toneMessage) {
      setStatus(toneMessage.text, toneMessage.tone);
    }
  }, [setStatus]);

  // WebSocket handlers
  const handleResponse = useCallback((data: any) => {
    if (data.assento) {
      setSeatState(prev => {
        const newState = new Map(prev);
        if (newState.get(data.assento) === "pending") {
          newState.set(data.assento, "available" as SeatState);
        }
        return newState;
      });
    }
    if (data.status === "erro") {
      if (data.assento) {
        updateSeatState(data.assento, "available");
      }
      setStatus(data.mensagem, "error");
    } else {
      setStatus(data.mensagem, "success");
    }
  }, [setStatus, updateSeatState]);

  const handleBroadcast = useCallback((data: any) => {
    const seatId = data.assento;
    switch (data.evento) {
      case "assento_bloqueado":
        if (data.usuario_bloqueador === USER_ID) {
          updateSeatState(seatId, "selected", {
            text: `${seatId} bloqueado para você.`,
            tone: "success"
          });
          pushActivity(`Você bloqueou ${seatId}.`);
        } else {
          updateSeatState(seatId, "blocked", {
            text: `${seatId} bloqueado por outro usuário.`,
            tone: "info"
          });
          pushActivity(`${seatId} bloqueado por ${data.usuario_bloqueador}.`);
        }
        break;
      case "assento_liberado":
        updateSeatState(seatId, "available", {
          text: `${seatId} liberado (${data.motivo || "livre"}).`,
          tone: "success"
        });
        pushActivity(`${seatId} liberado.`);
        break;
      case "assento_reservado":
        updateSeatState(seatId, "reserved", {
          text: `${seatId} reservado permanentemente.`,
          tone: "info"
        });
        pushActivity(`${seatId} reservado.`);
        break;
      default:
        break;
    }
  }, [USER_ID, updateSeatState, pushActivity]);

  const handleSeatClick = useCallback((seatId: string) => {
    const current = seatState.get(seatId);
    if (["blocked", "reserved", "selected", "pending"].includes(current as string)) {
      setStatus(`Assento ${seatId} indisponível no momento.`, "error");
      return;
    }
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setStatus("Sem conexão com o servidor.", "error");
      return;
    }
    
    setSeatState(prev => {
      const newState = new Map(prev);
      newState.set(seatId, "pending");
      return newState;
    });
    setStatus(`Solicitando bloqueio da poltrona ${seatId}...`, "info");
    
    socketRef.current.send(JSON.stringify({
      acao: "bloquear",
      sessao: SESSION_ID,
      assento: seatId,
      usuario_id: USER_ID
    }));
  }, [seatState, USER_ID, setStatus]);

  // WebSocket connection effect
  useEffect(() => {
    if (!isOpen) return;

    const connectWebSocket = () => {
      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus("Conectado. Escolha seu assento.", "success");
      };

      socket.onmessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.evento) {
          handleBroadcast(data);
        } else if (data.status) {
          handleResponse(data);
        }
      };

      socket.onerror = () => {
        setStatus("Erro na conexão. Tentando novamente...", "error");
      };

      socket.onclose = () => {
        setStatus("Conexão perdida. Reconnecting...", "error");
        setTimeout(connectWebSocket, 1500);
      };
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [isOpen, WS_URL, setStatus, handleBroadcast, handleResponse]);

  // Initialize seat states
  useEffect(() => {
    const initialState = new Map<string, SeatState>();
    ROWS.forEach(row => {
      for (let i = 1; i <= LEFT_SEATS + RIGHT_SEATS; i++) {
        const seatId = row + pad(i);
        initialState.set(seatId, "available" as SeatState);
      }
    });
    setSeatState(initialState);
  }, []);

  // Seat component
  const Seat: React.FC<{ row: string; number: number }> = ({ row, number }) => {
    const seatId = row + pad(number);
    const state = seatState.get(seatId) || "available";
    const isWheelchair = WHEELCHAIR.has(seatId);
    
    const lockStates = new Set(["selected", "blocked", "reserved", "pending"]);
    const isDisabled = lockStates.has(state);

    return (
      <button
        type="button"
        className={`seat ${state} ${isWheelchair ? 'wheelchair' : ''}`}
        data-label={seatId}
        onClick={() => handleSeatClick(seatId)}
        disabled={isDisabled}
      />
    );
  };

  // SeatRow component
  const SeatRow: React.FC<{ row: string }> = ({ row }) => {
    return (
      <div className="seat-row">
        <div className="seat-group left">
          {Array.from({ length: LEFT_SEATS }, (_, i) => (
            <Seat key={i + 1} row={row} number={i + 1} />
          ))}
        </div>
        <div className="walkway" />
        <div className="seat-group right">
          {Array.from({ length: RIGHT_SEATS }, (_, i) => (
            <Seat key={LEFT_SEATS + i + 1} row={row} number={LEFT_SEATS + i + 1} />
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          padding: 20px;
          overflow-y: auto;
        }
        .modal-container {
          position: relative;
          width: min(1200px, 100%);
          max-height: 95vh;
          overflow-y: auto;
        }
        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 40px;
          height: 40px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          font-size: 24px;
          border-radius: 50%;
          cursor: pointer;
          z-index: 10;
          transition: background 0.2s ease;
        }
        .modal-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        :root {
          --bg: #040b18;
          --panel: #0b1426;
          --panel-dark: #101b30;
          --panel-light: #1a2745;
          --accent: #6c7dff;
          --accent-strong: #4e5cff;
          --highlight: #f7c843;
          --blocked: #4c5674;
          --reserved: #1f2435;
          --text-soft: #8f9dc7;
          --text-muted: #65719a;
          --danger: #ff6b6b;
          --success: #5fe1a1;
        }
        .seat-selector * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        .seat-selector {
          font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
          background: var(--bg);
          color: #fff;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .top-bar {
          background: #1c2f74;
          border-radius: 18px;
          padding: 18px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 12px 30px rgba(17, 24, 39, 0.4);
        }
        .top-bar .info-group {
          display: flex;
          gap: 24px;
          font-weight: 600;
        }
        .top-bar .info-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.95rem;
          letter-spacing: 0.02em;
        }
        .top-bar .info-badge svg {
          width: 18px;
          height: 18px;
        }
        .user-pill {
          background: rgba(255, 255, 255, 0.1);
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 0.9rem;
        }
        .seat-panel {
          background: var(--panel);
          border-radius: 22px;
          padding: 28px 32px 36px;
          box-shadow: 0 40px 60px rgba(0, 0, 0, 0.45);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .panel-title {
          font-size: 1.3rem;
          font-weight: 600;
        }
        .text-small {
          font-size: 0.9rem;
        }
        .seat-layout {
          display: grid;
          grid-template-columns: auto 1fr auto 60px;
          gap: 16px;
          align-items: center;
        }
        .row-indicators {
          display: flex;
          flex-direction: column;
          gap: 18px;
          font-weight: 600;
          color: var(--text-soft);
        }
        .row-indicators span {
          text-align: center;
          opacity: 0.6;
        }
        .seat-grid {
          background: var(--panel-dark);
          border-radius: 26px;
          padding: 28px 36px 36px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          position: relative;
          transition: transform 0.2s ease;
          transform-origin: center;
          transform: scale(${zoomLevel / 100});
        }
        .seat-grid.show-labels .seat::after {
          opacity: 1;
        }
        .seat-row {
          display: flex;
          align-items: center;
          gap: 22px;
        }
        .seat-group {
          display: grid;
          gap: 12px;
        }
        .seat-group.left {
          grid-template-columns: repeat(14, 32px);
        }
        .seat-group.right {
          grid-template-columns: repeat(6, 32px);
        }
        .walkway {
          width: 70px;
          height: 90%;
          border-radius: 18px;
          border: 1px dashed rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
        }
        .seat {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 0;
          outline: none;
          background: #6a7bff;
          color: #0b1527;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: transform 0.15s ease, background 0.2s ease, box-shadow 0.2s ease;
        }
        .seat::after {
          content: attr(data-label);
          font-size: 0.56rem;
          color: #0b1524;
          font-weight: 700;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .seat.available {
          background: #9fa9ff;
        }
        .seat.selected {
          background: var(--highlight);
          color: #1d1b0b;
          box-shadow: 0 0 0 4px rgba(247, 200, 67, 0.25);
        }
        .seat.blocked {
          background: var(--blocked);
          color: #d7ddff;
          cursor: not-allowed;
          opacity: 0.8;
        }
        .seat.reserved {
          background: #2f364d;
          color: #94a2d6;
          cursor: not-allowed;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }
        .seat.pending {
          animation: pulse 1s infinite;
          background: #ffd166;
        }
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 209, 102, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(255, 209, 102, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 209, 102, 0);
          }
        }
        .seat.wheelchair {
          border: 2px solid var(--accent);
          background: #0b1524;
          color: var(--accent);
        }
        .seat.wheelchair::before {
          content: "♿";
          position: absolute;
          font-size: 0.9rem;
          color: var(--accent);
          opacity: 0.85;
        }
        .seat:disabled {
          cursor: not-allowed;
        }
        .zoom-stack {
          background: var(--panel-light);
          border-radius: 36px;
          padding: 14px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .zoom-stack button {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: none;
          background: var(--panel);
          color: #fff;
          font-size: 1.1rem;
          cursor: pointer;
        }
        .zoom-stack input[type="range"] {
          writing-mode: bt-lr;
          -webkit-appearance: none;
          width: 140px;
          transform: rotate(-90deg);
        }
        .zoom-stack input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--accent);
          border: 3px solid var(--panel);
          box-shadow: 0 0 0 3px rgba(108, 125, 255, 0.2);
        }
        .zoom-stack input[type="range"]::-webkit-slider-runnable-track {
          height: 6px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
        }
        .screen-label {
          margin-top: -8px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          gap: 8px;
        }
        .screen-bar {
          width: 80%;
          height: 10px;
          border-radius: 40px;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.1));
        }
        .toggle-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          color: var(--text-soft);
          font-size: 0.9rem;
        }
        .toggle {
          width: 46px;
          height: 24px;
          border-radius: 999px;
          position: relative;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
        }
        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
          position: absolute;
        }
        .toggle-slider {
          width: 100%;
          height: 100%;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.15);
          position: relative;
          transition: background 0.2s ease;
        }
        .toggle-slider::after {
          content: "";
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          position: absolute;
          top: 3px;
          left: 4px;
          transition: transform 0.2s ease;
        }
        .toggle input:checked + .toggle-slider {
          background: var(--accent);
        }
        .toggle input:checked + .toggle-slider::after {
          transform: translateX(20px);
        }
        .legend {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          color: var(--text-soft);
          font-size: 0.9rem;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .legend-swatch {
          width: 16px;
          height: 16px;
          border-radius: 50%;
        }
        .legend-swatch.available {
          background: #9fa9ff;
        }
        .legend-swatch.selected {
          background: var(--highlight);
        }
        .legend-swatch.blocked {
          background: var(--blocked);
        }
        .legend-swatch.reserved {
          background: #2f364d;
        }
        .legend-swatch.wheelchair {
          border: 2px solid var(--accent);
          background: transparent;
        }
        .status-panel {
          background: var(--panel-dark);
          border-radius: 18px;
          padding: 18px 22px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }
        .status-text {
          font-weight: 500;
        }
        .status-text[data-tone="error"] {
          color: var(--danger);
        }
        .status-text[data-tone="success"] {
          color: var(--success);
        }
        .activity-feed {
          list-style: none;
          color: var(--text-muted);
          font-size: 0.85rem;
          display: flex;
          gap: 12px;
        }
        .activity-feed li {
          background: rgba(255, 255, 255, 0.04);
          padding: 8px 12px;
          border-radius: 12px;
        }
        @media (max-width: 950px) {
          .seat-layout {
            grid-template-columns: 1fr;
          }
          .row-indicators,
          .zoom-stack {
            display: none;
          }
        }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>×</button>
          
          <div className="seat-selector">
            <header className="top-bar">
              <div className="info-group">
                <div className="info-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M12 2C8 2 4 5 4 10c0 5.25 7.5 12 8 12s8-6.75 8-12c0-5-4-8-8-8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Cinemas Costa Dourada · SALA 1
                </div>
                <div className="info-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 0 0 2-2V7H3v12a2 2 0 0 0 2 2z" />
                  </svg>
                  SÁB 13/12
                </div>
                <div className="info-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M12 6v6l4 2" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  17:45
                </div>
              </div>
              <div className="user-pill">Usuário · <span>{USER_ID}</span></div>
            </header>

            <section className="seat-panel">
              <div className="panel-header">
                <p className="panel-title">Escolha suas poltronas</p>
                <p className="text-small" style={{ color: 'var(--text-soft)' }}>
                  Tempo de bloqueio: 5 min
                </p>
              </div>

              <div className="seat-layout">
                <div className="row-indicators">
                  {ROWS.map(row => (
                    <span key={row}>{row}</span>
                  ))}
                </div>
                <div className={`seat-grid ${showLabels ? 'show-labels' : ''}`}>
                  {ROWS.map(row => (
                    <SeatRow key={row} row={row} />
                  ))}
                </div>
                <div className="row-indicators">
                  {ROWS.map(row => (
                    <span key={row}>{row}</span>
                  ))}
                </div>
                <div className="zoom-stack">
                  <button
                    type="button"
                    onClick={() => setZoomLevel(Math.min(130, zoomLevel + 5))}
                  >
                    +
                  </button>
                  <input
                    type="range"
                    min="80"
                    max="130"
                    value={zoomLevel}
                    onChange={(e) => setZoomLevel(Number(e.target.value))}
                  />
                  <button
                    type="button"
                    onClick={() => setZoomLevel(Math.max(80, zoomLevel - 5))}
                  >
                    −
                  </button>
                </div>
              </div>

              <div className="screen-label">
                <div className="screen-bar" />
                <span style={{
                  textTransform: 'uppercase',
                  letterSpacing: '.4em',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem'
                }}>
                  Tela
                </span>
              </div>

              <div className="toggle-row">
                Exibir números dos assentos
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={showLabels}
                    onChange={(e) => setShowLabels(e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              <div className="legend">
                <div className="legend-item">
                  <span className="legend-swatch available" />
                  Disponível
                </div>
                <div className="legend-item">
                  <span className="legend-swatch selected" />
                  Selecionado
                </div>
                <div className="legend-item">
                  <span className="legend-swatch blocked" />
                  Bloqueado
                </div>
                <div className="legend-item">
                  <span className="legend-swatch reserved" />
                  Ocupado
                </div>
                <div className="legend-item">
                  <span className="legend-swatch wheelchair" />
                  Cadeirante
                </div>
              </div>

              <div className="status-panel">
                <p className="status-text" data-tone={statusTone}>
                  {statusMessage}
                </p>
                <ul className="activity-feed">
                  {activityFeed.map(item => (
                    <li key={item.id}>
                      [{item.timestamp}] {item.message}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default SeatSelectorModal;