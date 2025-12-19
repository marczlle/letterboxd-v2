export async function getMovieByPosterPath(posterPath: string) {

    try {

        // Encode o posterPath para garantir que caracteres especiais sejam tratados corretamente na URL

        const encodedPosterPath = encodeURIComponent(posterPath);


        const response = await fetch(

            `https://vkghs86aod.execute-api.us-east-1.amazonaws.com/WEB2/movie-service/get-movie?poster_path=${encodedPosterPath}`,

            {

                method: "GET",

                headers: { "Content-Type": "application/json" },

                credentials: 'include'

            }

        );


        if (!response.ok) {

            const errorData = await response.json();

            throw new Error(`Error fetching movie: ${errorData.error}`);

        }


        const data = await response.json();

        return data.movie;

    } catch (error) {

        console.error("Error during movie fetch:", error);

        throw error;

    }

}


export async function getMovieById(movieId: number) {

    try {

        const response = await fetch(

            `https://ekpb5msly3.execute-api.us-east-1.amazonaws.com/WEB2/movie-service/get-movie-by-id?id=${movieId}`,

            {

                method: "GET",

                headers: { "Content-Type": "application/json" },

                credentials: 'include'

            }

        );


        if (!response.ok) {

            const errorData = await response.json();

            throw new Error(`Error fetching movie: ${errorData.error}`);

        }


        const data = await response.json();

        return data.movie;

    } catch (error) {

        console.error("Error during movie fetch by ID:", error);

        throw error;

    }

}


export async function getRandomMovie(limit: number) {

    try {

        const response = await fetch(

            `https://vkghs86aod.execute-api.us-east-1.amazonaws.com/WEB2/movie-service/get-random-movie?limit=${limit}`,

            {

                method: "GET",

                headers: { "Content-Type": "application/json" },

            }

        );


        if (!response.ok) {

            const errorData = await response.json();

            throw new Error(`Error fetching random movies: ${errorData.error}`);

        }


        const data = await response.json();

        return data.movies; 

    } catch (error) {

        console.error("Error during random movie fetch:", error);

        throw error;

    }

}


// A URL base do seu endpoint (sem a query string)

const SEARCH_API_URL = 'https://vkghs86aod.execute-api.us-east-1.amazonaws.com/WEB2/movie-service/search-movie';


export async function searchMoviesByName(query: string) {

    // 1. Se a busca for vazia, retorna um array vazio.

    if (!query || query.trim() === '') {

        return [];

    }

    

    try {

        // 2. Monta a requisição usando POST

        const response = await fetch(

            SEARCH_API_URL, // A URL base, sem parâmetros

            {

                method: "POST", // Método alterado

                headers: { 

                    "Content-Type": "application/json" 

                },

                // 3. Envia o termo de busca no corpo (body) da requisição

                body: JSON.stringify({ 

                    query: query 

                })

            }

        );


        if (!response.ok) {

            const errorData = await response.json();

            throw new Error(`Error fetching search results: ${errorData.error}`);

        }


        const data = await response.json();

        

        // 4. Retorna o array de filmes

        return data.movies; 

        

    } catch (error) {

        console.error("Error during movie search:", error);

        throw error;

    }

}