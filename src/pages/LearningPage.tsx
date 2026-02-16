import { Link } from "react-router-dom";
import { useState } from "react";

type Module = {
  id: string;
  title: string;
  category: string;
};

const modules: Module[] = [
  { id: "html-css-js", title: "HTML, CSS & JavaScript", category: "Frontend" },
  { id: "typescript", title: "TypeScript", category: "Frontend" },
  { id: "react", title: "React.js", category: "Frontend" },
  { id: "angular", title: "Angular", category: "Frontend" },
  { id: "java", title: "Java", category: "Backend" },
  { id: "spring-boot", title: "Spring Boot", category: "Backend" },
  { id: "nodejs", title: "Node.js", category: "Backend" },
  { id: "databases", title: "Databases", category: "Backend" },
  { id: "docker", title: "Docker", category: "DevOps" },
  { id: "aws", title: "AWS", category: "Cloud" },
];

const categories = ["All", "Frontend", "Backend", "DevOps", "Cloud"];

export default function LearningPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredModules =
    selectedCategory === "All"
      ? modules
      : modules.filter((m) => m.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Learning Modules
          </h1>
          <p className="text-gray-600 mt-2">
            Explore AI-powered learning recommendations.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition
                ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <Link
              key={module.id}
              to={`/learning/${module.id}`}
              className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
            >
              <span className="text-xs font-medium px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                {module.category}
              </span>

              <h2 className="mt-4 text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition">
                {module.title}
              </h2>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
