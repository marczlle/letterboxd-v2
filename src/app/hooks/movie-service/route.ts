export async function getMovieByPosterPath(posterPath: string) {
    try {
        // Encode o posterPath para garantir que caracteres especiais sejam tratados corretamente na URL
        const encodedPosterPath = encodeURIComponent(posterPath);

        const response = await fetch(
            `https://ekpb5msly3.execute-api.us-east-1.amazonaws.com/WEB2/movie-service/get-movie?poster_path=${encodedPosterPath}`,
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