import pkg from 'pg';

import jwt from 'jsonwebtoken';

const { Pool } = pkg;


const pool = new Pool({

  host: "web2.cdq0asomw2wb.us-east-1.rds.amazonaws.com",

  user: "postgres",

  password: "pizza123456",

  database: "postgres",

  port: 5432,

  ssl: { rejectUnauthorized: false },

});


const SECRET = 'web2';

// CORREÇÃO 1: Adiciona a barra no final para bater com o browser

const FRONT_URL = 'http://localhost:3000';


export const handler = async (event) => {

  // CORREÇÃO 2: Trata requisição OPTIONS (CORS preflight)

  if (event.httpMethod === 'OPTIONS') {

    return {

      statusCode: 200,

      headers: {

        "Access-Control-Allow-Origin": FRONT_URL,

        "Access-Control-Allow-Headers": "Content-Type, Authorization",

        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",

        "Access-Control-Allow-Credentials": "true",

      },

      body: '',

    };

  }


  // Agora, a lógica de POST (login) só roda se NÃO for OPTIONS

  try {

    const body = event.body

      ? (typeof event.body === 'string' ? JSON.parse(event.body) : event.body)

      : event;


    const { usuario, senha } = body;


    if (!usuario || !senha) {

      return {

        statusCode: 400,

        headers: {

          "Access-Control-Allow-Origin": FRONT_URL,

          "Access-Control-Allow-Credentials": "true",

        },

        body: JSON.stringify({ error: 'Usuário e senha são obrigatórios.' }),

      };

    }


    const query = `

      SELECT * FROM web2.usuarios

      WHERE senha = $1

        AND (usuario = $2 OR email = $2)

      LIMIT 1;

    `;

    const { rows } = await pool.query(query, [senha, usuario]);


    if (rows.length === 0) {

      return {

        statusCode: 401,

        headers: {

          "Access-Control-Allow-Origin": FRONT_URL,

          "Access-Control-Allow-Credentials": "true",

        },

        body: JSON.stringify({ error: 'Usuário ou senha incorretos.' }),

      };

    }


    const user = rows[0];

    const token = jwt.sign(

      {

        id: user.id,

        usuario: user.usuario,

        email: user.email,

      },

      SECRET,

      { expiresIn: '2h' }

    );


    return {

      statusCode: 200,

      headers: {

        "Access-Control-Allow-Origin": FRONT_URL,

        "Access-Control-Allow-Credentials": "true",

        "Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=7200; SameSite=None; Secure`,

      },

      body: JSON.stringify({ message: "Login bem-sucedido!" }),

    };

  } catch (error) {

    console.error('Erro ao fazer login:', error);

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