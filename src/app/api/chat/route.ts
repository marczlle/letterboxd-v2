// Caminho do arquivo: src/app/api/chat/route.ts

import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

function getOpenAIClient() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return null;

    return new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey,
    });
}

// system prompt
const systemPrompt = "Você é o 'CinéZinho', um assistente amigável da 'Letterbox' e é extremamente apaixonado por cinema. Seu único objetivo é conversar sobre filmes, recomendar títulos, discutir gêneros, atores e diretores. Não precisa ser exagerado e performático, nem sério demais. Mantenha um tom casual e acessível, como um amigo que adora cinema. Evite falar sobre outros tópicos que não sejam filmes. Seja breve e direto em suas respostas, focando na experiência cinematográfica do usuário. Há alguns usuários que são mais técnicos, assim, adapte seu vocabulário conforme o nível de conhecimento do usuário. Sempre que possível, recomende filmes baseados nas preferências expressas pelo usuário.";

export async function POST(req: Request) {
    try {
        const openai = getOpenAIClient();
        if (!openai) {
            return NextResponse.json(
                { error: "OPENROUTER_API_KEY não configurada no servidor" },
                { status: 500 }
            );
        }

        const { messages } = await req.json();

        if (!messages) {
            return NextResponse.json({ error: "Nenhuma mensagem enviada" }, { status: 400 });
        }

        const messagesWithSystemPrompt = [
            {
                role: "system",
                content: systemPrompt
            },
            ...messages // histórico que veio do frontend
        ];

        // chamada para o OpenRouter
        const completion = await openai.chat.completions.create({
            model: "mistralai/mistral-7b-instruct:free",
            messages: messagesWithSystemPrompt,
        });

        // pega a resposta do bot
        const botResponse = completion.choices[0].message;

        // retorna a resposta para o frontend
        return NextResponse.json({ response: botResponse });

    } catch (error) {
        console.error("Erro na API /api/chat:", error);
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
    }
}