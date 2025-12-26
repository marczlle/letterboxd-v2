import pkg from 'pg';
const { Pool } = pkg;

// Configuração do banco de dados
const pool = new Pool({
    host: "web2.cdq0asomw2wb.us-east-1.rds.amazonaws.com",
    user: "postgres",
    password: "pizza123456",
    database: "postgres",
    port: 5432,
    ssl: { rejectUnauthorized: false },
});

// URL do Front-end para CORS
const FRONT_URL = 'http://localhost:3000';

export const handler = async (event) => {
    // --- CORS Preflight ---
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

    // --- Lógica Principal da Função ---
    try {
        let limit = 10; // Valor padrão
        let rawLimit = null; // Valor bruto antes do parse

        // 1. Tenta pegar do evento direto (Teste do Console Lambda)
        if (event.limit) {
            rawLimit = event.limit;
        
        // 2. Senão, tenta pegar da Query String (API Gateway GET: /url?limit=5)
        } else if (event.queryStringParameters && event.queryStringParameters.limit) {
            rawLimit = event.queryStringParameters.limit;
        
        // 3. Senão, tenta pegar do Body (API Gateway POST: {"limit": 5})
        } else if (event.body) {
            try {
                const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
                if (body && body.limit) {
                    rawLimit = body.limit;
                }
            } catch (parseError) {
                console.warn("Corpo da requisição não é um JSON válido:", parseError);
            }
        }

        // Se encontramos um rawLimit, tentamos converter
        if (rawLimit !== null) {
            const parsedLimit = parseInt(rawLimit, 10);
            if (!isNaN(parsedLimit) && parsedLimit > 0) {
                limit = parsedLimit;
            }
        }

        console.log(`Buscando ${limit} filmes aleatórios...`); // Adicionado para depuração

        // 2. Criar a consulta SQL
        const query = `
            SELECT * FROM web2.movies
            ORDER BY RANDOM()
            LIMIT $1;
        `;

        // 3. Executar a consulta
        const { rows } = await pool.query(query, [limit]);

        // 4. Retornar os filmes encontrados
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": FRONT_URL,
                "Access-Control-Allow-Credentials": "true",
            },
            body: JSON.stringify({ movies: rows }),
        };

    } catch (error) {
        // 5. Tratamento de Erro
        console.error('Erro ao buscar filmes aleatórios:', error);
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