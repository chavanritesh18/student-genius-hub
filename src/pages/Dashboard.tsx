import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">AI Study Assistant</h1>
            </div>
            <div className="flex items-center">
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Q&A Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900">Ask Questions</h2>
              <p className="mt-1 text-sm text-gray-500">
                Get instant answers to your questions using AI
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate("/qa")}
              >
                Ask a Question
              </Button>
            </div>
          </div>

          {/* Presentations Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900">Presentations</h2>
              <p className="mt-1 text-sm text-gray-500">
                Generate and manage your presentations
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate("/presentations")}
              >
                Create Presentation
              </Button>
            </div>
          </div>

          {/* Code Editor Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900">Code Editor</h2>
              <p className="mt-1 text-sm text-gray-500">
                Write and compile code in various languages
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate("/code-editor")}
              >
                Open Editor
              </Button>
            </div>
          </div>

          {/* Core Subjects Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900">Core Subjects</h2>
              <p className="mt-1 text-sm text-gray-500">
                Learn OS, DBMS, and Computer Networks
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate("/subjects")}
              >
                Start Learning
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;