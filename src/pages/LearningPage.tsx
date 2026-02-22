import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/api/axios";

type Module = {
  id: string;
  title: string;
  description: string;
  category: string;
};

export default function LearningPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Module[]>("/modules")
      .then((res) => {
        setModules(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load modules");
        setLoading(false);
      });
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(modules.map((m) => m.category))),
  ];

  const filteredModules =
    selectedCategory === "All"
      ? modules
      : modules.filter((m) => m.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Learning Modules
          </h1>
          <p className="text-gray-600 mt-2">
            AI-powered learning paths based on your modules.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" />
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex gap-3 mb-8 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-white border text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredModules.map((module) => (
                <Link
                  key={module.id}
                  to={`/learning/${module.id}`}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition"
                >
                  <span className="text-xs px-3 py-1 bg-blue-100 text-blue-600 rounded-full capitalize">
                    {module.category}
                  </span>

                  <h2 className="mt-4 text-lg font-semibold text-gray-800">
                    {module.title}
                  </h2>

                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                    {module.description}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
