import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic } = await req.json();
    
    console.log('Generating presentation for topic:', topic);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate a presentation with 5 slides about: ${topic}. Return the response in this exact JSON format: [{"title": "Slide Title", "content": "Slide Content"}, ...]. Make sure each slide has a clear title and detailed content.`,
          }],
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${errorData}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', data);

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    let slides;
    try {
      const generatedText = data.candidates[0].content.parts[0].text;
      // Extract JSON array from the response text
      const jsonMatch = generatedText.match(/\[.*\]/s);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      slides = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(slides)) {
        throw new Error('Generated content is not an array');
      }

      // Validate slide format
      slides.forEach((slide, index) => {
        if (!slide.title || !slide.content) {
          throw new Error(`Invalid slide format at index ${index}`);
        }
      });
    } catch (error) {
      console.error('Error parsing slides:', error);
      console.error('Raw content:', data.candidates[0].content.parts[0].text);
      throw new Error('Failed to parse generated content');
    }

    console.log('Successfully generated slides:', JSON.stringify(slides));

    return new Response(JSON.stringify({ slides }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in generate-presentation function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});