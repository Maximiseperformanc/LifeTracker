import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import { EventInput, EventApi, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { DateTime } from "luxon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, Calendar, Clock, Search, ChevronLeft, ChevronRight,
  Download, CalendarDays, Trash2, Edit, X
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
// @ts-ignore - ics types not available
import { createEvent, createEvents } from "ics";

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  start: z.string().min(1, "Start date/time is required"),
  end: z.string().optional(),
  allDay: z.boolean().default(false),
  description: z.string().optional(),
  location: z.string().optional(),
  color: z.string().default("#3b82f6"),
  rrule: z.string().optional(),
  repeatType: z.enum(["none", "daily", "weekly"]).default("none")
});

type EventFormData = z.infer<typeof eventFormSchema>;

interface StoredEvent extends EventInput {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  description?: string;
  location?: string;
  color?: string;
  rrule?: string;
  repeatType?: "none" | "daily" | "weekly";
}

const STORAGE_KEY = "fullcalendar_events";

export default function CalendarPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<StoredEvent | null>(null);
  const [events, setEvents] = useState<StoredEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState("dayGridMonth");
  const calendarRef = useRef<FullCalendar>(null);
  const { toast } = useToast();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      start: "",
      end: "",
      allDay: false,
      description: "",
      location: "",
      color: "#3b82f6",
      rrule: "",
      repeatType: "none"
    }
  });

  // Load events from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem(STORAGE_KEY);
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents);
        setEvents(parsedEvents);
      } catch (error) {
        console.error("Error loading events from localStorage:", error);
      }
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const generateRRuleString = (repeatType: "none" | "daily" | "weekly", startDate: string) => {
    if (repeatType === "none") return undefined;
    
    const start = DateTime.fromISO(startDate);
    
    switch (repeatType) {
      case "daily":
        return `FREQ=DAILY;DTSTART=${start.toFormat("yyyyMMdd'T'HHmmss")}`;
      case "weekly":
        return `FREQ=WEEKLY;BYDAY=${start.toFormat("EEE").slice(0, 2).toUpperCase()};DTSTART=${start.toFormat("yyyyMMdd'T'HHmmss")}`;
      default:
        return undefined;
    }
  };

  const openModal = (event?: StoredEvent, selectInfo?: DateSelectArg) => {
    if (event) {
      setSelectedEvent(event);
      form.reset({
        title: event.title,
        start: event.start,
        end: event.end || "",
        allDay: event.allDay || false,
        description: event.description || "",
        location: event.location || "",
        color: event.color || "#3b82f6",
        repeatType: event.repeatType || "none"
      });
    } else if (selectInfo) {
      setSelectedEvent(null);
      const startStr = selectInfo.allDay 
        ? DateTime.fromJSDate(selectInfo.start).toFormat("yyyy-MM-dd")
        : DateTime.fromJSDate(selectInfo.start).toISO({ suppressMilliseconds: true });
      const endStr = selectInfo.allDay 
        ? DateTime.fromJSDate(selectInfo.end).minus({ days: 1 }).toFormat("yyyy-MM-dd")
        : DateTime.fromJSDate(selectInfo.end).toISO({ suppressMilliseconds: true });
      
      form.reset({
        title: "",
        start: startStr || "",
        end: endStr || "",
        allDay: selectInfo.allDay,
        description: "",
        location: "",
        color: "#3b82f6",
        repeatType: "none"
      });
    } else {
      setSelectedEvent(null);
      form.reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    form.reset();
  };

  const saveEvent = (data: EventFormData) => {
    const eventId = selectedEvent?.id || `event_${Date.now()}_${Math.random()}`;
    
    const rruleString = generateRRuleString(data.repeatType, data.start);
    
    const eventData: StoredEvent = {
      id: eventId,
      title: data.title,
      start: data.start,
      end: data.end || undefined,
      allDay: data.allDay,
      description: data.description,
      location: data.location,
      color: data.color,
      repeatType: data.repeatType,
      ...(rruleString && { rrule: rruleString })
    };

    if (selectedEvent) {
      // Update existing event
      setEvents(prev => prev.map(event => 
        event.id === selectedEvent.id ? eventData : event
      ));
      toast({
        title: "Event Updated",
        description: "Your event has been successfully updated."
      });
    } else {
      // Create new event
      setEvents(prev => [...prev, eventData]);
      toast({
        title: "Event Created",
        description: "Your event has been successfully created."
      });
    }

    closeModal();
  };

  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
    toast({
      title: "Event Deleted",
      description: "The event has been successfully deleted."
    });
    closeModal();
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    openModal(undefined, selectInfo);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const eventData = events.find(event => event.id === clickInfo.event.id);
    if (eventData) {
      openModal(eventData);
    }
  };

  const goToToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
    }
  };

  const goToPrev = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.prev();
    }
  };

  const goToNext = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.next();
    }
  };

  const changeView = (view: string) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(view);
      setViewType(view);
    }
  };

  const exportToICS = () => {
    try {
      const eventsForExport = events.map(event => {
        const startDate = DateTime.fromISO(event.start);
        const endDate = event.end ? DateTime.fromISO(event.end) : startDate.plus({ hours: 1 });
        
        if (event.allDay) {
          return {
            start: [startDate.year, startDate.month, startDate.day],
            end: [endDate.year, endDate.month, endDate.day],
            title: event.title,
            description: event.description || "",
            location: event.location || "",
            status: "CONFIRMED" as const,
            uid: event.id
          };
        } else {
          return {
            start: [startDate.year, startDate.month, startDate.day, startDate.hour, startDate.minute],
            end: [endDate.year, endDate.month, endDate.day, endDate.hour, endDate.minute],
            title: event.title,
            description: event.description || "",
            location: event.location || "",
            status: "CONFIRMED" as const,
            uid: event.id
          };
        }
      });

      createEvents(eventsForExport, (error, value) => {
        if (error) {
          console.error("Error creating ICS:", error);
          toast({
            title: "Export Failed",
            description: "There was an error exporting your calendar.",
            variant: "destructive"
          });
          return;
        }

        const blob = new Blob([value || ""], { type: "text/calendar;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "calendar-events.ics";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Calendar Exported",
          description: "Your calendar has been exported successfully."
        });
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your calendar.",
        variant: "destructive"
      });
    }
  };

  // Filter events based on search query
  const filteredEvents = events.filter(event => 
    !searchQuery || 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6" data-testid="calendar-page">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={goToPrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={goToToday}>
                <CalendarDays className="h-4 w-4 mr-2" />
                Today
              </Button>
              <Button variant="outline" onClick={goToNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Select value={viewType} onValueChange={changeView}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dayGridMonth">Month</SelectItem>
                  <SelectItem value="timeGridWeek">Week</SelectItem>
                  <SelectItem value="timeGridDay">Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-events"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={exportToICS}
                data-testid="button-export-calendar"
              >
                <Download className="h-4 w-4 mr-2" />
                Export .ics
              </Button>
              <Button 
                onClick={() => openModal()}
                data-testid="button-add-event"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FullCalendar */}
      <Card>
        <CardContent className="p-4">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
            headerToolbar={false}
            initialView="dayGridMonth"
            events={filteredEvents}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            editable={true}
            droppable={true}
            height="auto"
            eventClassNames="cursor-pointer"
            selectOverlap={false}
            eventOverlap={false}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={true}
            nowIndicator={true}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5],
              startTime: '09:00',
              endTime: '17:00',
            }}
            timeZone="local"
          />
        </CardContent>
      </Card>

      {/* Event Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {selectedEvent ? "Edit Event" : "Create Event"}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={closeModal}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(saveEvent)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Event title" {...field} data-testid="input-event-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allDay"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>All Day</FormLabel>
                      <div className="text-sm text-gray-600">
                        Event lasts the entire day
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-all-day"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start</FormLabel>
                      <FormControl>
                        <Input
                          type={form.watch("allDay") ? "date" : "datetime-local"}
                          {...field}
                          data-testid="input-start-datetime"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End</FormLabel>
                      <FormControl>
                        <Input
                          type={form.watch("allDay") ? "date" : "datetime-local"}
                          {...field}
                          data-testid="input-end-datetime"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="repeatType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repeat</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-repeat-type">
                          <SelectValue placeholder="Select repeat pattern" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Does not repeat</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Event description..." 
                        {...field} 
                        data-testid="textarea-event-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Event location" 
                        {...field} 
                        data-testid="input-event-location"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input 
                        type="color" 
                        {...field} 
                        className="h-10"
                        data-testid="input-event-color"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-4">
                {selectedEvent && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => deleteEvent(selectedEvent.id)}
                    data-testid="button-delete-event"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
                
                <div className="flex gap-2 ml-auto">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={closeModal}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    data-testid="button-save-event"
                  >
                    {selectedEvent ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}