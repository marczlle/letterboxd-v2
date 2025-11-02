'use client';
import React from "react";
import Header from "@/app/components/Header";
import Review from "@/app/components/Review";
import Image from "next/image";
import Link from "next/link";
import { Eye, Star, Heart, Play } from "lucide-react";
import { useState } from 'react';

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

export default function MovieInfo({
    movie = {
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
    },
}: {
    movie?: MovieData;
}) {
    // TODO Implementar um UseEffect pra pegar o ID do filme pela URL e buscar os dados pela API

    const [option, setOption] = useState('elenco');

    return (
        <main className="">
            <title>Letter Box - {movie.title}</title>
            <Header />

            <Image
                src={movie.poster_path}
                width={1478} // Pode ser um valor grande o suficiente ou deixar o layout gerenciar
                height={829} // Manter a altura atual para que toque levemente o conteúdo
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
                            <Eye className="w-10 h-10 shrink-0 text-[#00d471]"/>
                            <span className="font-bold">{movie.popularity}</span>
                            <Star className="w-8 h-8 shrink-0 text-[#eeff55] fill-[#eeff55]"/>
                            <span className="font-bold">{movie.vote_average}</span>
                            <Heart className="w-8 h-8 shrink-0 text-[#ff5571] fill-[#ff5571]"/>
                            <span className="font-bold">{movie.num_votes}</span>
                        </div>
                        {/* Botão para assistir ao filme */}
                        <div className="mt-6 flex flex-row justify-center items-center gap-1 bg-slate-800 p-1 px-6 rounded-xl">
                            <h1 className="text-slate-300 whitespace-nowrap">Pagina Oficial:</h1>
                            <Link href={movie.homepage || '#'} className="flex flex-row gap-1 justify-center items-center cursor-pointer leading-none">
                                <Play className="w-8 h-8 shrink-0 text-slate-300 fill-slate-300 hover:text-slate-100 hover:fill-slate-100"/>
                                <span className=" text-slate-300 hover:text-slate-100 fill-slate-100">Assistir Agora</span>
                            </Link>
                        </div>
                    </div>
                    {/* FIM da Imagem do Poster, view,likes e botão de assistir */}
                    
                    <div className="flex flex-col items-center ml-8 mt-4">

                        {/* Título, direção e descrição do filme */}
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl inline-block">
                                {movie.title} ({new Date(movie.release_date).getFullYear()})
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

        </main>
    );
}
