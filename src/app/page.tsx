import Image from "next/image";
import Header from './components/Header';
import Movie from './components/Movie';
import Link from "next/link";
import Review from "@/app/components/Review";
import { Heart, Star, Search, Info, User, MessageCircle } from "lucide-react";

export default function Home() {


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

        {/* Futuro componente de filmes */}
        {/* TODO */}
        <div className="flex flex-row justify-center items-center gap-8 mt-18">
          <Movie posterPath={'/5uqz8MbGts35uO7ESz86kviVgFO.jpg'}/>
          <Movie posterPath={'/gmjihTFH7ROwJuthIZvoLC99AtS.jpg'}/>
          <Movie posterPath={'/lyQBXzOQSuE59IsHyhrp0qIiPAz.jpg'}/>
          <Movie posterPath={'/gzPVbOSvGuS0KWBA8wf4omeFF4i.jpg'}/>
        </div>

        {/* Content Wraper */}
        <div className="mt-32 mx-115 flex flex-col justify-center items-center gap-4 mb-18">

          {/* Funções do site */}
          <div className="flex flex-col gap-4 mb-8">

            <div className="flex flex-row gap-4">
              <div className="bg-slate-700 max-w-[300px] rounded-[3px] p-5 flex flex-row justify-center items-center gap-4">
                <Heart className="w-8 h-8 shrink-0 fill-slate-200"/>
                <h1 className="text-1xl text-slate-200 text-base leading-tight wrap-break-word">Mostre seus filmes mais curtidos com um "Gostei"</h1>
              </div>
              <div className="bg-slate-700 max-w-[300px] rounded-[3px] p-5 flex flex-row justify-center items-center gap-4">
                <Star className="w-8 h-8 shrink-0 fill-slate-200"/>
                <h1 className="text-1xl text-slate-200 text-base leading-tight wrap-break-word">Avalie seu ultimo filme assistido de 0 a 5 estrelas</h1>
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

                {/* TODO */}
                <Link href={"/movies"}>
                  <button className="cursor-pointer">
                    <h1 className="text-1xl text-slate-400 hover:text-slate-300">VER TODOS</h1>
                  </button>
                </Link>

              </div>

              {/* TODO */}
              <div className="flex flex-row gap-4">
                <Movie posterPath={'/s0z9xkEjJ7x9V3OC7NhZmck2MSH.jpg'} size="small"/>
                <Movie posterPath={'/gmjihTFH7ROwJuthIZvoLC99AtS.jpg'} size="small"/>
                <Movie posterPath={'/frZj5djlU9hFEjMcL21RJZVuG5O.jpg'} size="small"/>
                <Movie posterPath={'/vo6osRMn09BulzfMBlS2BlK9Sgq.jpg'} size="small"/>
                <Movie posterPath={'/ewKJEjLSZEp1Qq4Dl9W9zEld5gp.jpg'} size="small"/>
                <Movie posterPath={'/3BFR30kh0O3NKR1Sfea3HXCG6hw.jpg'} size="small"/>
              </div>

            </div>

            <div className="w-full flex flex-col justify-center items-center mb-8">

              <div className="flex flex-row w-full border-b justify-between border-[#CC083E] mb-6">

                <h1 className="text-1xl text-slate-300">ADICIONADOS RECENTEMENTE</h1>

                {/* TODO */}
                <Link href={"/movies"}>
                  <button className="cursor-pointer">
                    <h1 className="text-1xl text-slate-400 hover:text-slate-300">VER TODOS</h1>
                  </button>
                </Link>

              </div>

              {/* TODO */}
              <div className="flex flex-row gap-4">
                <Movie posterPath={'/nkAt4a7KIPc7Fi1BhxNHhYYbe2b.jpg'} size="small"/>
                <Movie posterPath={'/pK2FT1V3EH1hAGgQLt0upTyv1Un.jpg'} size="small"/>
                <Movie posterPath={'/2rBUaC6ngeFmYXjL4KA3eLjt5wA.jpg'} size="small"/>
                <Movie posterPath={'/t0AEzycJ6V8dLVlSudCUAA9mzgn.jpg'} size="small"/>
                <Movie posterPath={'/ckdA057F1hpDIHedKG334vlRd.jpg'} size="small"/>
                <Movie posterPath={'/gsFun8nATm52aGHeT8ueAel98nE.jpg'} size="small"/>
              </div>

            </div>

          </div>

          {/* Avaliações e usuarios populares */}
          <div className="flex flex-row mt-8 gap-24 w-full justify-between items-start">

            <div className="w-[60%]">

              <h1 className="text-1xl text-slate-300 border-b border-[#CC083E]">AVALIAÇÕES POPULARES ESSA SEMANA</h1>
              
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

            {/* TODO
              <div className="w-[40%]">

                <h1 className="text-1xl text-slate-300 border-b border-[#CC083E]">USUARIOS POPULARES</h1>

                <div className="flex flex-col">
                  <h1 className="text-4xl mt-4">USUARIO</h1>
                  <h1 className="text-4xl mt-4">USUARIO</h1>
                  <h1 className="text-4xl mt-4">USUARIO</h1>
                </div>

              </div>
            */}

          </div>  
          
        </div>

      </div>
      
    </main>
  );
  
}
