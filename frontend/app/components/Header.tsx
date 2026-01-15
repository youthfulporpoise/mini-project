import { Bell, User } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          > 
            <Bell className="w-5 h-5" />
            {/* Future upgrades  */}
            {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
          </button>
          <button
            type="button"
            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">
               User
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
