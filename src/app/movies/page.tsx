'use client';
import React, { useState, useEffect } from "react";
import HeaderBg from "@/app/components/HeaderBg";
import { getRandomMovie, searchMoviesByName } from "@/app/hooks/movie-service/service";
import Movie from "@/app/components/Movie";
import Link from "next/link";

interface MovieType {
    id: string | number;
    poster_path?: string;
    title: string;
    popularity?: string | number;
    vote_average?: string | number;
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
    const [searchResults, setSearchResults] = useState<MovieType[]>([]);
    const [movies, setMovies] = useState<MovieType[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

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

    const handleLoadMore = async () => {
        setIsLoadingMore(true);
        try {
            const newMovies = await getRandomMovie(MOVIES_PER_PAGE);
            setMovies(prev => [...prev, ...newMovies]);
        } catch (error) {
            console.error("Erro ao buscar mais filmes:", error);
        }
        setIsLoadingMore(false);
    };

    useEffect(() => {
        if (!searchQuery.trim()) return;

        const timeout = setTimeout(async () => {
            setIsSearching(true);
            try {
                const data = await searchMoviesByName(searchQuery);
                setSearchResults(data || []);
            } catch (error) {
                console.error("Erro na busca:", error);
            }
            setIsSearching(false);
        }, 500);

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    return (
        <main>
            <title>Letter Box - Filmes</title>
            <HeaderBg />

            <div className="mt-16 mx-90 flex flex-col gap-16 mb-18">
                <div className="flex flex-row gap-4 items-center">
                    <span className="text-2xl text-slate-400">Procure um Filme</span>
                    <div className="relative">
                        <form onSubmit={(e) => e.preventDefault()}>
                            <input
                                className="bg-[#23282c] border border-slate-600 p-1 rounded-[3px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#CC083E] w-96"
                                placeholder="Digite o nome do filme..."
                                value={searchQuery}
                                onChange={(e) => {

                                    const value = e.target.value;

                                    setSearchQuery(value);

                                    if (!value.trim()) {

                                        setSearchResults([]);

                                    }

                                }}
                            />
                        </form>

                        {/* Dropdown de busca */}
                        {searchQuery.length > 0 && (
                            <div className="absolute top-full left-0 w-96 mt-1 bg-[#23282c] border border-slate-600 rounded-[3px] shadow-lg z-10 max-h-80 overflow-y-auto">
                                {isSearching ? (
                                    <div className="p-2 text-slate-400 text-center">Buscando...</div>
                                ) : searchResults.length > 0 ? (
                                    <ul className="text-slate-200 divide-y divide-slate-700">
                                        {searchResults.map((movie) => {
                                            const encodedPoster = encodeURIComponent(movie.poster_path || "");
                                            return (
                                                <li key={movie.id} className="p-2 hover:bg-slate-700 cursor-pointer">
                                                    <Link
                                                        href={`/movie/${encodedPoster}`}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <img
                                                            src={movie.poster_path
                                                                ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                                                                : "https://placehold.co/40x60/23282c/eee?text=?"}
                                                            alt={movie.title}
                                                            className="w-10 h-15 object-cover rounded"
                                                        />
                                                        <span>{movie.title}</span>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <div className="p-2 text-slate-400 text-center">Nenhum resultado encontrado</div>
                                )}
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
                            {[...Array(2)].map((_, rowIndex) => (
                                <div key={rowIndex} className="flex flex-row gap-4">
                                    {[...Array(5)].map((_, movieIndex) => (
                                        <div key={movieIndex} className="w-48 h-[288px] bg-slate-700 rounded-lg animate-pulse"></div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {!isInitialLoading && (
                        <div className="flex flex-col gap-4">
                            {chunk(movies, 5).map((row, rowIndex) => (
                                <div key={rowIndex} className="flex flex-row gap-4">
                                    {row.map((movie) => (
                                        <Movie
                                            key={String(movie.id)}
                                            id={String(movie.id)}
                                            posterPath={movie.poster_path || ""}
                                            title={movie.title}
                                            popularity={String(movie.popularity || "")}
                                            averageRating={String(movie.vote_average || "")}
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
