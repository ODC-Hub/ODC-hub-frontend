import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

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
  const { moduleId } = useParams();

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`http://localhost:8080/api/modules/${moduleId}/recommendations`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch recommendations");
        return res.json();
      })
      .then((data) => {
        setResources(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [moduleId]);

  const filteredResources = resources
    .filter((r) =>
      r.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter((r) =>
      typeFilter === "All" ? true : r.type === typeFilter
    );

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-6xl mx-auto">

        {/* Back */}
        <Link
          to="/learning"
          className="text-sm text-blue-600 hover:underline mb-6 inline-block"
        >
          ← Back to modules
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 capitalize">
            {moduleId?.replace("-", " ")} Resources
          </h1>
          <p className="text-gray-600 mt-2">
            AI-ranked learning materials tailored for this module.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {filteredResources.length} resources found
          </p>
        </div>

        {/* Filters */}
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
            <option>video</option>
            <option>article</option>
            <option>documentation</option>
            <option>book</option>
            <option>course</option>
            <option>repository</option>
            <option>practice</option>
            <option>tool</option>
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredResources.length === 0 && (
          <div className="bg-gray-100 p-6 rounded-xl text-center text-gray-600">
            No matching resources found.
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredResources.map((resource) => (
            <a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group"
            >
              <div className="flex justify-between items-center mb-3">
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    typeColors[resource.type] ||
                    "bg-gray-100 text-gray-600"
                  }`}
                >
                  {resource.type}
                </span>
              </div>

              <h2 className="font-semibold text-gray-800 group-hover:text-blue-600 transition">
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
      </div>
    </div>
  );
}
