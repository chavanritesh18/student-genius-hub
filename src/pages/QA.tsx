import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function QA() {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Use Supabase's function invocation instead of fetch
      const { data, error } = await supabase.functions.invoke('ask-question', {
        body: { question },
      });

      if (error) throw error;

      const aiResponse = data.answer;
      setAnswer(aiResponse);

      // Store the Q&A in the database
      const { error: insertError } = await supabase
        .from('questions')
        .insert({
          user_id: session.user.id,
          title: question.substring(0, 100),
          content: question,
          ai_response: aiResponse,
        });

      if (insertError) throw insertError;

    } catch (error: any) {
      console.error("Error asking question:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Type your question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleAskQuestion} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Getting Answer..." : "Ask Question"}
          </Button>
          {answer && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Answer:</h3>
              <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                {answer}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}