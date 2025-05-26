
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { HeaderBar } from "../components/HeaderBar";
import { Users } from "lucide-react";

export default function Students() {
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
              <Users className="text-green-500" size={32} />
              <h2 className="text-2xl font-bold text-gray-800">Students</h2>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Manage information for all enrolled students.
              </p>
              <ul className="text-gray-600 space-y-1 list-disc list-inside mb-2">
                <li>View student lists and profiles.</li>
                <li>Search, edit, or add student data.</li>
                <li>Assign students to bus routes and stops.</li>
              </ul>
              <img
                src="https://images.unsplash.com/photo-1464983953574-0892a716854b?w=500&q=80"
                alt="Students"
                className="rounded-lg shadow-md object-cover h-36 w-full mt-4"
              />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
