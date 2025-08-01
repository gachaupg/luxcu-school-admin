import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SuperAdminSidebar } from "@/components/SuperAdminSidebar";
import AppNavbar from "@/components/AppNavbar";
import { useSidebar } from "@/components/ui/sidebar";
import { useState, useEffect, useRef } from "react";

const SuperAdminLayout = () => {
  const location = useLocation();
  const { openMobile, setOpenMobile, toggleSidebar } = useSidebar();
  const [isScrolled, setIsScrolled] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (mainRef.current) {
        const scrollTop = mainRef.current.scrollTop;
        setIsScrolled(scrollTop > 0);
      }
    };

    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.addEventListener("scroll", handleScroll);
      return () => mainElement.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div className="h-screen w-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {openMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpenMobile(false)}
        />
      )}

      <div className="flex h-full w-full overflow-hidden">
        {/* Sidebar */}
        <div
          className={`fixed md:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out ${
            openMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="h-full bg-card border-r">
            <SuperAdminSidebar />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col w-full overflow-hidden">
          <AppNavbar onMenuClick={toggleSidebar} isScrolled={isScrolled} />
          <main ref={mainRef} className="flex-1 overflow-y-auto bg-background">
            <div className="h-full w-full">
              <div className="h-full w-full">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const SuperAdminLayoutWithProvider = () => {
  return (
    <SidebarProvider>
      <SuperAdminLayout />
    </SidebarProvider>
  );
};

export default SuperAdminLayoutWithProvider; 