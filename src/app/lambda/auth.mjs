import jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET || 'web2';

// 1. Defina a URL do seu front-end
const FRONT_URL = 'http://localhost:3000'; 

// 2. Crie um objeto de headers reutilizável para facilitar
const corsHeaders = {
  "Access-Control-Allow-Origin": FRONT_URL,
  "Access-Control-Allow-Credentials": "true"
};

export const handler = async (event) => {
  // 3. Adicione o tratamento para a requisição OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": FRONT_URL,
        "Access-Control-Allow-Headers": "Content-Type, Authorization", // Headers que você permite
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // Métodos que você permite
        "Access-Control-Allow-Credentials": "true",
      },
      body: '',
    };
  }

  // --- Sua lógica original, agora com os headers ---
  
  const cookieHeader = event.headers?.Cookie || event.headers?.cookie;
  if (!cookieHeader) {
    return { 
      statusCode: 401, 
      headers: corsHeaders, // <-- ADICIONADO
      body: JSON.stringify({ error: "Token ausente." }) 
    };
  }

  const match = cookieHeader.match(/token=([^;]+)/);
  if (!match) {
    return { 
      statusCode: 401, 
      headers: corsHeaders, // <-- ADICIONADO
      body: JSON.stringify({ error: "Token ausente." }) 
    };
  }

  const token = match[1];

  try {
    const payload = jwt.verify(token, SECRET);
    // token válido 
    return { 
      statusCode: 200, 
      headers: corsHeaders, // <-- ADICIONADO
      body: JSON.stringify({ ok: true, user: payload }) 
    };
  } catch (err) {
    return { 
      statusCode: 401, 
      headers: corsHeaders, // <-- ADICIONADO
      body: JSON.stringify({ error: "Token inválido ou expirado." }) 
    };
  }
};