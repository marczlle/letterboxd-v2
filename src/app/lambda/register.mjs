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

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": FRONT_URL,
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
// --- FIM DA CONFIGURAÇÃO GLOBAL ---


export const handler = async (event) => {
  // Passo 1: Responda ao 'preflight' do CORS (requisição OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  // Passo 2: Lógica de Registro
  try {
    const body = event.body
      ? (typeof event.body === 'string' ? JSON.parse(event.body) : event.body)
      : event;

    const { usuario, email, senha } = body;

    if (!usuario || !email || !senha) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS, // Adiciona CORS
        body: JSON.stringify({ error: 'Campos obrigatórios: usuario, email, senha' }),
      };
    }

    const query = `
      INSERT INTO web2.usuarios (usuario, email, senha)
      VALUES ($1, $2, $3)
      RETURNING id;
    `;
    const values = [usuario, email, senha];

    const result = await pool.query(query, values);

    return {
      statusCode: 201,
      headers: CORS_HEADERS, // Adiciona CORS
      body: JSON.stringify({
        message: 'Usuário cadastrado com sucesso!',
        id: result.rows[0].id,
      }),
    };
  } catch (err) {
    console.error('Erro:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS, // Adiciona CORS
      body: JSON.stringify({ error: 'Erro interno ao cadastrar usuário', details: err.message }),
    };
  }
};