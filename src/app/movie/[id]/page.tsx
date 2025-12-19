'use client';
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Review from "@/app/components/Review";
import Chat from "@/app/components/Chat";
import Image from "next/image";
import Link from "next/link";
import { Eye, Star, Heart, Play, Bot, Send } from "lucide-react";
import { getMovieByPosterPath } from "@/app/hooks/movie-service/route";
import { getReviewsByMovieId, submitReview } from "@/app/hooks/review-service/route";
import { authenticateUser } from "@/app/hooks/user-service/route";

// Função auxiliar para dividir strings com segurança
const safeSplit = (str: string | null | undefined): string[] => {
    if (!str) {
        return [];
    }
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

interface ReviewData {
    reviewername: string;
    reviewtext: string;
    stars: number;
}

export default function MovieInfo() {
    const params = useParams();
    const posterPath = decodeURIComponent(params.id as string);

    // --- ESTADOS DO USUÁRIO ---
    // Guarda os dados do usuário logado (vindo do back-end)
    const [currentUser, setCurrentUser] = useState<any>(null);

    // --- ESTADOS DO FILME ---
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
    
    // Estados para avaliação do usuário
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [userReview, setUserReview] = useState('');
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    // Estados para avaliações de outros usuários
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    // 1. Verifica autenticação ao carregar a página (Igual ao Header)
    useEffect(() => {
        async function checkAuth() {
            try {
                const data = await authenticateUser();
                if (data.ok) {
                    console.log("Usuário autenticado:", data.user);
                    setCurrentUser(data.user);
                }
            } catch (error) {
                console.error("Usuário não logado ou erro na auth:", error);
            }
        }
        checkAuth();
    }, []);

    // 2. Busca dados do Filme
    useEffect(() => {
        async function fetchMovie() {
            try {
                setLoading(true);
                const movieData = await getMovieByPosterPath(posterPath);

                console.log(movieData)

                setMovie({
                    id: movieData.id?.toString() || 'N/A',
                    title: movieData.title || 'Título Desconhecido',
                    overview: movieData.overview || 'Sinopse não disponível.',
                    release_date: movieData.release_date || '',
                    runtime: movieData.runtime || 0,
                    genres: safeSplit(movieData.genres),
                    poster_path: `https://image.tmdb.org/t/p/original${movieData.poster_path}` || '/default-poster.jpg',
                    vote_average: movieData.vote_average || movieData.averagerating || 0,
                    popularity: movieData.popularity || 0,
                    num_votes: movieData.numvotes || 0,
                    homepage: movieData.homepage || '#',
                    director: movieData.directors || 'Desconhecido',
                    cast: safeSplit(movieData.cast),
                    writers: safeSplit(movieData.writers),
                    production_companies: safeSplit(movieData.production_companies),
                    keywords: safeSplit(movieData.keywords)
                });
                
            } catch (err) {
                console.error("❌ Erro ao buscar filme:", err);
            } finally {
                setLoading(false);
            }
        }

        if (posterPath) {
            fetchMovie();
        }
    }, [posterPath]);

    // 3. Busca Reviews do Filme
    useEffect(() => {
        if (!movie.id) return;
    
        async function fetchReviews() {
            try {
                setReviewsLoading(true);
                const data = await getReviewsByMovieId(movie.id);
                setReviews(data);
            } catch (err) {
                console.error('Erro ao buscar reviews:', err);
            } finally {
                setReviewsLoading(false);
            }
        }
    
        fetchReviews();
    }, [movie.id]);

    // 4. Lógica de Envio de Review
    const handleSubmitReview = async () => {
        // Validação de inputs
        if (userRating === 0) {
            alert('Por favor, selecione uma nota!');
            return;
        }
        if (userReview.trim() === '') {
            alert('Por favor, escreva sua avaliação!');
            return;
        }

        if (!currentUser) {
            alert('Você precisa estar logado para avaliar! Por favor, faça login no topo da página.');
            return; 
        }

        try {
            await submitReview(movie.id, userReview, userRating, currentUser); 
            
            setReviewSubmitted(true);
            
            const newReview: ReviewData = {
                reviewername: currentUser.usuario || "Você",
                reviewtext: userReview,
                stars: userRating
            };
            setReviews(prev => [newReview, ...prev]);

            setTimeout(() => {
                setReviewSubmitted(false);
                setUserRating(0);
                setUserReview('');
            }, 3000);

        } catch (error: any) {
            // --- LOGICA PARA 1 REVIEW POR FILME ---
            // Verifica se a mensagem de erro contém o aviso de duplicidade do Postgres
            if (error.message.includes("unique constraint") || error.message.includes("duplicate key")) {
                alert('Você já avaliou este filme! Só é permitido uma avaliação por filme.');
            } else {
                console.error(error);
                alert('Erro ao enviar avaliação. Tente novamente mais tarde.');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#14181d] flex items-center justify-center">
                <div className="text-white">Carregando...</div>
            </div>
        );
    }

    return (
        <main className="min-h-screen">
            <title>Letter Box - {movie.title}</title>
            <Header />

            {/* Background Image - Oculta em mobile */}
            <Image
                src={movie.poster_path}
                width={1478}
                height={829}
                alt="Background Image"
                className="absolute lg:top-[-150px] md:top-0 left-0 -z-10 w-full h-[829px] object-cover object-center mask-[linear-gradient(to_bottom,black_30%,transparent_100%)] hidden md:block"
            />

            {/* Blur embaixo da Header */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute w-full h-[100px] bg-[#000DA1]/80 blur-[120px] top-0 left-0"></div>
            </div>

            <section className="flex flex-col justify-center items-center mt-20 md:mt-82 mb-8 md:mb-18 mx-4 md:mx-8 lg:mx-115">
                <div className="flex flex-col lg:flex-row w-full max-w-7xl gap-6 lg:gap-0">

                    {/* Imagem do Poster, stats e botões */}
                    <div className="flex flex-col justify-center items-center lg:place-self-start w-full lg:w-auto">
                        <Image
                            src={movie.poster_path}
                            width={300}
                            height={450}
                            alt={movie.title}
                            className="object-cover shadow-lg rounded-3xl w-full max-w-[300px] h-auto"
                        />

                        {/* Stats - Layout ajustado para mobile */}
                        <div className="flex flex-row items-center justify-center gap-3 md:gap-4 mt-4 flex-wrap">
                            <div className="flex items-center gap-1">
                                <Eye className="w-6 h-6 md:w-10 md:h-10 shrink-0 text-[#00d471]" />
                                <span className="font-bold text-sm md:text-base">{movie.popularity}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Star className="w-6 h-6 md:w-8 md:h-8 shrink-0 text-[#eeff55] fill-[#eeff55]" />
                                <span className="font-bold text-sm md:text-base">{movie.vote_average}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Heart className="w-6 h-6 md:w-8 md:h-8 shrink-0 text-[#ff5571] fill-[#ff5571]" />
                                <span className="font-bold text-sm md:text-base">{movie.num_votes}</span>
                            </div>
                        </div>

                        {/* Botão para assistir ao filme */}
                        <div className="mt-6 flex flex-col md:flex-row justify-center items-center gap-2 bg-slate-800 p-3 px-4 md:px-6 rounded-xl w-full max-w-[300px]">
                            <h1 className="text-slate-300 text-sm md:text-base whitespace-nowrap">Página Oficial:</h1>
                            <Link href={movie.homepage || '#'} className="flex flex-row gap-1 justify-center items-center cursor-pointer leading-none">
                                <Play className="w-6 h-6 md:w-8 md:h-8 shrink-0 text-slate-300 fill-slate-300 hover:text-slate-100 hover:fill-slate-100" />
                                <span className="text-slate-300 hover:text-slate-100 text-sm md:text-base">Assistir Agora</span>
                            </Link>
                        </div>

                        {/* Botão CinéZinho */}
                        <button
                            onClick={() => setIsChatOpen(true)}
                            className="mt-4 flex flex-row justify-center items-center gap-2 bg-[#CC083E] p-3 px-4 md:px-6 rounded-xl text-white hover:bg-[#A80633] transition-colors w-full max-w-[300px]"
                        >
                            <Bot className="w-5 h-5 md:w-6 md:h-6 shrink-0 text-white" />
                            <span className="font-bold text-sm md:text-base">Converse com o CinéZinho</span>
                        </button>
                    </div>

                    {/* Conteúdo principal */}
                    <div className="flex flex-col items-start lg:ml-8 mt-6 lg:mt-4 w-full">

                        {/* Título, direção e descrição */}
                        <div className="flex flex-col gap-2 w-full">
                            <h1 className="text-2xl md:text-3xl font-bold">
                                {movie.title} 
                                {movie.release_date && ` (${new Date(movie.release_date).getFullYear()})`}
                            </h1>
                            <span className="text-slate-100 text-base md:text-[1.1rem]">
                                Direção: {movie.director || 'Desconhecido'}
                            </span>
                            <p className="text-base md:text-xl text-slate-400">{movie.overview}</p>
                        </div>

                        {/* Tabs de informações */}
                        <div className="flex flex-col w-full mt-6">
                            {/* Menu de tabs - Scroll horizontal em mobile */}
                            <div className="flex flex-row gap-3 md:gap-4 border-b border-slate-600 pb-1 overflow-x-auto whitespace-nowrap">
                                <span onClick={() => setOption("elenco")} className={`${option === 'elenco' ? "text-slate-100" : "text-red-500"} text-base md:text-[1.3rem] cursor-pointer`}>Elenco</span>
                                <span onClick={() => setOption("detalhes")} className={`${option === 'detalhes' ? "text-slate-100" : "text-red-500"} text-base md:text-[1.3rem] cursor-pointer`}>Detalhes</span>
                                <span onClick={() => setOption("generos")} className={`${option === 'generos' ? "text-slate-100" : "text-red-500"} text-base md:text-[1.3rem] cursor-pointer`}>Gêneros</span>
                                <span onClick={() => setOption("palavras-chave")} className={`${option === 'palavras-chave' ? "text-slate-100" : "text-red-500"} text-base md:text-[1.3rem] cursor-pointer`}>Palavras-Chave</span>
                            </div>

                            <div className="min-h-[200px] md:min-h-[250px] transition-all duration-300">
                                {option === 'elenco' && (
                                    <div className="mt-4 flex flex-row flex-wrap gap-2">
                                        {movie.cast.map((actor, index) => (
                                            <span key={index} className="p-2 px-3 rounded-md bg-slate-800 text-sm md:text-base">
                                                {actor}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {option === 'detalhes' && (
                                    <div className="mt-4">
                                        <div className="flex flex-col md:flex-row md:flex-wrap">
                                            <h2 className="text-lg md:text-xl mb-2 mt-2 w-full">Escritores:</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {movie.writers.map((writer, index) => (
                                                    <span key={index} className="p-2 px-3 rounded-md bg-slate-800 text-sm md:text-base">
                                                        {writer}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row md:flex-wrap mt-4">
                                            <h2 className="text-lg md:text-xl mb-2 mt-2 w-full">Empresas Produtoras:</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {movie.production_companies.map((companies, index) => (
                                                    <span key={index} className="p-2 px-3 rounded-md bg-slate-800 text-sm md:text-base">
                                                        {companies}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-row items-center gap-2 mt-4">
                                            <h2 className="text-lg md:text-xl">Duração:</h2>
                                            <span className="p-2 px-3 rounded-md bg-slate-800 text-sm md:text-base">
                                                {movie.runtime} minutos
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {option === 'generos' && (
                                    <div className="flex flex-col md:flex-row md:flex-wrap mt-4">
                                        <h2 className="text-lg md:text-xl mb-2 w-full">Gêneros:</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {movie.genres.map((genre, index) => (
                                                <span key={index} className="p-2 px-3 rounded-md bg-slate-800 text-sm md:text-base">
                                                    {genre}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {option === 'palavras-chave' && (
                                    <div className="flex flex-col md:flex-row md:flex-wrap mt-4">
                                        <h2 className="text-lg md:text-xl mb-2 w-full">Tags:</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {movie.keywords.map((key, index) => (
                                                <span key={index} className="p-2 px-3 rounded-md bg-slate-800 text-sm md:text-base">
                                                    {key}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Seção de Avaliação do Usuário */}
                        <div className="w-full mt-8 mb-6">
                            <h2 className="text-xl md:text-2xl text-slate-300 border-b border-[#CC083E] pb-2 mb-4">
                                SUA AVALIAÇÃO
                            </h2>
                            
                            <div className="bg-slate-800/50 p-4 md:p-6 rounded-xl">
                                {/* Sistema de estrelas */}
                                <div className="flex flex-col gap-3 mb-4">
                                    <label className="text-slate-300 font-semibold">Sua nota (0-10):</label>
                                    <div className="flex gap-1 md:gap-2">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setUserRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="transition-transform hover:scale-110 focus:outline-none"
                                            >
                                                <Star
                                                    className={`w-6 h-6 md:w-8 md:h-8 ${
                                                        star <= (hoverRating || userRating)
                                                            ? 'text-[#eeff55] fill-[#eeff55]'
                                                            : 'text-slate-600'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    {userRating > 0 && (
                                        <span className="text-slate-400 text-sm">
                                            Nota selecionada: {userRating}/10
                                        </span>
                                    )}
                                </div>

                                {/* Campo de texto para review */}
                                <div className="flex flex-col gap-3">
                                    <label className="text-slate-300 font-semibold">Seu comentário:</label>
                                    <textarea
                                        value={userReview}
                                        onChange={(e) => setUserReview(e.target.value)}
                                        placeholder="Compartilhe sua opinião sobre o filme..."
                                        className="w-full h-32 p-3 bg-slate-700/50 text-slate-100 rounded-lg border border-slate-600 focus:border-[#CC083E] focus:outline-none resize-none text-sm md:text-base"
                                        maxLength={500}
                                    />
                                    <span className="text-slate-500 text-xs md:text-sm self-end">
                                        {userReview.length}/500 caracteres
                                    </span>
                                </div>

                                {/* Botão de enviar */}
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={reviewSubmitted}
                                    className={`mt-4 w-full md:w-auto flex flex-row justify-center items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
                                        reviewSubmitted
                                            ? 'bg-green-600 cursor-not-allowed'
                                            : 'bg-[#CC083E] hover:bg-[#A80633]'
                                    }`}
                                >
                                    {reviewSubmitted ? (
                                        <>
                                            <span>✓ Avaliação enviada!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            <span>Enviar Avaliação</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Seção de avaliações de outros usuários */}
                        <div className="w-full">
                            <h1 className="text-xl md:text-2xl text-slate-300 border-b border-[#CC083E] pb-2">
                                AVALIAÇÕES DA COMUNIDADE
                            </h1>

                            <div className="flex flex-col gap-4 mt-4">
                                {reviewsLoading ? (
                                    <div className="text-white animate-pulse">Carregando avaliações...</div>
                                ) : reviews.length > 0 ? (
                                    reviews.map((item, index) => (
                                        <Review
                                            key={index}
                                            reviewerName={item.reviewername}
                                            reviewText={item.reviewtext}
                                            stars={item.stars}
                                        />
                                    ))
                                ) : (
                                    <div className="text-slate-500 italic mt-4">
                                        Nenhuma avaliação disponível para este filme.
                                    </div>
                                )}
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