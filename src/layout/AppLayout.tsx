import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { UIProvider, useUI } from "@/context/ui-context";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { isModalOpen } = useUI();

  return (
    <>
      {/* APP CONTENT */}
      <div
        className={`min-h-screen xl:flex transition-all duration-200
          ${isModalOpen ? "blur-sm brightness-95 pointer-events-none" : ""}
        `}
      >
        <div>
          <AppSidebar />
        </div>

        <div
          className={`flex-1 transition-all duration-300 ease-in-out
            ${isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"}
            ${isMobileOpen ? "ml-0" : ""}
          `}
        >
          <AppHeader />

          <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
            <Outlet />
          </div>
        </div>
      </div>

      {/* MODALS RENDER ABOVE */}
      <Backdrop />
    </>
  );
};


const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <UIProvider>
        <LayoutContent />
      </UIProvider>
    </SidebarProvider>
  );
};

export default AppLayout;
