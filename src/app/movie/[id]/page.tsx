'use client';
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Review from "@/app/components/Review";
import Chat from "@/app/components/Chat";
import Image from "next/image";
import Link from "next/link";
import { Eye, Star, Heart, Play, Bot } from "lucide-react";
import { getMovieByPosterPath } from "@/app/hooks/movie-service/route";

// Função auxiliar para dividir strings com segurança, mesmo se forem nulas
const safeSplit = (str: string | null | undefined): string[] => {
    // Se a string for nula, indefinida ou vazia, retorna um array vazio
    if (!str) {
        return [];
    }
    // Caso contrário, divide e filtra para remover strings vazias (ex: "a,,b" vira ["a", "b"])
    return str.split(', ').filter(item => item.trim() !== '');
};

interface MovieData {
    id: string;
    title: string;
    overview: string;
    release_date: string;
    runtime: number;
    genres: string[];
    poster_path: string;
    vote_average: number;
    popularity: number;
    num_votes?: number;
    homepage?: string;
    director?: string;
    cast: string[];
    writers: string[];
    production_companies: string[];
    keywords: string[];
}

export default function MovieInfo() {
    const params = useParams();
    const posterPath = decodeURIComponent(params.id as string);

    const [movie, setMovie] = useState<MovieData>({
        id: "1",
        title: "The Shawshank Redemption",
        overview: "Dois homens presos formam um vínculo ao longo de vários anos, encontrando consolo e redenção através de atos de decência comum.",
        release_date: "1994-09-22",
        runtime: 142,
        genres: ["Drama", "Crime"],
        poster_path: "https://image.tmdb.org/t/p/original/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
        vote_average: 9.3,
        popularity: 87.6,
        num_votes: 67.888,
        homepage: "https://www.warnerbros.com/movies/shawshank-redemption/",
        director: "Frank Darabont",
        cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton", "William Sadler", "Clancy Brown", "Gil Bellows", "Mark Rolston", "James Whitmore", "Jeffrey DeMunn", "Larry Brandenburg"],
        writers: ["Stephen King", "Frank Darabont"],
        production_companies: ["Castle Rock Entertainment", "Columbia Pictures"],
        keywords: ["prison", "friendship", "hope", "escape", "wrongful imprisonment"]
    });

    const [loading, setLoading] = useState(true);
    const [option, setOption] = useState('elenco');
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        async function fetchMovie() {
            try {
                console.log('🎬 PosterPath recebido:', posterPath); 
                console.log('🎬 Params completo:', params); 

                setLoading(true);
                const movieData = await getMovieByPosterPath(posterPath);

                console.log('🎬 Dados recebidos da API:', movieData); 

                // Transforma os dados da API no formato esperado
                setMovie({
                    id: movieData.id?.toString() || 'N/A', // Proteção para id nulo
                    title: movieData.title || 'Título Desconhecido',
                    overview: movieData.overview || 'Sinopse não disponível.',
                    release_date: movieData.release_date || '', // Deixa vazio se for nulo
                    runtime: movieData.runtime || 0,
                    genres: safeSplit(movieData.genres), // ✅ CORRIGIDO
                    poster_path: `https://image.tmdb.org/t/p/original${movieData.poster_path}` || '/default-poster.jpg', // Adicione um poster padrão se quiser
                    vote_average: movieData.vote_average || movieData.averagerating || 0,
                    popularity: movieData.popularity || 0,
                    num_votes: movieData.numvotes || 0,
                    homepage: movieData.homepage || '#',
                    director: movieData.directors || 'Desconhecido',
                    cast: safeSplit(movieData.cast), // ✅ CORRIGIDO
                    writers: safeSplit(movieData.writers), // ✅ CORRIGIDO
                    production_companies: safeSplit(movieData.production_companies), // ✅ CORRIGIDO
                    keywords: safeSplit(movieData.keywords) // ✅ CORRIGIDO
                });
            } catch (err) {
                console.error("❌ Erro ao buscar filme:", err);
            } finally {
                setLoading(false);
            }
        }

        console.log('🎬 useEffect disparado. posterPath:', posterPath); 

        if (posterPath) {
            fetchMovie();
        }
    }, [posterPath]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#14181d] flex items-center justify-center">
                <div className="text-white">Carregando...</div>
            </div>
        );
    }

    return (
        <main className="">
            <title>Letter Box - {movie.title}</title>
            <Header />

            <Image
                src={movie.poster_path}
                width={1478}
                height={829}
                alt="Background Image"
                className="absolute lg:top-[-150] md:top-0 left-0 -z-10 w-full h-[829px] object-cover object-center mask-[linear-gradient(to_bottom,black_30%,transparent_100%)]"
            />

            {/* Blur embaixo da Header */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute w-full h-[100px] bg-[#000DA1]/80 blur-[120px] top-0 left-0"></div>
            </div>

            <section className="flex flex-col justify-center items-center mt-82 mb-18 mx-115">
                <div className="flex flex-row">

                    {/* Imagem do Poster, view,likes e botão de assistir */}
                    <div className="flex flex-col justify-center items-center place-self-start">
                        <Image
                            src={movie.poster_path}
                            width={300}
                            height={450}
                            alt={movie.title}
                            className="object-cover shadow-lg rounded-3xl"
                        />

                        <div className="flex flex-row items-center gap-2 mt-2">
                            <Eye className="w-10 h-10 shrink-0 text-[#00d471]" />
                            <span className="font-bold">{movie.popularity}</span>
                            <Star className="w-8 h-8 shrink-0 text-[#eeff55] fill-[#eeff55]" />
                            <span className="font-bold">{movie.vote_average}</span>
                            <Heart className="w-8 h-8 shrink-0 text-[#ff5571] fill-[#ff5571]" />
                            <span className="font-bold">{movie.num_votes}</span>
                        </div>
                        {/* Botão para assistir ao filme */}
                        <div className="mt-6 flex flex-row justify-center items-center gap-1 bg-slate-800 p-1 px-6 rounded-xl">
                            <h1 className="text-slate-300 whitespace-nowrap">Pagina Oficial:</h1>
                            <Link href={movie.homepage || '#'} className="flex flex-row gap-1 justify-center items-center cursor-pointer leading-none">
                                <Play className="w-8 h-8 shrink-0 text-slate-300 fill-slate-300 hover:text-slate-100 hover:fill-slate-100" />
                                <span className=" text-slate-300 hover:text-slate-100 fill-slate-100">Assistir Agora</span>
                            </Link>
                        </div>
                        <button
                            onClick={() => setIsChatOpen(true)}
                            className="mt-4 flex flex-row justify-center items-center gap-2 bg-[#CC083E] p-2 px-6 rounded-xl text-white hover:bg-[#A80633] transition-colors"
                        >
                            <Bot className="w-6 h-6 shrink-0 text-white" />
                            <span className="font-bold">Converse com o CinéZinho</span>
                        </button>
                    </div>
                    {/* FIM da Imagem do Poster, view,likes e botão de assistir */}

                    <div className="flex flex-col items-center ml-8 mt-4">

                        {/* Título, direção e descrição do filme */}
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl inline-block">
                                {movie.title} 
                                {/* Só mostra o ano se a data de lançamento existir */}
                                {movie.release_date && ` (${new Date(movie.release_date).getFullYear()})`}
                            </h1>
                            <span className="text-slate-100 whitespace-nowrap text-[1.1rem]">
                                Direção: {movie.director || 'Desconhecido'}
                            </span>
                            <p className="text-xl text-slate-400">{movie.overview}</p>
                        </div>
                        {/* FIM do Título, direção e descrição do filme */}

                        <div className="flex flex-col w-full mt-6">


                            <div className="flex flex-row gap-4 border-b border-slate-600 pb-1">
                                <span onClick={() => setOption("elenco")} className={` ${option === 'elenco' ? "text-slate-100" : "text-red-500"} text-[1.3rem] mr-2 cursor-pointer`}>Elenco</span>
                                <span onClick={() => setOption("detalhes")} className={` ${option === 'detalhes' ? "text-slate-100" : "text-red-500"} text-[1.3rem] mr-2 cursor-pointer`}>Detalhes</span>
                                <span onClick={() => setOption("generos")} className={` ${option === 'generos' ? "text-slate-100" : "text-red-500"} text-[1.3rem] mr-2 cursor-pointer`}>Gêneros</span>
                                <span onClick={() => setOption("palavras-chave")} className={` ${option === 'palavras-chave' ? "text-slate-100" : "text-red-500"} text-[1.3rem] mr-2 cursor-pointer`}>Palavras-Chave</span>
                            </div>

                            <div className="min-h-[250px] transition-all duration-300">
                                {option === 'elenco' && (
                                    <div className="mt-4 flex flex-row flex-wrap">
                                        {
                                            movie.cast.map((actor, index) => (
                                                <span key={index} className="m-2 p-1 px-2 rounded-[3px] bg-slate-800">
                                                    {actor}
                                                </span>
                                            ))
                                        }
                                    </div>
                                )}
                                {option === 'detalhes' && (
                                    <div className="mt-4">
                                        <div className="flex flex-row flex-wrap">
                                            <h2 className="text-xl mb-2 mt-2">Escritores:</h2>
                                            {
                                                movie.writers.map((writer, index) => (
                                                    <span key={index} className="m-2 p-1 px-2 rounded-[3px] bg-slate-800">
                                                        {writer}
                                                    </span>
                                                ))
                                            }
                                        </div>

                                        <div className="flex flex-row flex-wrap">
                                            <h2 className="text-xl mb-2 mt-2">Empresas Produtoras:</h2>
                                            {
                                                movie.production_companies.map((companies, index) => (
                                                    <span key={index} className="m-2 p-1 px-2 rounded-[3px] bg-slate-800">
                                                        {companies}
                                                    </span>
                                                ))
                                            }
                                        </div>

                                        <div className="flex flex-row flex-wrap">
                                            <h2 className="text-xl mb-2 mt-2">Duração:</h2>
                                            <span className="m-2 p-1 px-2 rounded-[3px] bg-slate-800">
                                                {movie.runtime} minutos
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {option === 'generos' && (
                                    <div className="flex flex-row flex-wrap">
                                        <h2 className="text-xl mb-2 mt-2">Gêneros:</h2>
                                        {
                                            movie.genres.map((genre, index) => (
                                                <span key={index} className="m-2 p-1 px-2 rounded-[3px] bg-slate-800">
                                                    {genre}
                                                </span>
                                            ))
                                        }
                                    </div>
                                )}
                                {option === 'palavras-chave' && (
                                    <div className="flex flex-row flex-wrap">
                                        <h2 className="text-xl mb-2 mt-2">Tags:</h2>
                                        {
                                            movie.keywords.map((key, index) => (
                                                <span key={index} className="m-2 p-1 px-2 rounded-[3px] bg-slate-800">
                                                    {key}
                                                </span>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="w-full">

                            <h1 className="text-1xl text-slate-300 border-b border-[#CC083E]">AVALIAÇÕES</h1>

                            {/* TODO */}
                            <div className="flex flex-col">
                                <Review />
                                <Review />
                                <Review />
                                <Review />
                                <Review />
                                <Review />
                            </div>

                        </div>

                    </div>

                </div>
            </section>
            <Chat
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                movieTitle={movie.title}
            />
        </main>
    );
}