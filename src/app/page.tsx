'use client'
import Image from "next/image";
import Header from './components/Header';
import Movie from './components/Movie';
import Link from "next/link";
import { Heart, Star, Search, Info, User, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getRandomMovie } from "@/app/hooks/movie-service/service";

interface MovieType {
  id: string | number;
  poster_path: string;
  title: string;
  popularity: number | string;
  vote_average: number | string; 
}

export default function Home() {

  const [randomMovies, setRandomMovies] = useState<MovieType[]>([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Chama a API pedindo por 4 filmes
        const random_movies = await getRandomMovie(4); 
        setRandomMovies(random_movies); // Guarda os filmes no estado
      } catch (error) {
        console.error("Erro ao buscar filmes aleatórios:", error);
      }
    };
    fetchMovies();
  }, []);

  return (
    <main className="">

      <title>Letter Box - Pagina Inicial</title>

      <div>

        <Header/>

        {/* Imagem Banner */}
        
        <Image 
          src="/images/banner3.png"
          width={1478}
          height={829}
          alt="Background Image"
          className="absolute lg:top-[-150] md:top-0 left-0 -z-10 w-full h-[full] mask-[linear-gradient(to_bottom,black_70%,transparent_100%)]"
        />

        {/* Blur embaixo da Header */}

        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute w-full h-[100px] bg-[#000DA1]/50 blur-[120px] top-0 left-0"></div>
        </div>

        {/* Componente de filmes, pega 4 filmes aleatorios e mostra */}
        <div className="flex flex-row justify-center items-center gap-8 mt-18">
          {randomMovies.length > 0 ? (
            randomMovies.map((movie) => (
              <Movie 
                key={String(movie.id)}
                id={String(movie.id)}
                posterPath={movie.poster_path}
                title={movie.title}
                popularity={String(movie.popularity)}
                averageRating={String(movie.vote_average)} 
              />
            ))
          ) : (
            [...Array(4)].map((_, index) => (
              <div key={index} className="w-48 h-[288px] bg-slate-700 rounded-lg animate-pulse"></div>
            ))
          )}
        </div>

        {/* Content Wraper */}
        <div className="mt-32 mx-115 flex flex-col justify-center items-center gap-4 mb-18">

          {/* Funções do site */}
          <div className="flex flex-col gap-4 mb-8">

            <div className="flex flex-row gap-4">
              <div className="bg-slate-700 max-w-[300px] rounded-[3px] p-5 flex flex-row justify-center items-center gap-4">
                <Heart className="w-8 h-8 shrink-0 fill-slate-200"/>
                <h1 className="text-1xl text-slate-200 text-base leading-tight wrap-break-word">Compre ingressos para assistir filmes em cartaz</h1>
              </div>
              <div className="bg-slate-700 max-w-[300px] rounded-[3px] p-5 flex flex-row justify-center items-center gap-4">
                <Star className="w-8 h-8 shrink-0 fill-slate-200"/>
                <h1 className="text-1xl text-slate-200 text-base leading-tight wrap-break-word">Avalie seu ultimo filme assistido de 0 a 10 estrelas</h1>
              </div>
              <div className="bg-slate-700 max-w-[300px] rounded-[3px] p-5 flex flex-row justify-center items-center gap-4">
                <Search className="w-8 h-8 shrink-0 fill-slate-200"/>
                <h1 className="text-1xl text-slate-200 text-base leading-tight wrap-break-word">Procure por filmes que você já assistiu ou pretende assistir</h1>
              </div>
            </div>

            <div className="flex flex-row gap-4">
              <div className="bg-slate-700 max-w-[300px] rounded-[3px] p-5 flex flex-row justify-center items-center gap-4">
                <Info className="w-8 h-8 shrink-0 "/>
                <h1 className="text-1xl text-slate-200 text-base leading-tight wrap-break-word">Veja informações detalhadas sobre os filmes que você quiser</h1>
              </div>
              <div className="bg-slate-700 max-w-[300px] rounded-[3px] p-5 flex flex-row justify-center items-center gap-4">
                <User className="w-8 h-8 shrink-0 fill-slate-200"/>
                <h1 className="text-1xl text-slate-200 text-base leading-tight wrap-break-word">Siga outros usuarios para acompanhar suas reviews mais recentes (Em breve)</h1>
              </div>
              <div className="bg-slate-700 max-w-[300px] rounded-[3px] p-5 flex flex-row justify-center items-center gap-4">
                <MessageCircle className="w-8 h-8 shrink-0 fill-slate-200"/>
                <h1 className="text-1xl text-slate-200 text-base leading-tight wrap-break-word">Converse com amigos por chat privado ou nos comentarios (em breve)</h1>
              </div>
            
            </div>

          </div>

          {/* Listas de filmes */}
          <div className="w-full">

            <div className="w-full flex flex-col justify-center items-center mb-8">

              <div className="flex flex-row w-full border-b justify-between border-[#CC083E] mb-6">

                <h1 className="text-1xl text-slate-300">FILMES MAIS VOTADOS</h1>

                <Link href={"/movies"}>
                  <button className="cursor-pointer">
                    <h1 className="text-1xl text-slate-400 hover:text-slate-300">VER TODOS</h1>
                  </button>
                </Link>

              </div>

              {/* TODO Lógica de buscar filmes com melhors Notas ou mais Votos */}
              <div className="flex flex-row gap-4">
                <Movie posterPath={'/s0z9xkEjJ7x9V3OC7NhZmck2MSH.jpg'} size="small" title="Can I Do It Till I Need Glasses?" popularity="4087" averageRating="5.3"/>
                <Movie posterPath={'/gmjihTFH7ROwJuthIZvoLC99AtS.jpg'} size="small" title="The James Dean Story" popularity="3836" averageRating="6.5"/>
                <Movie posterPath={'/frZj5djlU9hFEjMcL21RJZVuG5O.jpg'} size="small" title="Pather Panchali" popularity="13069" averageRating="8.0"/>
                <Movie posterPath={'/vo6osRMn09BulzfMBlS2BlK9Sgq.jpg'} size="small" title="Jürgen Roland’s St. Pauli-Report" popularity="1669" averageRating="3.0"/>
                <Movie posterPath={'/ewKJEjLSZEp1Qq4Dl9W9zEld5gp.jpg'} size="small" title="Angels of the Street" popularity="928" averageRating="7.9"/>
                <Movie posterPath={'/3BFR30kh0O3NKR1Sfea3HXCG6hw.jpg'} size="small" title="Casper's Haunted Christmas" popularity="974" averageRating="5.3"/>
              </div>

            </div>

            <div className="w-full flex flex-col justify-center items-center mb-8">

              <div className="flex flex-row w-full border-b justify-between border-[#CC083E] mb-6">

                <h1 className="text-1xl text-slate-300">ADICIONADOS RECENTEMENTE</h1>

                <Link href={"/movies"}>
                  <button className="cursor-pointer">
                    <h1 className="text-1xl text-slate-400 hover:text-slate-300">VER TODOS</h1>
                  </button>
                </Link>

              </div>

              {/* TODO Lógica de procurar filmes mais recentes */}
              <div className="flex flex-row gap-4">
                <Movie posterPath={'/nkAt4a7KIPc7Fi1BhxNHhYYbe2b.jpg'} title="Lars and the Real Girl" size="small" popularity="23641" averageRating="7.1"/>
                <Movie posterPath={'/pK2FT1V3EH1hAGgQLt0upTyv1Un.jpg'} size="small" averageRating="4.3" title="Bottoms Up" popularity="3719"/>
                <Movie posterPath={'/2rBUaC6ngeFmYXjL4KA3eLjt5wA.jpg'} size="small" title="The Ten Commandments" popularity="38304" averageRating="7.7"/>
                <Movie posterPath={'/t0AEzycJ6V8dLVlSudCUAA9mzgn.jpg'} size="small" title="The Wedding Date" popularity="14423" averageRating="6.8"/>
                <Movie posterPath={'/ckdA057F1hpDIHedKG334vlRd.jpg'} size="small" title="Horse Sense" popularity="3673" averageRating="6.9"/>
                <Movie posterPath={'/gsFun8nATm52aGHeT8ueAel98nE.jpg'} size="small" title="Van Halsing" popularity="4554" averageRating="6.3"/>
              </div>

            </div>

          </div>
          
        </div>

      </div>
      
    </main>
  );
  
}
