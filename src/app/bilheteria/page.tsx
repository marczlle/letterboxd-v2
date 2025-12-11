'use client';
import HeaderBg from "@/app/components/HeaderBg";
import Movie from "@/app/components/Movie";
import Link from "next/link";
import { useState } from "react";
import SeatSelectorModal from "@/app/components/SeatSelectorModal";

export default function Bilheteria() {

    // ===== Gera hoje + 8 dias =====
    const dias = Array.from({ length: 9 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);

        const diaSemana = d.toLocaleDateString("pt-BR", { weekday: "short" }).toUpperCase().replace(".", "");
        const diaNumero = d.getDate();
        const mes = d.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase().replace(".", "");

        return { diaSemana, diaNumero, mes };
    });

    const [selectedDay, setSelectedDay] = useState(dias[0]);
    const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);

    // ==== MOCK: Sessões por filme (você troca pela API depois) ====
    const sessoes = ["14:00", "16:30", "18:00", "20:15"];

    const filmes = [
        { poster: "/gsFun8nATm52aGHeT8ueAel98nE.jpg", title: "Van Halsing", pop: "4554", rate: "6.3" },
        { poster: "/gmjihTFH7ROwJuthIZvoLC99AtS.jpg", title: "The James Dean Story", pop: "3836", rate: "6.5" },
        { poster: "/frZj5djlU9hFEjMcL21RJZVuG5O.jpg", title: "Pather Panchali", pop: "13069", rate: "8.0" },
        { poster: "/vo6osRMn09BulzfMBlS2BlK9Sgq.jpg", title: "Jürgen Roland’s St. Pauli-Report", pop: "1669", rate: "3.0" }
    ];

    return (
        <section>
            <HeaderBg />

            <section className="mt-16 mx-90 flex flex-col gap-16 mb-18">

                <div className="w-full flex flex-col justify-center items-center mb-8">

                    <div className="flex flex-row w-full border-b justify-between border-[#CC083E] mb-6">
                        <h1 className="text-2xl text-slate-300">FILMES EM CARTAZ</h1>
                    </div>

                    {/* ===== Filmes Em Cartaz - topo ===== */}
                    <div className="flex flex-row gap-4">
                        {filmes.map((f, idx) => (
                            <Movie
                                key={idx}
                                posterPath={f.poster}
                                size="large"
                                title={f.title}
                                popularity={f.pop}
                                averageRating={f.rate}
                            />
                        ))}
                    </div>

                    <div className="flex mt-12 flex-row w-full border-b justify-between border-[#CC083E] mb-6">
                        <h1 className="text-2xl text-slate-300">DATAS DISPONÍVEIS:</h1>
                    </div>

                    {/* ===== Dias dinâmicos ===== */}
                    <div className="flex flex-row gap-4">
                        {dias.map((d, i) => (
                            <div
                                key={i}
                                onClick={() => setSelectedDay(d)}
                                className={`flex flex-col items-center justify-center rounded-sm border-black border px-6 py-3 text-black font-bold 
                                    overflow-hidden text-ellipsis w-20 h-24 hover:bg-gray-300 cursor-pointer hover:scale-105 transition-all duration-200
                                    ${selectedDay.diaNumero === d.diaNumero ? 'bg-[#CC083E]' : 'bg-white'}`}
                            >
                                <span className={`${selectedDay.diaNumero === d.diaNumero ? 'text-white' : 'text-black'}`}>{d.diaSemana}</span>
                                <span className={`text-4xl ${selectedDay.diaNumero === d.diaNumero ? 'text-white' : 'text-[#212875]'}`}>{d.diaNumero}</span>
                                <span className={`text-sm ${selectedDay.diaNumero === d.diaNumero ? 'text-white' : 'text-[#212875]'}`}>{d.mes}</span>
                            </div>
                        ))}
                    </div>

                    {/* ================================
                        FILMES + HORÁRIOS DO DIA SELECIONADO
                    ================================= */}
                    <div className="mt-10 w-full flex flex-col gap-8">

                        {filmes.map((f, idx) => (
                            <div key={idx} className="flex flex-row gap-4 p-4 bg-slate-100 rounded-sm shadow border hover:shadow-lg transition hover:scale-102">

                                {/* Poster + info resumida */}
                                <Movie
                                    posterPath={f.poster}
                                    size="small"
                                    title={f.title}
                                    popularity={f.pop}
                                    averageRating={f.rate}
                                />

                                {/* Horários */}
                                <div className="flex flex-col justify-center gap-3">
                                    <h3 className="text-2xl font-bold text-black">{f.title}</h3>

                                    <div className="flex flex-row gap-2">
                                        {sessoes.map((hora, i) => (
                                            <button
                                                key={i}
                                                className="px-4 py-2 bg-[#CC083E] text-white rounded hover:bg-[#a60633] transition cursor-pointer"
                                                onClick={() => setIsSeatModalOpen(true)}
                                            >
                                                {hora}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        ))}

                    </div>

                </div>
            </section>
            {/* Modal de Seleção de Assentos */}
            <SeatSelectorModal
                isOpen={isSeatModalOpen}
                onClose={() => setIsSeatModalOpen(false)}
                sessionId="S001"
                wsUrl="ws://localhost:8000/ws/reserva"
            />
        </section>
    )
}
