'use client';
import React, { useState } from "react";
import { X } from "lucide-react";

export default function Cadastro({ setIsCadastroOpen }: { setIsCadastroOpen: (value: boolean) => void }) {
    const [email, setEmail] = useState("");
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);

    {/* TODO Lógica de Cadastro */}
    async function handleCadastro(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
    
        console.log("registrando", { email, senha, usuario });
    
        // fecha o modal
        setIsCadastroOpen(false);
        setLoading(false);
    }

    return (
        <div className="fixed flex justify-center items-center inset-0 bg-black/50 z-9999">
            <div className="flex flex-col bg-[#14181c] p-8 rounded-2xl">
                <div>
                    <button onClick={() => setIsCadastroOpen(false)} className="cursor-pointer">
                        <X className="w-8 h-8 shrink-0 text-slate-500 hover:text-slate-300"/>
                    </button>
                </div>
                <form onSubmit={handleCadastro} className="flex flex-col gap-3">
                    <div className="flex flex-col">
                        <label className="text-slate-400">Email</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-[#23282c] border border-slate-600 rounded-md p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#CC083E]"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-slate-400">Usuario</label>
                        <input
                            type="text"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
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
                    <div className="flex flex-row items-center justify-center">
                        <input
                            type="checkbox"
                            required
                            className="bg-[#23282c] border border-slate-600 rounded-md p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#CC083E] place-self-start mt-2"
                        />
                        <label className="text-slate-400 ml-2">Tenho pelo menos 16 anos, e aceito os <br /> termos de uso e politica de privacidade</label>
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
        </div>
    );
}