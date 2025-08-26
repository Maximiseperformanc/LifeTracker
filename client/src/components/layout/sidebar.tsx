import { Link, useLocation } from "wouter";
import { 
  Home, 
  Clock, 
  CheckSquare, 
  Heart, 
  Target, 
  Calendar, 
  BarChart3,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Timer", href: "/timer", icon: Clock },
  { name: "Habits", href: "/habits", icon: CheckSquare },
  { name: "Health", href: "/health", icon: Heart },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-surface border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">LifeTrack Pro</h1>
            <p className="text-sm text-gray-600">Personal Development</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-primary"
                    : "text-gray-700 hover:bg-gray-50"
                )}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-medium">SC</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">Sarah Chen</p>
            <p className="text-sm text-gray-600">Premium User</p>
          </div>
        </div>
      </div>
    </div>
  );
}
