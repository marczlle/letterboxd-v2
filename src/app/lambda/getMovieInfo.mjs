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
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": FRONT_URL,
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Credentials": "true",
            },
            body: '',
        };
    }

    try {
        let posterPath;

        if (event.queryStringParameters && event.queryStringParameters.poster_path) {
            posterPath = event.queryStringParameters.poster_path;
        } else if (event.body) {
            const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
            posterPath = body.poster_path;
        }

        if (!posterPath) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": FRONT_URL,
                    "Access-Control-Allow-Credentials": "true",
                },
                body: JSON.stringify({ error: 'poster_path é obrigatório.' }),
            };
        }

        const query = `SELECT * FROM web2.movies WHERE poster_path = $1 LIMIT 1;`;
        const { rows } = await pool.query(query, [posterPath]);

        if (rows.length === 0) {
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": FRONT_URL,
                    "Access-Control-Allow-Credentials": "true",
                },
                body: JSON.stringify({ error: 'Filme não encontrado.' }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": FRONT_URL,
                "Access-Control-Allow-Credentials": "true",
            },
            body: JSON.stringify({ movie: rows[0] }),
        };
    } catch (error) {
        console.error('Erro ao buscar filme:', error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": FRONT_URL,
                "Access-Control-Allow-Credentials": "true",
            },
            body: JSON.stringify({ error: 'Erro interno do servidor.' }),
        };
    }
};