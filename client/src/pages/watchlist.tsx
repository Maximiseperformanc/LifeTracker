import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Play, 
  Plus, 
  Download,
  CheckCircle2,
  Clock,
  Calendar,
  Trash2,
  Edit,
  Link as LinkIcon,
  Star,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function WatchlistPage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [newItem, setNewItem] = useState({
    title: "",
    type: "movie",
    source: "",
    link: "",
    length: "",
    notes: ""
  });

  const { data: watchlistItems = [] } = useQuery({
    queryKey: ['/api/watchlist'],
    queryFn: () => fetch('/api/watchlist').then(res => res.json())
  });

  // Mutations
  const addItemMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/watchlist", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      setIsAddDialogOpen(false);
      resetNewItem();
      toast({ title: "Item added!", description: "Added to your watchlist." });
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) => 
      apiRequest("PUT", `/api/watchlist/${data.id}`, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      setEditingItem(null);
      toast({ title: "Item updated!", description: "Watchlist item updated successfully." });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/watchlist/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      toast({ title: "Item deleted", description: "Removed from your watchlist." });
    }
  });

  const resetNewItem = () => {
    setNewItem({
      title: "",
      type: "movie",
      source: "",
      link: "",
      length: "",
      notes: ""
    });
  };

  const handleMarkDone = (item: any) => {
    updateItemMutation.mutate({
      id: item.id,
      updates: { status: "Done" }
    });
  };

  const handleStatusChange = (item: any, newStatus: string) => {
    updateItemMutation.mutate({
      id: item.id,
      updates: { status: newStatus }
    });
  };

  // Calculate stats
  const stats = {
    total: watchlistItems.length,
    toWatch: watchlistItems.filter((item: any) => item.status === "To Watch").length,
    inProgress: watchlistItems.filter((item: any) => item.status === "In Progress").length,
    done: watchlistItems.filter((item: any) => item.status === "Done").length,
    thisWeek: watchlistItems.filter((item: any) => {
      if (!item.finishedAt) return false;
      const finishedDate = new Date(item.finishedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return finishedDate >= weekAgo;
    }).length
  };

  // Calculate streak (consecutive days with completed items)
  const calculateStreak = () => {
    const completedItems = watchlistItems
      .filter((item: any) => item.finishedAt)
      .sort((a: any, b: any) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime());

    if (completedItems.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < completedItems.length; i++) {
      const itemDate = new Date(completedItems[i].finishedAt);
      itemDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff === streak + 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const streak = calculateStreak();

  // Filter items
  const filteredItems = watchlistItems.filter((item: any) => {
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    if (filterType !== "all" && item.type !== filterType) return false;
    return true;
  });

  // Get suggestions (random 3-5 items from "To Watch")
  const suggestions = watchlistItems
    .filter((item: any) => item.status === "To Watch")
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(5, Math.max(3, Math.floor(watchlistItems.length / 4))));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "To Watch": return "bg-blue-100 text-blue-800";
      case "In Progress": return "bg-yellow-100 text-yellow-800";
      case "Done": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "movie": return "🎬";
      case "show": return "📺";
      case "podcast": return "🎧";
      case "other": return "📱";
      default: return "📝";
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/watchlist/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'watchlist-data.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({ title: "Export complete!", description: "Watchlist exported to CSV." });
    } catch (error) {
      toast({ title: "Export failed", description: "Could not export watchlist data.", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Play className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Watchlist</h1>
            <p className="text-gray-600">Organize and track your entertainment</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} data-testid="export-watchlist">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-item-button">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add to Watchlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input 
                    value={newItem.title}
                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                    placeholder="Enter title"
                    data-testid="input-title"
                  />
                </div>
                <div>
                  <Label>Type *</Label>
                  <Select value={newItem.type} onValueChange={(value) => setNewItem({...newItem, type: value})}>
                    <SelectTrigger data-testid="select-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="movie">Movie</SelectItem>
                      <SelectItem value="show">TV Show</SelectItem>
                      <SelectItem value="podcast">Podcast</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Source/Platform</Label>
                  <Input 
                    value={newItem.source}
                    onChange={(e) => setNewItem({...newItem, source: e.target.value})}
                    placeholder="Netflix, YouTube, etc."
                    data-testid="input-source"
                  />
                </div>
                <div>
                  <Label>Link</Label>
                  <Input 
                    value={newItem.link}
                    onChange={(e) => setNewItem({...newItem, link: e.target.value})}
                    placeholder="URL (optional)"
                    data-testid="input-link"
                  />
                </div>
                <div>
                  <Label>Runtime (minutes)</Label>
                  <Input 
                    type="number"
                    value={newItem.length}
                    onChange={(e) => setNewItem({...newItem, length: e.target.value})}
                    placeholder="Optional"
                    data-testid="input-length"
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea 
                    value={newItem.notes}
                    onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                    placeholder="Optional notes"
                    data-testid="input-notes"
                  />
                </div>
                <Button 
                  onClick={() => addItemMutation.mutate({
                    ...newItem,
                    length: newItem.length ? parseInt(newItem.length) : null
                  })}
                  disabled={!newItem.title || !newItem.type || addItemMutation.isPending}
                  className="w-full"
                  data-testid="save-item"
                >
                  {addItemMutation.isPending ? "Adding..." : "Add to Watchlist"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.toWatch}</div>
            <div className="text-sm text-gray-600">To Watch</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.done}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.thisWeek}</div>
            <div className="text-sm text-gray-600">This Week</div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-green-600" />
              Suggested for You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.slice(0, 3).map((item: any) => (
                <div key={item.id} className="p-3 bg-white rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{getTypeIcon(item.type)} {item.title}</div>
                      {item.source && (
                        <div className="text-sm text-gray-600 mt-1">{item.source}</div>
                      )}
                      {item.length && (
                        <div className="text-sm text-gray-600">{item.length} min</div>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleMarkDone(item)}
                      disabled={updateItemMutation.isPending}
                      data-testid={`mark-done-${item.id}`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32" data-testid="filter-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="To Watch">To Watch</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32" data-testid="filter-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="movie">Movies</SelectItem>
                  <SelectItem value="show">TV Shows</SelectItem>
                  <SelectItem value="podcast">Podcasts</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Watchlist Items */}
      <Card>
        <CardHeader>
          <CardTitle>Your Watchlist ({filteredItems.length} items)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length > 0 ? (
            <div className="space-y-3">
              {filteredItems.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{getTypeIcon(item.type)}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{item.title}</span>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {item.source && <span>{item.source}</span>}
                      {item.length && <span>{item.length} min</span>}
                      {item.link && (
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <LinkIcon className="h-3 w-3" />
                          Link
                        </a>
                      )}
                    </div>
                    
                    {item.notes && (
                      <div className="text-sm text-gray-600 mt-1">{item.notes}</div>
                    )}
                    
                    {item.finishedAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        Completed on {new Date(item.finishedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.status !== "Done" && (
                      <div className="flex gap-1">
                        {item.status === "To Watch" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(item, "In Progress")}
                            data-testid={`start-${item.id}`}
                          >
                            Start
                          </Button>
                        )}
                        <Button 
                          size="sm"
                          onClick={() => handleMarkDone(item)}
                          disabled={updateItemMutation.isPending}
                          data-testid={`mark-done-${item.id}`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingItem(item)}
                      data-testid={`edit-${item.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteItemMutation.mutate(item.id)}
                      disabled={deleteItemMutation.isPending}
                      data-testid={`delete-${item.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Play className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No items found</p>
              <p className="text-sm">
                {watchlistItems.length === 0 
                  ? "Add your first movie, show, or podcast to get started"
                  : "Try adjusting your filters"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input 
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                  data-testid="edit-title"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editingItem.status} onValueChange={(value) => setEditingItem({...editingItem, status: value})}>
                  <SelectTrigger data-testid="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Watch">To Watch</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Source/Platform</Label>
                <Input 
                  value={editingItem.source || ""}
                  onChange={(e) => setEditingItem({...editingItem, source: e.target.value})}
                  data-testid="edit-source"
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea 
                  value={editingItem.notes || ""}
                  onChange={(e) => setEditingItem({...editingItem, notes: e.target.value})}
                  data-testid="edit-notes"
                />
              </div>
              <Button 
                onClick={() => updateItemMutation.mutate({
                  id: editingItem.id,
                  updates: editingItem
                })}
                disabled={updateItemMutation.isPending}
                className="w-full"
                data-testid="save-edit"
              >
                {updateItemMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}