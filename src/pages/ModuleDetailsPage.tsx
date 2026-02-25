import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

type Resource = {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
};

const resourceTypeColors: Record<string, string> = {
  video: "bg-red-100 text-red-600",
  article: "bg-blue-100 text-blue-600",
  documentation: "bg-emerald-100 text-emerald-600",
  repository: "bg-gray-200 text-gray-700",
};

const dockerTopics: Record<string, string> = {
  "Docker Official Documentation": "Core Docker",
  "Docker Compose Guide": "Docker Compose",
  "GitHub Actions Documentation": "CI/CD",
  "GitLab CI/CD Documentation": "CI/CD",
  "Running Docker in Production": "Production",
};

export default function ModuleDetailsPage() {
  const { moduleId } = useParams();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetch(`http://13.39.80.27:8080/api/modules/${moduleId}/recommendations`)
      .then((res) => res.json())
      .then((data) => {
        setResources(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [moduleId]);


  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchSearch = r.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchType =
        typeFilter === "all" || r.type === typeFilter;

      return matchSearch && matchType;
    });
  }, [resources, search, typeFilter]);

  const types = ["all", "video", "article", "documentation", "repository"];


  const groupedResources = useMemo(() => {
    return filteredResources.reduce((acc, resource) => {
      let topic = "Resources";

      if (moduleId === "docker") {
        topic = dockerTopics[resource.title] || "Other";
      }

      if (!acc[topic]) {
        acc[topic] = [];
      }

      acc[topic].push(resource);
      return acc;
    }, {} as Record<string, Resource[]>);
  }, [filteredResources, moduleId]);

  /* ===============================
     🖥 Render
  ================================= */

  return (
    <div className="p-10 space-y-10 max-w-7xl mx-auto
    bg-gray-50 dark:bg-gray-900
    min-h-screen transition-colors duration-300">

      {/* Back */}
      <Link
        to="/learning"
        className="text-sm text-blue-500 hover:underline"
      >
        ← Back to modules
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold capitalize text-gray-900 dark:text-white">
          {moduleId} Resources
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Personalized recommendations powered by AI.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search resources..."
          className="flex-1 px-4 py-3 rounded-2xl
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        text-gray-900 dark:text-white
        focus:ring-2 focus:ring-blue-500 outline-none transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-3 rounded-2xl
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        text-gray-900 dark:text-white
        focus:ring-2 focus:ring-blue-500 outline-none"
        >
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-gray-500 dark:text-gray-400">
          Loading resources...
        </div>
      )}

      {!loading && filteredResources.length === 0 && (
        <div className="bg-gray-100 dark:bg-gray-800 
        rounded-2xl p-8 text-center text-gray-500 dark:text-gray-400">
          No matching resources found.
        </div>
      )}

      {/* Sections */}
      <div className="space-y-12">
        {Object.entries(groupedResources).map(([topic, topicResources]) => (
          <div key={topic} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {topic}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topicResources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-2xl p-6
                bg-white dark:bg-gray-800
                border border-gray-100 dark:border-gray-700
                shadow-sm hover:shadow-xl
                hover:-translate-y-1 transition-all duration-300"
                >
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${resourceTypeColors[resource.type] ||
                      "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {resource.type}
                  </span>

                  <h3 className="mt-4 font-semibold 
                  text-gray-800 dark:text-white 
                  group-hover:text-blue-500 transition">
                    {resource.title}
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-3">
                    {resource.description}
                  </p>

                  <span className="text-sm text-blue-500 mt-4 inline-block">
                    Open resource →
                  </span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}