'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X } from 'lucide-react';

// Define o formato de um objeto de mensagem
type Message = {
    role: 'user' | 'assistant';
    content: string;
};

// Define as propriedades que o componente vai receber
interface ChatProps {
    isOpen: boolean;         // Controla se o chat está visível
    onClose: () => void;       // Função para fechar o chat
    movieTitle: string;    // O título do filme para dar contexto ao bot
}

export default function Chat({ isOpen, onClose, movieTitle }: ChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Efeito para "resetar" o chat e dar a 1ª mensagem quando ele é aberto
    useEffect(() => {
        if (isOpen) {
            setMessages([
                {
                    role: 'assistant',
                    content: `E aí! 🍿 Eu sou o CinéZinho — seu parceiro de papo sobre cinema! Me conta: o que achou de ‘${movieTitle}’?`
                }
            ]);
            setUserInput(''); // Limpa o input
        }
    }, [isOpen, movieTitle]); // Executa sempre que o chat é aberto ou o filme muda

    // Efeito para rolar para a última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Função para lidar com o envio da mensagem
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        // 1. Adiciona a mensagem do usuário ao histórico
        const userMessage: Message = { role: 'user', content: userInput };
        const newMessages = [...messages, userMessage];

        setMessages(newMessages); // Atualiza o chat na tela
        setUserInput(''); // Limpa o input
        setIsLoading(true);

        try {
            // 2. Chama a *sua* API de backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages }), // Envia o histórico ATUALIZADO
            });

            if (!response.ok) {
                throw new Error('Falha ao conectar com o CinéZinho');
            }

            const data = await response.json();
            const botResponse: Message = data.response;

            // 3. Adiciona a resposta do assistente ao histórico
            setMessages((prevMessages) => [...prevMessages, botResponse]);

        } catch (error) {
            console.error("Erro ao buscar resposta:", error);
            // Adiciona uma mensagem de erro no chat
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Desculpe, estou com problemas para me conectar. Tente novamente.' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Se não estiver aberto, não renderiza nada
    if (!isOpen) return null;

    return (
        // Backdrop (fundo escuro semi-transparente)
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={onClose} // Fecha o chat ao clicar fora
        >
            {/* Janela do Chat */}
            <div
                className="relative flex flex-col w-full max-w-2xl h-[70vh] bg-slate-900 rounded-lg shadow-xl p-6"
                onClick={(e) => e.stopPropagation()} // Impede de fechar ao clicar *dentro* do chat
            >
                {/* Header do Chat */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <Bot className="text-[#CC083E]" />
                        <h2 className="text-xl font-bold text-white">CinéZinho</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Área das Mensagens */}
                <div className="flex-1 overflow-y-auto space-y-4 p-4 my-4">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${msg.role === 'user'
                                        ? 'bg-[#CC083E] text-white'
                                        : 'bg-slate-700 text-slate-200'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {/* Indicador "Digitando..." */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="px-4 py-3 rounded-lg bg-slate-700 text-slate-400">
                                <span className="animate-pulse">CinéZinho está digitando...</span>
                            </div>
                        </div>
                    )}

                    {/* Elemento invisível para forçar o scroll */}
                    <div ref={messagesEndRef} />
                </div>

                {/* Formulário de Input */}
                <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-700 pt-4">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Pergunte algo sobre o filme..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CC083E]"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-[#CC083E] text-white rounded-lg hover:bg-[#A80633] disabled:bg-slate-600 transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}