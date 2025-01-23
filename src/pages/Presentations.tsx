import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Download, Presentation, Save, Wand2 } from "lucide-react";
import { Json } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

interface Slide {
  id: number;
  content: string;
  title: string;
  [key: string]: string | number; // Add index signature for Json compatibility
}

const Presentations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [slides, setSlides] = useState<Slide[]>([{ id: 1, content: "", title: "" }]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkUser();
  }, [navigate]);

  const handleAddSlide = () => {
    setSlides([...slides, { id: slides.length + 1, content: "", title: "" }]);
  };

  const handleSlideChange = (id: number, field: 'content' | 'title', value: string) => {
    setSlides(slides.map(slide => 
      slide.id === id ? { ...slide, [field]: value } : slide
    ));
  };

  const handleGeneratePresentation = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic first",
        variant: "destructive",
      });
      return;
    }

    try {
      setGenerating(true);
      const { data, error } = await supabase.functions.invoke('generate-presentation', {
        body: { topic },
      });

      if (error) throw error;

      setSlides(data.slides.map((slide: any, index: number) => ({
        id: index + 1,
        title: slide.title,
        content: slide.content,
      })));

      toast({
        title: "Success",
        description: "Presentation generated successfully",
      });
    } catch (error) {
      console.error("Error generating presentation:", error);
      toast({
        title: "Error",
        description: "Failed to generate presentation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("presentations")
        .insert({
          title,
          slides: slides as unknown as Json,
          user_id: session.user.id,
        });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Presentation saved successfully",
      });
    } catch (error) {
      console.error("Error saving presentation:", error);
      toast({
        title: "Error",
        description: "Failed to save presentation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <Label htmlFor="title">Presentation Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter presentation title"
              className="mt-1"
            />
          </div>

          <div className="mb-6">
            <Label htmlFor="topic">Topic for AI Generation</Label>
            <div className="flex gap-2">
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic to generate presentation content"
                className="mt-1"
              />
              <Button
                onClick={handleGeneratePresentation}
                disabled={generating}
                variant="secondary"
                className="mt-1 flex items-center gap-2"
              >
                <Wand2 className="h-4 w-4" />
                {generating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {slides.map((slide) => (
              <div key={slide.id} className="p-4 border rounded-md">
                <Label htmlFor={`slide-${slide.id}-title`}>Slide {slide.id} Title</Label>
                <Input
                  id={`slide-${slide.id}-title`}
                  value={slide.title}
                  onChange={(e) => handleSlideChange(slide.id, 'title', e.target.value)}
                  placeholder="Enter slide title..."
                  className="mt-1 mb-2"
                />
                <Label htmlFor={`slide-${slide.id}-content`}>Content</Label>
                <Textarea
                  id={`slide-${slide.id}-content`}
                  value={slide.content}
                  onChange={(e) => handleSlideChange(slide.id, 'content', e.target.value)}
                  placeholder="Enter slide content..."
                  className="mt-1"
                  rows={4}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-4">
            <Button
              onClick={handleAddSlide}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Presentation className="h-4 w-4" />
              Add Slide
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Presentations;