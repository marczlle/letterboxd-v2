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
// (Removi a barra final "/" para maior compatibilidade)
const FRONT_URL = 'http://localhost:3000';

export const handler = async (event) => {
    // --- CORS Preflight ---
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": FRONT_URL,
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                // AVISO: Adicionado "POST" aos métodos permitidos
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS", 
                "Access-Control-Allow-Credentials": "true" 
            },
            body: '',
        };
    }

    // --- Headers de Resposta Padrão ---
    // (É bom definir isso fora do try/catch para garantir que
    //  respostas de erro também tenham os headers corretos)
    const responseHeaders = {
        "Access-Control-Allow-Origin": FRONT_URL,
        "Access-Control-Allow-Credentials": "true"
    };

    // --- Lógica Principal da Função ---
    try {
        // --- INÍCIO DA MODIFICAÇÃO ---
        
        let searchTerm;

        // 1. Tenta pegar o termo da URL (ex: /search?query=avatar)
        if (event.queryStringParameters && event.queryStringParameters.query) {
            searchTerm = event.queryStringParameters.query;
        }

        // 2. Se não achou na URL e existe um 'body', tenta pegar do 'body'
        //    (ex: POST /search com body: {"query": "avatar"})
        if (!searchTerm && event.body) {
            try {
                // O body vem como uma string, precisamos converter para JSON
                const body = JSON.parse(event.body);
                if (body && body.query) {
                    searchTerm = body.query;
                }
            } catch (e) {
                // Ignora o erro se o body não for um JSON válido
                console.warn("Corpo da requisição não é um JSON válido ou está vazio:", e.message);
            }
        }
        
        // --- FIM DA MODIFICAÇÃO ---


        // 3. Se nenhum termo foi encontrado (nem na URL, nem no body), retorna lista vazia
        if (!searchTerm || searchTerm.trim() === '') {
            return {
                statusCode: 200,
                headers: responseHeaders,
                body: JSON.stringify({ movies: [] }), // Retorna array vazio
            };
        }

        console.log(`Buscando filmes por termo: "${searchTerm}"`);

        // 4. Criar a consulta SQL
        const query = `
            SELECT * FROM web2.movies
            WHERE 
                (LOWER(adult) = 'false' OR adult IS NULL)
                AND title ILIKE $1
            ORDER BY popularity DESC
            LIMIT 10;
        `;

        // 5. Executar a consulta
        const { rows } = await pool.query(query, [`%${searchTerm}%`]);

        // 6. Retornar os filmes encontrados
        return {
            statusCode: 200,
            headers: responseHeaders,
            body: JSON.stringify({ movies: rows }),
        };

    } catch (error) {
        // 7. Tratamento de Erro
        console.error('Erro ao buscar filmes por nome:', error);
        return {
            statusCode: 500,
            headers: responseHeaders,
            body: JSON.stringify({ error: 'Erro interno do servidor.' }),
        };
    }
};