
// LuxCab Dashboard - Inspired by UI Example Reference

import { AppSidebar } from "../components/AppSidebar";
import { HeaderBar } from "../components/HeaderBar";
import { StatOverviewCards } from "../components/StatOverviewCards";
import { RecentTripsTable } from "../components/RecentTripsTable";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="hidden md:block w-64 border-r bg-white">
        <AppSidebar />
      </div>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <HeaderBar />
        <main className="flex-1 px-8 py-6 bg-gray-100">
          <div className="mb-2">
            <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
          </div>
          <StatOverviewCards />
          <RecentTripsTable />
        </main>
      </div>
    </div>
  );
};

export default Index;
