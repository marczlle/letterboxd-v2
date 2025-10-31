'use client';
import React, { useState } from "react";
import { X } from "lucide-react";

export default function Login({ setIsLoginOpen }: { setIsLoginOpen: (value: boolean) => void }) {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);

    {/* TODO Lógica de login */}
    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        console.log("Logging in with", { email, senha });

        // fecha o modal
        setIsLoginOpen(false);
        setLoading(false);
    }

    return (
        <div className="flex flex-row justify-center items-end gap-3 bg-[#14181c] rounded-2xl p-8 ">
            <div>
                <button onClick={() => setIsLoginOpen(false)} className="cursor-pointer">
                    <X className="w-6 h-6 shrink-0 text-slate-500 hover:text-slate-300"/>
                </button>
            </div>
            <form onSubmit={handleLogin} className="flex flex-row gap-3">
                <div className="flex flex-col">
                    <label className="text-slate-400">Usuario ou Email</label>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-[#23282c] border border-slate-600 rounded-md p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#CC083E]"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-slate-400">Senha</label>
                    <input
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        className="bg-[#23282c] border border-slate-600 rounded-md p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#CC083E]"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`bg-[#CC083E] hover:bg-[#8b092e] cursor-pointer text-[1.3rem] rounded-md px-6 py-2 text-white mx-auto h-15 mt-4 ${
                        loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    >
                    {loading ? "Entrando..." : "Entrar"}
                </button>
            </form>
        </div>
    );
}