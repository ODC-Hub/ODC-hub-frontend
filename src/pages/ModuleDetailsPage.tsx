/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/api/axios";

type Module = {
  id: string;
  title: string;
  description: string;
  category: string;
};

type Resource = {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  category: string;
};

const typeColors: Record<string, string> = {
  video: "bg-red-100 text-red-600",
  article: "bg-yellow-100 text-yellow-700",
  documentation: "bg-blue-100 text-blue-600",
  book: "bg-purple-100 text-purple-600",
  course: "bg-green-100 text-green-600",
  repository: "bg-indigo-100 text-indigo-600",
  practice: "bg-pink-100 text-pink-600",
  tool: "bg-gray-200 text-gray-700",
};

export default function ModuleDetailsPage() {
  const { moduleId } = useParams<{ moduleId: string }>();

  const [module, setModule] = useState<Module | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [moduleRes, resourcesRes] = await Promise.all([
          api.get(`/modules/${moduleId}`),
          api.get(`/modules/${moduleId}/recommendations`)
        ]);

        setModule(moduleRes.data);
        setResources(resourcesRes.data);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err: any) {
        setError("Failed to load module data");
      } finally {
        setLoading(false);
      }
    }

    if (moduleId) {
      loadData();
    }
  }, [moduleId]);

  const filteredResources = resources
    .filter(r =>
      r.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter(r =>
      typeFilter === "All" ? true : r.type === typeFilter
    );

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-6xl mx-auto">

        <Link
          to="/learning"
          className="text-sm text-blue-600 hover:underline mb-6 inline-block"
        >
          ← Back to modules
        </Link>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-xl">
            {error}
          </div>
        )}

        {!loading && !error && module && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">
                {module.title}
              </h1>
              <p className="text-gray-600 mt-2">
                {module.description}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {filteredResources.length} recommended resources
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <input
                type="text"
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none"
              >
                <option>All</option>
                {Object.keys(typeColors).map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>

            {filteredResources.length === 0 && (
              <div className="bg-gray-100 p-6 rounded-xl text-center text-gray-600">
                No matching resources found.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredResources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition"
                >
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                      typeColors[resource.type] ||
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {resource.type}
                  </span>

                  <h2 className="mt-3 font-semibold text-gray-800">
                    {resource.title}
                  </h2>

                  <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                    {resource.description}
                  </p>

                  <span className="text-blue-500 text-sm mt-4 inline-block">
                    Visit Resource →
                  </span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
