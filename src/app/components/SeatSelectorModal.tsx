import { useState, useEffect, useRef, JSX, useId } from 'react';

interface SeatSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
  wsUrl?: string;
}

type SeatStateType = 'available' | 'selected' | 'blocked' | 'reserved' | 'pending';
type StatusTone = 'info' | 'success' | 'error';

interface FormDataState {
  nomeCompleto: string;
  cpf: string;
  contato: string;
}

interface BroadcastMessage {
  evento: string;
  assento: string;
  usuario_bloqueador?: string;
  motivo?: string;
}

interface ResponseMessage {
  status?: string;
  tipo?: string;
  mensagem?: string;
  assento?: string;
  assentos_confirmados?: string[];
  assentos_falha?: string[];
}

const SeatSelectorModal: React.FC<SeatSelectorModalProps> = ({ 
  isOpen, 
  onClose, 
  sessionId = "S001", 
  wsUrl = "ws://localhost:8000/ws/reserva" 
}) => {
  const ROWS: string[] = ["J", "I", "H", "G", "F", "E", "D", "C", "B", "A"];
  const LEFT_SEATS: number = 14;
  const RIGHT_SEATS: number = 6;
  const WHEELCHAIR: Set<string> = new Set(["A01", "A02", "A17", "A18"]);

  const reactId = useId();
  const idSuffix =
    reactId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase() || "USER";
  const userId = `USR-${idSuffix}`;

  const [seatState, setSeatState] = useState<Map<string, SeatStateType>>(() => {
    const initialState = new Map<string, SeatStateType>();
    ROWS.forEach(row => {
      for (let i = 1; i <= LEFT_SEATS + RIGHT_SEATS; i++) {
        const seatId = row + String(i).padStart(2, "0");
        initialState.set(seatId, "available");
      }
    });
    return initialState;
  });
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [statusMessage, setStatusMessage] = useState<string>("Conectando ao servidor...");
  const [statusTone, setStatusTone] = useState<StatusTone>("info");
  const [activityFeed, setActivityFeed] = useState<string[]>([]);
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormDataState>({ 
    nomeCompleto: '', 
    cpf: '', 
    contato: '' 
  });
  
  const socketRef = useRef<WebSocket | null>(null);

  function handleBroadcast(data: BroadcastMessage) {
    const seatId = data.assento;
    
    switch (data.evento) {
      case "assento_bloqueado":
        if (data.usuario_bloqueador === userId) {
          updateSeatState(seatId, "selected", `${seatId} bloqueado para você.`, "success");
          pushActivity(`Você bloqueou ${seatId}.`);
        } else {
          updateSeatState(seatId, "blocked", `${seatId} bloqueado por outro usuário.`, "info");
          pushActivity(`${seatId} bloqueado por ${data.usuario_bloqueador}.`);
        }
        break;
      case "assento_liberado":
        updateSeatState(seatId, "available", `${seatId} liberado (${data.motivo || "livre"}).`, "success");
        pushActivity(`${seatId} liberado.`);
        break;
      case "assento_reservado":
        updateSeatState(seatId, "reserved", `${seatId} reservado permanentemente.`, "info");
        pushActivity(`${seatId} reservado.`);
        break;
    }
  }

  function handleResponse(data: ResponseMessage) {
    if (data.tipo === "confirmacao_pagamento") {
      handlePaymentResponse(data);
      return;
    }

    if (data.status === "erro") {
      if (data.assento) {
        updateSeatState(data.assento, "available");
      }
      setStatusMessage(data.mensagem || "Erro desconhecido");
      setStatusTone("error");
    } else if (data.status) {
      setStatusMessage(data.mensagem || "Operação realizada");
      setStatusTone("success");
    }
  }

  const handlePaymentResponse = (data: ResponseMessage) => {
    setIsSubmitting(false);
    const confirmed = data.assentos_confirmados || [];
    const failed = data.assentos_falha || [];

    if ((data.status === "ok" || data.status === "parcial") && confirmed.length) {
      setShowPaymentModal(false);
      pushActivity(`Pagamento confirmado para ${confirmed.join(", ")}.`);
      setStatusMessage(data.mensagem || "Pagamento confirmado");
      setStatusTone(data.status === "ok" ? "success" : "info");
      
      setSelectedSeats(prev => {
        const newSet = new Set(prev);
        confirmed.forEach(seat => newSet.delete(seat));
        return newSet;
      });
      
      setFormData({ nomeCompleto: '', cpf: '', contato: '' });
    } else if (data.status === "erro") {
      setStatusMessage(data.mensagem || "Não foi possível confirmar o pagamento.");
      setStatusTone("error");
    }

    if (failed.length) {
      pushActivity(`Falha ao confirmar: ${failed.join(", ")}.`);
    }
  };

  const updateSeatState = (
    seatId: string, 
    state: SeatStateType, 
    message: string | null = null, 
    tone: StatusTone = "info"
  ) => {
    setSeatState(prev => {
      const newState = new Map(prev);
      newState.set(seatId, state);
      return newState;
    });

    if (state === "selected") {
      setSelectedSeats(prev => new Set([...prev, seatId]));
    } else {
      setSelectedSeats(prev => {
        const newSet = new Set(prev);
        newSet.delete(seatId);
        return newSet;
      });
    }

    if (message) {
      setStatusMessage(message);
      setStatusTone(tone);
    }
  };

  const pushActivity = (message: string) => {
    const timestamp = new Date().toLocaleTimeString("pt-BR", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit"
    });
    setActivityFeed(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 3));
  };

  useEffect(() => {
    if (!isOpen || !userId) return;

    const connectWebSocket = () => {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setStatusMessage("Conectado. Escolha seu assento.");
        setStatusTone("success");
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
        setStatusMessage("Erro na conexão. Tentando novamente...");
        setStatusTone("error");
      };

      socket.onclose = () => {
        setStatusMessage("Conexão perdida. Reconnecting...");
        setStatusTone("error");
        setTimeout(connectWebSocket, 1500);
      };
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [isOpen, userId, wsUrl]);

  const handleSeatClick = (seatId: string) => {
    const current = seatState.get(seatId);
    if (["blocked", "reserved", "selected", "pending"].includes(current || "")) {
      setStatusMessage(`Assento ${seatId} indisponível no momento.`);
      setStatusTone("error");
      return;
    }

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setStatusMessage("Sem conexão com o servidor.");
      setStatusTone("error");
      return;
    }

    setSeatState(prev => {
      const newState = new Map(prev);
      newState.set(seatId, "pending");
      return newState;
    });

    setStatusMessage(`Solicitando bloqueio da poltrona ${seatId}...`);
    setStatusTone("info");

    socketRef.current.send(JSON.stringify({
      acao: "bloquear",
      sessao: sessionId,
      assento: seatId,
      usuario_id: userId
    }));
  };

  const handlePaymentSubmit = () => {
    if (selectedSeats.size === 0) {
      setStatusMessage("Selecione ao menos uma poltrona para confirmar.");
      setStatusTone("error");
      return;
    }

    if (!formData.nomeCompleto || !formData.cpf || !formData.contato) {
      setStatusMessage("Preencha todos os campos.");
      setStatusTone("error");
      return;
    }

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setStatusMessage("Sem conexão com o servidor.");
      setStatusTone("error");
      return;
    }

    setIsSubmitting(true);

    socketRef.current.send(JSON.stringify({
      acao: "confirmar_pagamento",
      sessao: sessionId,
      assentos: Array.from(selectedSeats),
      usuario_id: userId,
      pagamento: formData
    }));

    setStatusMessage("Processando pagamento...");
    setStatusTone("info");
  };

  const renderSeat = (row: string, number: number) => {
    const seatId = row + String(number).padStart(2, "0");
    const state = seatState.get(seatId) || "available";
    const isWheelchair = WHEELCHAIR.has(seatId);

    return (
      <button
        key={seatId}
        type="button"
        onClick={() => handleSeatClick(seatId)}
        disabled={["blocked", "reserved", "selected", "pending"].includes(state)}
        className={`w-8 h-8 rounded-full border-0 flex items-center justify-center relative transition-all duration-150 cursor-pointer
          ${state === "available" ? "bg-[#9fa9ff] text-[#0b1527]" : ""}
          ${state === "selected" ? "bg-[#f7c843] text-[#1d1b0b] shadow-[0_0_0_4px_rgba(247,200,67,0.25)]" : ""}
          ${state === "blocked" ? "bg-[#4c5674] text-[#d7ddff] opacity-80 cursor-not-allowed" : ""}
          ${state === "reserved" ? "bg-[#2f364d] text-[#94a2d6] cursor-not-allowed border-2 border-white/10" : ""}
          ${state === "pending" ? "bg-[#ffd166] animate-pulse" : ""}
          ${isWheelchair ? "border-2 border-[#6c7dff] bg-[#0b1524] text-[#6c7dff]" : ""}
        `}
      >
        {isWheelchair && <span className="text-sm opacity-85">♿</span>}
        {showLabels && !isWheelchair && (
          <span className="text-[9px] font-bold">{seatId}</span>
        )}
      </button>
    );
  };

  const renderRow = (row: string) => {
    const leftSeats: JSX.Element[] = [];
    const rightSeats: JSX.Element[] = [];

    for (let i = 1; i <= LEFT_SEATS; i++) {
      leftSeats.push(renderSeat(row, i));
    }

    for (let i = LEFT_SEATS + 1; i <= LEFT_SEATS + RIGHT_SEATS; i++) {
      rightSeats.push(renderSeat(row, i));
    }

    return (
      <div key={row} className="flex items-center gap-6">
        <div className="grid grid-cols-14 gap-3">{leftSeats}</div>
        <div className="w-[70px] h-[90%] rounded-2xl border border-dashed border-white/8 bg-white/2" />
        <div className="grid grid-cols-6 gap-3">{rightSeats}</div>
      </div>
    );
  };

  if (!isOpen) return null;

  const selectedArray = Array.from(selectedSeats).sort();
  const paymentHintText = selectedArray.length > 0
    ? `Selecionado(s): ${selectedArray.join(", ")}`
    : "Selecione ao menos uma poltrona.";

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-6xl my-8 mt-48">
        <div className="bg-[#1c2f74] rounded-2xl p-5 flex justify-between items-center mb-5 shadow-2xl">
          <div className="flex gap-6 font-semibold text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M12 2C8 2 4 5 4 10c0 5.25 7.5 12 8 12s8-6.75 8-12c0-5-4-8-8-8z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Cinemas Costa Dourada · SALA 1
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 0 0 2-2V7H3v12a2 2 0 0 0 2 2z"/>
              </svg>
              SÁB 13/12
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/>
              </svg>
              17:45
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/10 px-4 py-2 rounded-full text-sm">
              Usuário · {userId}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-400 text-2xl font-bold w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>

        <div className="bg-[#0b1426] rounded-3xl p-8 shadow-2xl relative">
        
          <div className="flex justify-between items-center mb-6 pr-12">
            <h2 className="text-2xl font-semibold">Escolha suas poltronas</h2>
            <p className="text-sm text-[#8f9dc7]">Tempo de bloqueio: 5 min</p>
          </div>

          <div className="bg-[#101b30] rounded-3xl p-10 mb-6" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}>
            <div className="flex flex-col gap-5">
              {ROWS.map(row => renderRow(row))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="w-4/5 h-2.5 rounded-full bg-gradient-to-r from-white/50 to-white/10" />
            <span className="uppercase tracking-[0.4em] text-[#65719a] text-xs">Tela</span>
          </div>

          <div className="flex justify-center items-center gap-3 mb-6 text-[#8f9dc7] text-sm">
            Exibir números dos assentos
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-11 h-6 rounded-full transition-colors ${showLabels ? 'bg-[#6c7dff]' : 'bg-white/15'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${showLabels ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </div>
            </label>
          </div>

          <div className="flex gap-5 flex-wrap text-sm text-[#8f9dc7] mb-6 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#9fa9ff]" />
              Disponível
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#f7c843]" />
              Selecionado
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#4c5674]" />
              Bloqueado
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#2f364d]" />
              Ocupado
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-[#6c7dff] bg-transparent" />
              Cadeirante
            </div>
          </div>

          <div className="bg-[#1a2745] rounded-2xl p-5 flex justify-between items-center mb-5">
            <div>
              <p className="font-semibold mb-1">Pagamento</p>
              <p className="text-sm text-[#8f9dc7]">{paymentHintText}</p>
            </div>
            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={selectedSeats.size === 0}
              className="bg-[#4e5cff] text-white px-6 py-3 rounded-full font-semibold text-sm shadow-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirmar pagamento
            </button>
          </div>

          <div className="bg-[#101b30] rounded-2xl p-5 flex justify-between items-center gap-4">
            <p className={`font-medium ${statusTone === 'error' ? 'text-[#ff6b6b]' : statusTone === 'success' ? 'text-[#5fe1a1]' : 'text-white'}`}>
              {statusMessage}
            </p>
            <div className="flex gap-3 text-xs text-[#65719a]">
              {activityFeed.map((msg, i) => (
                <div key={i} className="bg-white/4 px-3 py-2 rounded-xl">{msg}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-[#0b1426] rounded-3xl w-full max-w-md p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-semibold mb-2">Confirmar pagamento</h3>
                <p className="text-sm text-[#8f9dc7]">
                  Você está confirmando {selectedArray.length} assento(s): {selectedArray.join(", ")}
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-white hover:text-red-400 text-3xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm text-[#8f9dc7]">Nome completo</span>
                <input
                  type="text"
                  value={formData.nomeCompleto}
                  onChange={(e) => setFormData({...formData, nomeCompleto: e.target.value})}
                  placeholder="Ex.: Maria Oliveira"
                  className="rounded-xl border border-white/15 bg-[#101b30] px-4 py-3 text-white"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm text-[#8f9dc7]">CPF</span>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                  placeholder="000.000.000-00"
                  className="rounded-xl border border-white/15 bg-[#101b30] px-4 py-3 text-white"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm text-[#8f9dc7]">Contato</span>
                <input
                  type="text"
                  value={formData.contato}
                  onChange={(e) => setFormData({...formData, contato: e.target.value})}
                  placeholder="(00) 00000-0000"
                  className="rounded-xl border border-white/15 bg-[#101b30] px-4 py-3 text-white"
                />
              </label>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-5 py-2.5 border border-white/25 rounded-full text-white hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handlePaymentSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#4e5cff] text-white rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Processando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelectorModal;