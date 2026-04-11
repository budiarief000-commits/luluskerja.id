import { loadEnv } from 'vite';
import { supabase } from '../../../lib/supabase';

export const POST = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Load environment explicitly to avoid Astro PUBLIC_ exclusion
    const env = loadEnv(import.meta.env.MODE, process.cwd(), '');
    let apiKey = env.API_KEY || process.env.API_KEY;
    
    if (apiKey) {
      apiKey = apiKey.replace(/['";]+/g, '').trim();
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ status: 'error', message: 'API Key tidak ditemukan di environment.' }), { status: 500 });
    }

    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ status: 'error', message: `HTTP ${response.status}: ${errText}` }), { status: response.status });
    }

    const data = await response.json();
    return new Response(JSON.stringify({ status: 'success', data }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ status: 'error', message: error.message }), { status: 500 });
  }
};
