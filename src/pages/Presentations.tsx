import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Download, Presentation, Save } from "lucide-react";

interface Slide {
  id: number;
  content: string;
}

const Presentations = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [slides, setSlides] = useState<Slide[]>([{ id: 1, content: "" }]);
  const [loading, setLoading] = useState(false);

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
    setSlides([...slides, { id: slides.length + 1, content: "" }]);
  };

  const handleSlideChange = (id: number, content: string) => {
    setSlides(slides.map(slide => 
      slide.id === id ? { ...slide, content } : slide
    ));
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
          slides,
          user_id: session.user.id,
        });

      if (error) throw error;
      
      console.log("Presentation saved successfully");
    } catch (error) {
      console.error("Error saving presentation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    // For now, we'll just log the action
    // In a future implementation, we'll integrate with a PDF generation service
    console.log("Exporting to PDF...");
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

          <div className="space-y-6">
            {slides.map((slide) => (
              <div key={slide.id} className="p-4 border rounded-md">
                <Label htmlFor={`slide-${slide.id}`}>Slide {slide.id}</Label>
                <Textarea
                  id={`slide-${slide.id}`}
                  value={slide.content}
                  onChange={(e) => handleSlideChange(slide.id, e.target.value)}
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
            <Button
              onClick={handleExportPDF}
              disabled={loading}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Presentations;