
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { HeaderBar } from "../components/HeaderBar";
import { Map } from "lucide-react";

export default function RoutesPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-100 flex w-full">
        {/* Sidebar */}
        <div className="hidden md:block w-64 border-r bg-white">
          <AppSidebar />
        </div>
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          <HeaderBar />
          <main className="flex-1 px-8 py-6 bg-gray-100">
            <div className="mb-4 flex items-center gap-3">
              <Map className="text-green-500" size={32} />
              <h2 className="text-2xl font-bold text-gray-800">Routes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <img
                src="https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600&q=80"
                alt="Routes"
                className="rounded-lg shadow-md object-cover h-52 w-full"
              />
              <div>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Browse and manage all school routes.
                </p>
                <ul className="text-gray-600 space-y-1 list-disc list-inside">
                  <li>Review mapped bus routes.</li>
                  <li>Edit pickup and drop-off locations.</li>
                  <li>Assign vehicles and drivers to specific routes.</li>
                  <li>Analyze route efficiency.</li>
                </ul>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
