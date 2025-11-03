'use client';
import React, { useState } from "react"; // Importa o useState
import HeaderBg from "@/app/components/HeaderBg";
import Movie from "@/app/components/Movie"; // Você pode usar isso depois para listar os resultados
import Link from "next/link";

export default function Movies() {
    // 1. Estado para guardar o valor da barra de pesquisa
    const [searchQuery, setSearchQuery] = useState('');

    // TODO: Adicionar um useEffect para buscar na API quando o searchQuery mudar (com debounce)

    return (
        <main>
            <title>Letter Box - Filmes</title>
            <HeaderBg />

            <div className="mt-16 mx-90 flex flex-col gap-16 mb-18">

                <div className="flex flex-row gap-4 items-center">

                    <span className="text-2xl text-slate-400">Procure um Filme</span>
                    
                    <div className="relative">
                        <form>
                            <input 
                                className="bg-[#23282c] border border-slate-600 p-1 rounded-[3px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#CC083E] w-96" // Aumentei um pouco a largura
                                placeholder="Digite o nome do filme..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>

                        {searchQuery.length > 0 && (
                            <div className="absolute top-full left-0 w-96 mt-1 bg-[#23282c] border border-slate-600 rounded-[3px] shadow-lg z-10 max-h-80 overflow-y-auto">
                                {/* TODO Buscar da API */}

                                <ul className="text-slate-200 divide-y divide-slate-700">

                                    <li className="p-2 hover:bg-slate-700 cursor-pointer">
                                        <Link href="#" className="flex items-center gap-2">
                                            <img src="https://placehold.co/40x60/23282c/eee?text=Poster" alt="Poster" className="w-10 h-15 object-cover rounded" />
                                            <span>Exemplo de Filme 1</span>
                                        </Link>
                                    </li>

                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full flex flex-col justify-center items-center mb-8">

                    <div className="flex flex-row w-full border-b justify-between border-[#CC083E] mb-6">
                        <h1 className="text-1xl text-slate-300">FILMES NO NOSSO CATÁLOGO</h1>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-row gap-4">
                            <Movie posterPath={'/s0z9xkEjJ7x9V3OC7NhZmck2MSH.jpg'} size="medium"/>
                            <Movie posterPath={'/gmjihTFH7ROwJuthIZvoLC99AtS.jpg'} size="medium"/>
                            <Movie posterPath={'/frZj5djlU9hFEjMcL21RJZVuG5O.jpg'} size="medium"/>
                            <Movie posterPath={'/vo6osRMn09BulzfMBlS2BlK9Sgq.jpg'} size="medium"/>
                            <Movie posterPath={'/ewKJEjLSZEp1Qq4Dl9W9zEld5gp.jpg'} size="medium"/>
                        </div>
                        <div className="flex flex-row gap-4">
                            <Movie posterPath={'/s0z9xkEjJ7x9V3OC7NhZmck2MSH.jpg'} size="medium"/>
                            <Movie posterPath={'/gmjihTFH7ROwJuthIZvoLC99AtS.jpg'} size="medium"/>
                            <Movie posterPath={'/frZj5djlU9hFEjMcL21RJZVuG5O.jpg'} size="medium"/>
                            <Movie posterPath={'/vo6osRMn09BulzfMBlS2BlK9Sgq.jpg'} size="medium"/>
                            <Movie posterPath={'/ewKJEjLSZEp1Qq4Dl9W9zEld5gp.jpg'} size="medium"/>
                        </div>
                    </div>

                    <button className="mt-8">
                        <span className="text-1xl text-slate-300">VER MAIS</span>
                    </button>
                </div>


            </div>
            
        </main>
    );
}
