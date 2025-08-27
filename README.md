# LifeTrack Pro - Calendar Application

A comprehensive personal development dashboard featuring a full-featured calendar with FullCalendar integration.

## Calendar Features

### Core Functionality
- **Multiple Views**: Month, Week, and Day views with intuitive grid layouts
- **Event Management**: Complete CRUD operations (Create, Read, Update, Delete)
- **Drag & Drop**: Click/drag to create events, drag to move/resize existing events
- **Recurring Events**: Support for daily and weekly repeats using RRULE standard
- **Local Storage**: All events persist automatically to browser localStorage
- **Export**: One-click export to .ics format compatible with other calendar applications

### User Interface
- **Search**: Live search through event titles and descriptions
- **Navigation**: Today button, previous/next arrows for easy date navigation
- **Time Zone**: Uses device's local time zone with proper DST handling
- **Responsive**: Works seamlessly on desktop and mobile devices

### Event Features
- **All-Day Events**: Toggle between timed and all-day events
- **Color Coding**: Custom colors for easy event categorization
- **Rich Details**: Title, description, location, and time information
- **Quick Actions**: Edit or delete events with simple clicks

## How to Run on Replit

1. **Fork/Import the Project**
   - Click "Fork" or import this repository into Replit
   - All dependencies are already configured in `package.json`

2. **Install Dependencies** (if needed)
   ```bash
   npm install
   ```

3. **Start the Application**
   - Click the "Run" button in Replit, or
   - Run manually: `npm run dev`
   - The app will open automatically in Replit's webview

4. **Access the Calendar**
   - Navigate to the Calendar page from the main dashboard
   - Start creating events immediately!

## How to Use the Calendar

### Creating Events
1. **Click & Drag**: Select dates/times directly on the calendar
2. **Add Event Button**: Click "Add Event" for manual creation
3. **Fill Details**: Add title, time, description, location, and color
4. **Set Recurrence**: Choose "Daily" or "Weekly" for repeating events
5. **Save**: Click "Create" to save the event

### Managing Events
- **Edit**: Click any event to modify its details
- **Move**: Drag events to different dates/times
- **Resize**: Drag event edges to change duration (in week/day views)
- **Delete**: Use the delete button when editing an event
- **Search**: Use the search box to find specific events quickly

### Viewing Options
- **Month View**: Full month overview with all events
- **Week View**: Detailed week with time slots
- **Day View**: Detailed single day with hourly slots
- **Today Button**: Quickly jump to current date
- **Navigation**: Use arrows to move between periods

## Export and Import .ics Files

### Exporting Your Calendar
1. Click the "Export .ics" button in the calendar toolbar
2. Your browser will download a file named `calendar-events.ics`
3. This file contains all your events in standard iCalendar format (RFC 5545)

### What's Included in the Export
- All event details (title, description, location, dates/times)
- Recurring event rules (RRULE) for daily/weekly repeats
- Event colors and metadata
- Proper time zone information

### Importing to Other Applications

**Google Calendar:**
1. Open Google Calendar
2. Click Settings (gear icon) → Import & export
3. Choose "Import" and select your downloaded .ics file

**Apple Calendar:**
1. Open Calendar app
2. File → Import → Select your .ics file

**Outlook:**
1. Open Outlook
2. File → Open & Export → Import/Export
3. Choose "Import an iCalendar (.ics) file"

**Other Calendar Apps:**
Most calendar applications support .ics import through their import/settings menus.

### iCalendar Standard Compliance
The exported .ics files follow RFC 5545 specifications and include:
- `VCALENDAR` wrapper with proper version and producer information
- `VEVENT` components with all required fields
- `RRULE` properties for recurring events
- Proper `DTSTART` and `DTEND` formatting
- UTC time zone handling for cross-platform compatibility

## Technical Implementation

### Technologies Used
- **FullCalendar**: Professional calendar component with drag & drop
- **Luxon**: Reliable time zone and date handling
- **React + TypeScript**: Modern, type-safe frontend development
- **Vite**: Fast development server and build tool
- **ICS Library**: RFC 5545 compliant iCalendar file generation

### Data Storage
- Events are stored in browser `localStorage`
- Automatic persistence with every change
- No backend required - fully client-side
- Data survives browser sessions and page refreshes

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browser support
- Local time zone detection and DST handling
- Responsive design for all screen sizes

## Troubleshooting

### Events Not Appearing
- Check if your browser allows localStorage
- Try refreshing the page
- Ensure JavaScript is enabled

### Export Issues
- Make sure your browser allows file downloads
- Check if popup blockers are interfering
- Try using a different browser if issues persist

### Time Zone Problems
- The calendar uses your device's local time zone
- Ensure your system time zone is set correctly
- DST transitions are handled automatically

## Support

For issues or questions, check the browser console for error messages and ensure all dependencies are properly installed.