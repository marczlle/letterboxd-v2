'use client';
import Image from "next/image";
import Login from "./Login";
import Cadastro from "./Cadastro";
import React, { useState } from "react";
import Link from "next/link";

export default function Header() {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isCadastroOpen, setIsCadastroOpen] = useState(false);

    return (
        <section className="flex flex-row items-center gap-3 py-8 px-24">

            {/* Mostra o Overlay do Cadastro se estiver ativo, se não tiver mostra nada */}
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

                    <Link href={"./"}>
                        <button>
                            <span className="text-[1.3rem] hover:text-[#df0643] cursor-pointer">INICIO</span>
                        </button>
                    </Link>
                    
                    <Link href={"./movies"}>
                        <button>
                            <span className="text-[1.3rem] hover:text-[#df0643] cursor-pointer">FILMES</span>
                        </button>
                    </Link>

                    {/* TODO */}
                    <div>
                        {/* Futura Search bar */}
                    </div>

                </div>
                
                {!isLoginOpen ? (
                <div className="flex gap-10 items-center justify-center">

                    <button onClick={() => setIsLoginOpen(true)}>
                        <span className="text-[1.3rem] hover:text-[#df0643] cursor-pointer">ENTRAR</span>
                    </button>

                    <button onClick={() => setIsCadastroOpen(true)}>
                        <span className="bg-[#CC083E] hover:bg-[#8b092e] cursor-pointer text-[1.3rem] rounded-2xl p-2 px-4 leading-none">CADASTRE-SE</span>
                    </button>

                </div>
                ) : (
                    <Login setIsLoginOpen={setIsLoginOpen} />
                )}

            </div>

        </section>
    );
}
