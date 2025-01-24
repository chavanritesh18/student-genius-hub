import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function pollSubmission(token: string, rapidApiKey: string, maxAttempts = 10): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=false`, {
      headers: {
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        'X-RapidAPI-Key': rapidApiKey,
      },
    });

    const result = await response.json();
    console.log(`Polling attempt ${i + 1}, status:`, result.status?.id);

    // If we have a final status, return the result
    if (result.status?.id > 2) {
      return result;
    }

    // Wait 1 second before next attempt
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error('Compilation timed out');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { code, language } = await req.json()
    const rapidApiKey = Deno.env.get('RAPID_API_KEY') || '';
    console.log('Compiling code:', { language })
    
    const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        'X-RapidAPI-Key': rapidApiKey,
      },
      body: JSON.stringify({
        source_code: code,
        language_id: getLanguageId(language),
        stdin: ''
      }),
    });

    const submissionData = await response.json();
    console.log('Submission created:', submissionData)
    
    if (!submissionData.token) {
      throw new Error('Failed to create submission');
    }

    const result = await pollSubmission(submissionData.token, rapidApiKey);
    console.log('Final compilation result:', result)
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in compile-code function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getLanguageId(language: string): number {
  const languageMap: Record<string, number> = {
    'python': 71,
    'javascript': 63,
    'java': 62,
    'cpp': 54,
    'c': 50,
  };
  return languageMap[language] || 71;
}