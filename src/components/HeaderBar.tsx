
import { Users } from "lucide-react";

export function HeaderBar() {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white shadow-sm border-b">
      {/* Search */}
      <div className="flex-1 flex items-center">
        <input
          type="text"
          placeholder="Search"
          className="w-[330px] rounded-md px-4 py-2 bg-gray-100 focus:ring-2 ring-green-200 outline-none text-sm transition"
        />
      </div>
      {/* Icons and profile */}
      <div className="flex items-center gap-4">
        {/* Notification bell - nonfunctional placeholder */}
        <button className="rounded-full p-2 hover:bg-gray-100 transition inline-flex items-center">
          <svg width="22" height="22" fill="none"><circle cx="11" cy="11" r="10" stroke="#222" strokeWidth="2"/><path d="M11 5v6" stroke="#222" strokeWidth="2" strokeLinecap="round"/><circle cx="11" cy="14.5" r="1" fill="#222"/></svg>
        </button>
        {/* User */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-purple-400 flex items-center justify-center text-white text-lg font-bold">JD</div>
          <div className="flex flex-col text-right">
            <span className="font-medium text-gray-800">John Doe</span>
            <span className="text-xs text-gray-500">School Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}

