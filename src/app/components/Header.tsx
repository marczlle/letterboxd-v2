'use client';
import Image from "next/image";
import Login from "./Login";
import Cadastro from "./Cadastro";
import React, { useState, useEffect } from "react";
import { authenticateUser } from "@/app/hooks/user-service/service";
import Link from "next/link";

export default function Header() {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isCadastroOpen, setIsCadastroOpen] = useState(false);

    // GERENCIAMENTO DE ESTADO DO USUÁRIO
    interface User {
        usuario: string;
        [key: string]: unknown;
    }

    const [user, setUser] = useState<User | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    // Serve pra ver se o usuario esta logado ou não logo que carrega o componente
    useEffect(() => {
        async function checkAuthentication() {
            try {
                const data = await authenticateUser();
                if (data.ok) {
                    console.log("Usuário autenticado no cliente:", data.user);
                    setUser(data.user); 
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                console.error("Usuário não autenticado no cliente:", message);
                setUser(null);
            } finally {
                setIsLoadingAuth(false);
            }
        }

        checkAuthentication();
    }, []); 

    if (isLoadingAuth) {
        return (
            <section className="flex flex-row items-center gap-3 py-8 px-24">
                {/* TODO botar algum Loader talvez, sla */}
            </section>
        );
    }

    return (
        <section className="flex flex-row items-center gap-3 py-8 px-24">

            {/* Modal de Cadastro */}
            {!isCadastroOpen ? null : (
                <Cadastro setIsCadastroOpen={setIsCadastroOpen} />
            )}

            <Image
                src="/images/logo.png"
                alt="Logo Letter Box"
                width={300}
                height={300}
                className="object-contain w-48 h-auto"
            />
            
            <div className="flex gap-10 justify-between w-full">

                <div className="flex gap-10">
                    {/*  Links INICIO e FILMES  */}
                    <Link href={"/"}>
                        <button>
                            <span className="text-[1.3rem] hover:text-[#df0643] cursor-pointer">INICIO</span>
                        </button>
                    </Link>
                    <Link href={"../movies"}>
                        <button>
                            <span className="text-[1.3rem] hover:text-[#df0643] cursor-pointer">FILMES</span>
                        </button>
                    </Link>
                    <Link href={"./bilheteria"}>
                        <button>
                            <span className="text-[1.3rem] hover:text-[#df0643] cursor-pointer">EM CARTAZ</span>
                        </button>
                    </Link>
                    <div>
                        {/* TODO Colocar uma Search Bar */}
                    </div>
                </div>
                
                {/* LÓGICA DE AUTENTICAÇÃO */}
                {user ? (
                    // 1. Se usuario tiver logado, mostra nome e logout
                    <div className="flex gap-4 items-center">
                        <span className="text-slate-300 text-[1.2rem]">Olá, {user.usuario}!</span>
                        <button onClick={() => setUser(null)}>
                            <span className="bg-[#CC083E] hover:bg-[#8b092e] cursor-pointer text-[1.3rem] rounded-2xl p-2 px-4 leading-none">Sair</span>
                        </button>
                    </div>
                ) : (
                    // 2. Se NÃO estiver logado, mostra botões de login/cadastro
                    !isLoginOpen ? (
                        // 2a. Se não logado E modal login fechado = Mostra botões
                        <div className="flex gap-10 items-center justify-center">
                            <button onClick={() => setIsLoginOpen(true)}>
                                <span className="text-[1.3rem] hover:text-[#df0643] cursor-pointer">ENTRAR</span>
                            </button>
                            <button onClick={() => setIsCadastroOpen(true)}>
                                <span className="bg-[#CC083E] hover:bg-[#8b092e] cursor-pointer text-[1.3rem] rounded-2xl p-2 px-4 leading-none">CADASTRE-SE</span>
                            </button>
                        </div>
                    ) : (
                        // 2b. Se não logado E modal login aberto = Mostra <Login /> no lugar dos botões
                        <Login setIsLoginOpen={setIsLoginOpen} />
                    )
                )}
            </div>
        </section>
    );
}