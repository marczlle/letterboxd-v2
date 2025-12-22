import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
  host: "web2.cdq0asomw2wb.us-east-1.rds.amazonaws.com",
  user: "postgres",
  password: "pizza123456",
  database: "postgres",
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

const FRONT_URL = 'http://localhost:3000';

export const handler = async (event) => {

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": FRONT_URL,
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Credentials": "true",
      },
      body: '',
    };
  }

  try {
    // parse do body
    const body = event.body
      ? (typeof event.body === 'string' ? JSON.parse(event.body) : event.body)
      : {};

    const movieId = body.movie_id;

    if (!movieId) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": FRONT_URL,
          "Access-Control-Allow-Credentials": "true",
        },
        body: JSON.stringify({ error: "movie_id é obrigatório" }),
      };
    }

    const query = `
      SELECT 
        u.usuario AS reviewerName,
        r.texto_review AS reviewText,
        r.nota AS stars
      FROM web2.avaliacoes r
      JOIN web2.usuarios u ON u.id = r.usuario_id
      WHERE r.movie_id = $1
      ORDER BY r.criado_em DESC;
    `;

    const { rows } = await pool.query(query, [movieId]);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": FRONT_URL,
        "Access-Control-Allow-Credentials": "true",
      },
      body: JSON.stringify(rows),
    };

  } catch (error) {
    console.error("Erro ao buscar reviews:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": FRONT_URL,
        "Access-Control-Allow-Credentials": "true",
      },
      body: JSON.stringify({ error: "Erro interno do servidor" }),
    };
  }
};