import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { topic } = await req.json()
    const openAiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openAiKey) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    console.log('Generating presentation for topic:', topic)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a presentation generator. Generate a presentation with 5 slides. For each slide, provide a title and content. Return the response in this exact JSON format: [{"title": "Slide Title", "content": "Slide Content"}, ...]'
          },
          {
            role: 'user',
            content: `Generate a presentation about: ${topic}`
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${errorData}`)
    }

    const data = await response.json()
    console.log('OpenAI response:', JSON.stringify(data))

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected OpenAI response format:', data)
      throw new Error('Invalid response format from OpenAI')
    }

    let slides
    try {
      slides = JSON.parse(data.choices[0].message.content)
      
      if (!Array.isArray(slides)) {
        throw new Error('Generated content is not an array')
      }

      // Validate slide format
      slides.forEach((slide, index) => {
        if (!slide.title || !slide.content) {
          throw new Error(`Invalid slide format at index ${index}`)
        }
      })
    } catch (error) {
      console.error('Error parsing slides:', error)
      console.error('Raw content:', data.choices[0].message.content)
      throw new Error('Failed to parse generated content')
    }

    console.log('Successfully generated slides:', JSON.stringify(slides))

    return new Response(JSON.stringify({ slides }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in generate-presentation function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})