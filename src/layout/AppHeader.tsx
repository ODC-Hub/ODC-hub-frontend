import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";
import { projectApi } from "../api/filrouge";
import { resourceApi } from "../api/resources";
import { getMyQuizzes, getAvailableQuizzes } from "../api/quizApi";
import { useAuth } from "../context/AuthContext";
import {
  FolderOpenDot,
  FileText,
  BookOpen,
  Edit3,
  Link as LinkIcon,
  Search as SearchIcon,
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  path: string;
  icon: React.ReactNode;
}

const LEARNING_MODULES = [
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

function CategoryIcon({ category }: { category: string }) {
  const icons: Record<string, JSX.Element> = {
    Project: <FolderOpenDot className="w-5 h-5" />,
    Resource: <FileText className="w-5 h-5" />,
    Module: <BookOpen className="w-5 h-5" />,
    Quiz: <Edit3 className="w-5 h-5" />,
  };
  return <span className="text-lg">{icons[category] ?? <SearchIcon className="w-5 h-5" />}</span>;
}

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setShowDropdown(true);
      }
      if (event.key === "Escape") {
        setShowDropdown(false);
        setQuery("");
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setSearching(true);
      setShowDropdown(true);

      const lower = q.toLowerCase();
      const found: SearchResult[] = [];

      try {
        const [projectsResult, resourcesResult, quizzesResult] = await Promise.allSettled([
          projectApi.getAllProjects(),
          resourceApi.getAllResources(true),
          user?.role === "FORMATEUR" ? getMyQuizzes() : getAvailableQuizzes(),
        ]);

        if (projectsResult.status === "fulfilled") {
          projectsResult.value
            .filter((p) => p.name.toLowerCase().includes(lower))
            .slice(0, 3)
            .forEach((p) =>
              found.push({
                id: p.id,
                title: p.name,
                subtitle: p.description ?? "Fil Rouge Project",
                category: "Project",
                path: `/projects/${p.id}`,
                icon: <FolderOpenDot className="w-5 h-5" />,
              })
            );
        }

        if (resourcesResult.status === "fulfilled") {
          resourcesResult.value
            .filter(
              (r) =>
                r.title.toLowerCase().includes(lower) ||
                r.description?.toLowerCase().includes(lower)
            )
            .slice(0, 3)
            .forEach((r) =>
              found.push({
                id: r.id,
                title: r.title,
                subtitle: `${r.type} · ${r.moduleId}`,
                category: "Resource",
                path: "/resources",
                icon:
                  r.type === "PDF" ? (
                    <FileText className="w-5 h-5" />
                  ) : r.type === "HOMEWORK" ? (
                    <Edit3 className="w-5 h-5" />
                  ) : (
                    <LinkIcon className="w-5 h-5" />
                  ),
              })
            );
        }

        // Modules (static)
        LEARNING_MODULES.filter((m) => m.title.toLowerCase().includes(lower))
          .slice(0, 3)
          .forEach((m) =>
            found.push({
              id: m.id,
              title: m.title,
              subtitle: `Learning Module · ${m.category}`,
              category: "Module",
              path: `/learning/${m.id}`,
              icon: <BookOpen className="w-5 h-5" />,
            })
          );

        if (quizzesResult.status === "fulfilled") {
          (quizzesResult.value as { id: string; title: string; module: string }[])
            .filter((q) => q.title.toLowerCase().includes(lower))
            .slice(0, 3)
            .forEach((q) =>
              found.push({
                id: q.id,
                title: q.title,
                subtitle: `Quiz · ${q.module}`,
                category: "Quiz",
                path:
                  user?.role === "FORMATEUR"
                    ? "/quizzes/formateur"
                    : `/quizzes/${q.id}/take`,
                icon: <Edit3 className="w-5 h-5" />,
              })
            );
        }
      } catch (e) {
        console.error("Search error", e);
      } finally {
        setSearching(false);
      }

      setResults(found);
      setSelectedIndex(-1);
    },
    [user]
  );

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const r = results[selectedIndex];
      if (r) {
        navigate(r.path);
        setShowDropdown(false);
        setQuery("");
      }
    }
  };

  const handleResultClick = (r: SearchResult) => {
    navigate(r.path);
    setShowDropdown(false);
    setQuery("");
  };

  // Group results by category
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z" fill="currentColor" />
              </svg>
            )}
          </button>

          <Link to="/" className="lg:hidden">
            <img className="dark:hidden" src="./images/logo/logo.svg" alt="Logo" />
            <img className="hidden dark:block" src="./images/logo/logo-dark.svg" alt="Logo" />
          </Link>

          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-99999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z" fill="currentColor" />
            </svg>
          </button>

          {/* ── Global Search ────────────────────────── */}
          <div className="hidden lg:block relative">
            <div className="relative">
              <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
                 <svg className="fill-gray-500 dark:fill-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z" fill="" />
                </svg>
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleQueryChange}
                onKeyDown={handleKeyNavigation}
                onFocus={() => query && setShowDropdown(true)}
                placeholder="Search projects, resources, modules, quizzes..."
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
              />
              <button className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                <span> ⌘ </span>
                <span> K </span>
              </button>
            </div>

            {/* Search Dropdown */}
            {showDropdown && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 mt-2 rounded-2xl overflow-hidden shadow-2xl z-99999
                           bg-white/90 border border-gray-200 backdrop-blur-xl
                           dark:bg-[#1A1A1A]/95 dark:border-white/10"
                style={{
                  width: 430,
                  maxHeight: 480,
                  overflowY: "auto",
                }}
              >
                {searching && (
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/5">
                    <div className="w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                    <span className="text-sm text-gray-400 dark:text-white/50">
                      Searching...
                    </span>
                  </div>
                )}

                {!searching && results.length === 0 && query.trim() && (
                  <div className="px-4 py-8 text-center text-gray-500 dark:text-white/40">
                    <div className="flex items-center justify-center mb-2">
                      <SearchIcon className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-medium">
                      No results for "{query}"
                    </p>
                    <p className="text-xs mt-1">
                      Try searching for projects, modules, or quizzes
                    </p>
                  </div>
                )}

                {!searching && results.length > 0 &&
                  Object.entries(grouped).map(([category, items]) => (
                    <div key={category}>
                      <div
                        className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase
                                   text-gray-400 bg-gray-50/50 border-b border-gray-100
                                   dark:text-white/30 dark:bg-white/[0.03] dark:border-white/5"
                      >
                        {category}s
                      </div>
                      {items.map((result, idx) => {
                        const globalIdx = results.indexOf(result);
                        const isSelected = globalIdx === selectedIndex;
                        return (
                          <button
                            key={result.id}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-l-4
                                        ${isSelected
                                ? "bg-orange-500/10 border-orange-500"
                                : "bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                              }`}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            onClick={() => handleResultClick(result)}
                          >
                            <span className="text-xl flex-shrink-0">{result.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate text-gray-900 dark:text-[#F4F4F4]">
                                {result.title}
                              </p>
                              <p className="text-xs truncate text-gray-400 dark:text-white/40">
                                {result.subtitle}
                              </p>
                            </div>
                            <span
                              className="text-xs rounded-full px-2 py-0.5 flex-shrink-0
                                         bg-gray-100 text-gray-500
                                         dark:bg-white/10 dark:text-white/40"
                            >
                              {category}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}

                {/* Footer hint */}
                {results.length > 0 && (
                  <div
                    className="flex items-center gap-4 px-4 py-2 text-[10px] uppercase tracking-wider
                               text-gray-400 border-t border-gray-100
                               dark:text-white/20 dark:border-white/5"
                  >
                    <span>↑↓ navigate</span>
                    <span>↵ select</span>
                    <span>Esc close</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div
          className={`${isApplicationMenuOpen ? "flex" : "hidden"} items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            <ThemeToggleButton />
            <NotificationDropdown />
          </div>
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;