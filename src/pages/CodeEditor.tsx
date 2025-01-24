import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Code, Play, Save, Wand } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Editor from "@monaco-editor/react";

const CodeEditor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [compiling, setCompiling] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("code_snippets")
        .insert({
          title,
          code,
          language,
          user_id: session.user.id,
        });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Code saved successfully",
      });
    } catch (error) {
      console.error("Error saving code:", error);
      toast({
        title: "Error",
        description: "Failed to save code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    try {
      setCompiling(true);
      const { data, error } = await supabase.functions.invoke('compile-code', {
        body: { code, language },
      });

      if (error) throw error;

      if (data.stdout) {
        setOutput(data.stdout);
      } else if (data.stderr) {
        setOutput(`Error: ${data.stderr}`);
      } else if (data.compile_output) {
        setOutput(`Compilation Error: ${data.compile_output}`);
      }
    } catch (error) {
      console.error("Error compiling code:", error);
      setOutput("Error executing code");
      toast({
        title: "Error",
        description: "Failed to compile code",
        variant: "destructive",
      });
    } finally {
      setCompiling(false);
    }
  };

  const handleGenerate = async () => {
    if (!description) {
      toast({
        title: "Error",
        description: "Please enter a description of the code you want to generate",
        variant: "destructive",
      });
      return;
    }

    try {
      setGenerating(true);
      const { data, error } = await supabase.functions.invoke('generate-code', {
        body: { description, language },
      });

      if (error) throw error;

      setCode(data.code);
      toast({
        title: "Success",
        description: "Code generated successfully",
      });
    } catch (error) {
      console.error("Error generating code:", error);
      toast({
        title: "Error",
        description: "Failed to generate code",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter code snippet title"
              className="mt-1"
            />
          </div>

          <div className="mb-6">
            <Label htmlFor="description">Description (for AI generation)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the code you want to generate..."
              className="mt-1"
            />
          </div>

          <div className="mb-6">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
            </select>
          </div>

          <div className="mb-6">
            <Label htmlFor="code">Code</Label>
            <div className="mt-1 border rounded-md overflow-hidden">
              <Editor
                height="400px"
                defaultLanguage={language}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button
              onClick={handleRun}
              disabled={compiling}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {compiling ? 'Compiling...' : 'Run'}
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Wand className="h-4 w-4" />
              {generating ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>

          {output && (
            <div className="mt-6">
              <Label>Output</Label>
              <pre className="mt-1 p-4 bg-gray-100 rounded-md overflow-x-auto">
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;