import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

const Subjects = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("os");

  const subjectContent = {
    os: {
      title: "Operating Systems",
      topics: [
        "Process Management",
        "Memory Management",
        "File Systems",
        "CPU Scheduling",
        "Deadlocks",
        "Synchronization",
      ],
      resources: [
        { name: "Process States & Transitions", url: "#" },
        { name: "Memory Allocation Algorithms", url: "#" },
        { name: "File System Implementation", url: "#" },
      ],
    },
    dbms: {
      title: "Database Management Systems",
      topics: [
        "SQL Fundamentals",
        "Normalization",
        "Transaction Management",
        "Concurrency Control",
        "Indexing",
        "Recovery",
      ],
      resources: [
        { name: "SQL Query Optimization", url: "#" },
        { name: "ACID Properties", url: "#" },
        { name: "Database Design", url: "#" },
      ],
    },
    cn: {
      title: "Computer Networks",
      topics: [
        "OSI Model",
        "TCP/IP Protocol Suite",
        "Routing Algorithms",
        "Network Security",
        "Wireless Networks",
        "Socket Programming",
      ],
      resources: [
        { name: "Network Protocols", url: "#" },
        { name: "Routing Techniques", url: "#" },
        { name: "Security Mechanisms", url: "#" },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Core Subjects Preparation</h1>
          <p className="text-gray-600">Master the fundamental concepts of computer science</p>
        </div>

        <Tabs defaultValue="os" className="space-y-4">
          <TabsList>
            <TabsTrigger value="os">Operating Systems</TabsTrigger>
            <TabsTrigger value="dbms">DBMS</TabsTrigger>
            <TabsTrigger value="cn">Computer Networks</TabsTrigger>
          </TabsList>

          {Object.entries(subjectContent).map(([key, subject]) => (
            <TabsContent key={key} value={key}>
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">{subject.title}</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Key Topics</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {subject.topics.map((topic, index) => (
                        <li key={index} className="text-gray-700">{topic}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Learning Resources</h3>
                    <ul className="space-y-2">
                      {subject.resources.map((resource, index) => (
                        <li key={index}>
                          <a
                            href={resource.url}
                            className="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {resource.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6">
                  <Button className="mr-3">Start Learning</Button>
                  <Button variant="outline">Take Practice Test</Button>
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Subjects;