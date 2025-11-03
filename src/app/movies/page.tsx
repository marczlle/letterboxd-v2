'use client';
import React, { useState, useEffect } from "react"; // Importa useState e useEffect
import HeaderBg from "@/app/components/HeaderBg";
import { getRandomMovie } from "@/app/hooks/movie-service/route";
import Movie from "@/app/components/Movie";
import Link from "next/link";

interface MovieType {
    id: string | number;
    poster_path: string;
    title: string;
    popularity: string | number;
    vote_average: string | number;
}

const MOVIES_PER_PAGE = 10;

function chunk<T>(array: T[], size: number): T[][] {
    if (!array.length) return [];
    const head = array.slice(0, size);
    const tail = array.slice(size);
    return [head, ...chunk(tail, size)];
}

export default function Movies() {
    const [searchQuery, setSearchQuery] = useState('');

    const [movies, setMovies] = useState<MovieType[]>([]);

    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // 7busca os 10 filmes iniciais 
    useEffect(() => {
        const fetchInitialMovies = async () => {
            setIsInitialLoading(true);
            try {
                const initialMovies = await getRandomMovie(MOVIES_PER_PAGE);
                setMovies(initialMovies); 
            } catch (error) {
                console.error("Erro ao buscar filmes iniciais:", error);
            }
            setIsInitialLoading(false);
        };

        fetchInitialMovies();
    }, []); 

    // busca mais 10 filmes e ADICIONA na lista
    const handleLoadMore = async () => {
        setIsLoadingMore(true); 
        try {
            const newMovies = await getRandomMovie(MOVIES_PER_PAGE);

            setMovies(prevMovies => [...prevMovies, ...newMovies]);

        } catch (error) {
            console.error("Erro ao buscar mais filmes:", error);
        }
        setIsLoadingMore(false); 
    };


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
                                className="bg-[#23282c] border border-slate-600 p-1 rounded-[3px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#CC083E] w-96"
                                placeholder="Digite o nome do filme..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>
                        {searchQuery.length > 0 && (
                            <div className="absolute top-full left-0 w-96 mt-1 bg-[#23282c] border border-slate-600 rounded-[3px] shadow-lg z-10 max-h-80 overflow-y-auto">
                                {/* ... (lógica de busca) ... */}
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

                    {isInitialLoading && (
                        <div className="flex flex-col gap-4">
                            {[...Array(2)].map((_, rowIndex) => ( // 2 fileiras
                                <div key={rowIndex} className="flex flex-row gap-4">
                                    {[...Array(5)].map((_, movieIndex) => ( // 5 filmes
                                        <div key={movieIndex} className="w-48 h-[288px] bg-slate-700 rounded-lg animate-pulse"></div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* lista de filmes dinâmica */}
                    {!isInitialLoading && (
                        <div className="flex flex-col gap-4">
                            {chunk(movies, 5).map((row, rowIndex) => (
                                <div key={rowIndex} className="flex flex-row gap-4">
                                    {row.map((movie) => (
                                        <Movie
                                            key={String(movie.id)}
                                            id={String(movie.id)}
                                            posterPath={movie.poster_path}
                                            title={movie.title}
                                            popularity={String(movie.popularity)}
                                            averageRating={String(movie.vote_average)}
                                            size="medium"
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {!isInitialLoading && (
                        <button
                            className="mt-8"
                            onClick={handleLoadMore}
                            disabled={isLoadingMore} 
                        >
                            <span className="text-1xl text-slate-300">
                                {isLoadingMore ? 'CARREGANDO...' : 'VER MAIS'}
                            </span>
                        </button>
                    )}
                </div>

            </div>

        </main>
    );
}