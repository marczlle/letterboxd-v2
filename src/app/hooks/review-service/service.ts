export async function getReviewsByMovieId(movieId: string) {

    const res = await fetch(`https://vkghs86aod.execute-api.us-east-1.amazonaws.com/WEB2/review-service`, {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ movie_id: movieId }),

    });

  

    if (!res.ok) {

      throw new Error(`Error fetching reviews: ${await res.text()}`);

    }

  

    return res.json();

}


type SubmitReviewUser = {

    id: string | number;

    usuario: string;

} & Record<string, unknown>;


export async function submitReview(movieId: string, reviewText: string, stars: number, user: SubmitReviewUser) {

    const res = await fetch(`https://vkghs86aod.execute-api.us-east-1.amazonaws.com/WEB2/review-service/submit-review`, {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ 

          movie_id: movieId, 

          review_text: reviewText, 

          stars: stars,

          user_id: user.id,        // Pega do objeto que veio do Header

          reviewer_name: user.usuario 

      }),

    });

  

    if (!res.ok) {

      throw new Error(`Erro ao enviar: ${await res.text()}`);

    }

  

    return res.json();

}