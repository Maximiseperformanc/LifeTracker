import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Home, 
  Clock, 
  CheckSquare, 
  Heart, 
  Apple,
  Dumbbell,
  Smartphone,
  Target, 
  Calendar, 
  BarChart3,
  TrendingUp,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "To Do", href: "/todos", icon: CheckSquare },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Systems", href: "/systems", icon: TrendingUp },
  { name: "Timer", href: "/timer", icon: Clock },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

interface SidebarProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  currentPage?: string;
}

export function Sidebar({ mobileMenuOpen = false, setMobileMenuOpen, currentPage }: SidebarProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-2">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center">
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
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href || currentPage === item.href;
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <div
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer",
                        isActive
                          ? "bg-blue-50 text-primary"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                      data-testid={`nav-${item.name.toLowerCase()}`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );

  // Mobile Menu Button
  const MobileMenuButton = () => (
    <div className="lg:hidden">
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">LifeTrack Pro</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen?.(true)}
          data-testid="mobile-menu-button"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">LifeTrack Pro</h1>
                  <p className="text-sm text-gray-600">Personal Development</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen?.(false)}
                data-testid="mobile-menu-close"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href || currentPage === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer",
                      isActive
                        ? "bg-blue-50 text-primary"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                    onClick={() => setMobileMenuOpen?.(false)}
                    data-testid={`mobile-nav-${item.name.toLowerCase()}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileMenuButton />
      <MobileSidebar />
    </>
  );
}

export default Sidebar;