
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { HeaderBar } from "../components/HeaderBar";
import { Car } from "lucide-react";

export default function Trips() {
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
              <Car className="text-green-500" size={32} />
              <h2 className="text-2xl font-bold text-gray-800">Trips</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <img
                src="https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=600&q=80"
                alt="Trips"
                className="rounded-lg shadow-md object-cover h-52 w-full"
              />
              <div>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Manage and overview school bus trips.
                </p>
                <ul className="text-gray-600 space-y-1 list-disc list-inside">
                  <li>View upcoming, ongoing, and completed trips.</li>
                  <li>Track trip status and assigned drivers.</li>
                  <li>Monitor real-time trip progress.</li>
                  <li>See student and staff participation.</li>
                </ul>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
