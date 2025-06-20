import { useState } from "react";
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { HeaderBar } from "../components/HeaderBar";
import { Settings, Check, Edit2 } from "lucide-react";

const TABS = [
  "Notification Settings",
  "Email Settings",
  "Push Notifications",
  "School Policies",
  "Personalization",
];

const NOTIF_TYPES = [
  { label: "SMS Notifications" },
  { label: "Email Notifications" },
  { label: "Push Notifications" },
];

const RECIPIENTS = [
  { label: "Parents" },
  { label: "Drivers" },
  { label: "Staff" },
];

const MESSAGE_CARDS = [
  { title: "Trip Started", recipient: "Parents" },
  { title: "Trip Ended", recipient: "Parents" },
  { title: "SOS Alert", recipient: "Parents" },
  { title: "Trip Delayed", recipient: "Parents" },
  { title: "Trip Started", recipient: "Driver" },
  { title: "Trip Ended", recipient: "Driver" },
  { title: "Trip Delayed", recipient: "Driver" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCard, setSelectedCard] = useState(0);
  return (
      <div className="min-h-screen bg-gray-100 flex w-full">
        {/* Sidebar */}
      
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 px-8 py-6 bg-gray-100">
            <div className="mb-4 flex items-center gap-3">
              <Settings className="text-green-500" size={32} />
              <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
            </div>
            {/* Tabs */}
            <div className="flex gap-8 border-b mb-6">
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  className={`pb-2 text-lg font-medium transition-colors ${
                    i === activeTab
                      ? "border-b-2 border-green-400 text-green-400"
                      : "text-gray-400 hover:text-green-400"
                  }`}
                  onClick={() => setActiveTab(i)}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Notification Settings Content */}
            {activeTab === 0 && (
              <div>
                {/* Notification Types & Recipients */}
                <div className="flex flex-wrap gap-12 mb-8">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Notification Types
                    </h3>
                    <div className="flex flex-col gap-3">
                      {NOTIF_TYPES.map((type) => (
                        <div
                          key={type.label}
                          className="flex items-center gap-3"
                        >
                          <span className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                            <span className="w-3 h-3 bg-white rounded-full block" />
                          </span>
                          <span className="text-gray-700">{type.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Notification Recipients
                    </h3>
                    <div className="flex flex-col gap-3">
                      {RECIPIENTS.map((rec, i) => (
                        <label
                          key={rec.label}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={i < 2}
                            readOnly
                            className="accent-green-500 w-4 h-4"
                          />
                          <span className="text-gray-700">{rec.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 flex justify-end items-start">
                    <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
                      New Message
                    </button>
                  </div>
                </div>
                {/* Message Customization */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MESSAGE_CARDS.map((card, i) => (
                    <div
                      key={card.title + card.recipient}
                      className={`border rounded-lg p-4 flex justify-between items-center cursor-pointer transition ${
                        selectedCard === i
                          ? "border-green-400 shadow-lg"
                          : "border-gray-200"
                      }`}
                      onClick={() => setSelectedCard(i)}
                    >
                      <div>
                        <div className="font-semibold text-gray-800">
                          {card.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {card.recipient}
                        </div>
                      </div>
                      <button className="flex items-center gap-1 text-green-500 hover:underline">
                        Edit <Edit2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                {/* Preview */}
                <div className="bg-white rounded-lg shadow p-6 mb-4">
                  <div className="text-xs text-gray-400 mb-1">SMS</div>
                  <div className="font-bold text-lg text-gray-800 mb-2">
                    Trip Started
                  </div>
                  <div className="text-gray-700">
                    Your child's trip has started. The bus has departed from
                    [Starting Location] and is en route. Track live updates in
                    the app. 🚌
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className="bg-white border border-green-500 text-green-500 px-8 py-2 rounded hover:bg-green-50 transition">
                    Save
                  </button>
                </div>
              </div>
            )}
            {/* Other tabs can be filled in as needed */}
          </main>
        </div>
      </div>
  );
}
