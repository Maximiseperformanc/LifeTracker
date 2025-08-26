import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Clock, Play, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function ContentPage() {
  const today = new Date().toISOString().split('T')[0];

  // Get today's screen time data
  const { data: screenTimeEntries = [] } = useQuery({
    queryKey: ['/api/screen-time/entries', today],
    queryFn: () => fetch(`/api/screen-time/entries?date=${today}`).then(res => res.json())
  });

  const { data: screenTimeApps = [] } = useQuery({
    queryKey: ['/api/screen-time/apps'],
    queryFn: () => fetch('/api/screen-time/apps').then(res => res.json())
  });

  // Get watchlist data
  const { data: watchlistItems = [] } = useQuery({
    queryKey: ['/api/watchlist'],
    queryFn: () => fetch('/api/watchlist').then(res => res.json())
  });

  // Calculate today's screen time summary
  const todayTotal = screenTimeEntries.reduce((total: number, entry: any) => total + entry.minutes, 0);
  const topApp = screenTimeEntries.length > 0 
    ? screenTimeEntries.sort((a: any, b: any) => b.minutes - a.minutes)[0]
    : null;
  const topAppName = topApp 
    ? screenTimeApps.find((app: any) => app.id === topApp.appId)?.name || "Unknown"
    : null;

  // Get a suggested watchlist item (random from "To Watch" items)
  const suggestedItem = watchlistItems
    .filter((item: any) => item.status === "To Watch")
    .sort(() => Math.random() - 0.5)[0];

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Smartphone className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content</h1>
          <p className="text-gray-600">Screen time tracking and watchlist management</p>
        </div>
      </div>

      {/* Today's Screen Time Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Today's Screen Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{formatTime(todayTotal)}</div>
              <div className="text-sm text-gray-600">Total Today</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                {topAppName || "No data"}
              </div>
              <div className="text-sm text-gray-600">
                {topApp ? formatTime(topApp.minutes) : "Top app"}
              </div>
            </div>
            <div className="text-center">
              <Link href="/content/screen-time">
                <Button variant="outline" size="sm" className="w-full" data-testid="view-screen-time">
                  View Details <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Watchlist Suggestion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-green-600" />
            Suggested for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          {suggestedItem ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">{suggestedItem.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {suggestedItem.type}
                  </Badge>
                  {suggestedItem.source && (
                    <span className="text-sm text-gray-600">{suggestedItem.source}</span>
                  )}
                  {suggestedItem.length && (
                    <span className="text-sm text-gray-600">• {suggestedItem.length}m</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  data-testid={`mark-done-${suggestedItem.id}`}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Mark Done
                </Button>
                <Link href="/content/watchlist">
                  <Button variant="default" size="sm" data-testid="view-watchlist">
                    View All
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Play className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No items in your watchlist yet</p>
              <Link href="/content/watchlist">
                <Button className="mt-2" size="sm" data-testid="add-first-item">
                  Add Your First Item
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/content/screen-time">
            <CardContent className="p-6 text-center">
              <Smartphone className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">Screen Time Tracker</h3>
              <p className="text-sm text-gray-600">
                Track app usage, set limits, and monitor digital wellness
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/content/watchlist">
            <CardContent className="p-6 text-center">
              <Play className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold mb-2">Watchlist Manager</h3>
              <p className="text-sm text-gray-600">
                Organize movies, shows, and content to watch
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}