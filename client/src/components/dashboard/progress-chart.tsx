import { useRef, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProgressChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sample data - in a real app this would come from props
    const data = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      focusTime: [3.5, 4.2, 2.8, 5.1, 4.8, 3.2, 4.5],
      habitsCompleted: [75, 85, 60, 90, 80, 70, 78]
    };

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up dimensions
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    const maxFocus = Math.max(...data.focusTime);
    const maxHabits = 100;

    // Draw grid lines
    ctx.strokeStyle = '#F3F4F6';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i * chartHeight / 4);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    // Draw focus time line
    ctx.strokeStyle = '#1976D2';
    ctx.fillStyle = 'rgba(25, 118, 210, 0.1)';
    ctx.lineWidth = 3;
    
    const focusPath = new Path2D();
    const fillPath = new Path2D();
    
    data.focusTime.forEach((value, index) => {
      const x = padding + (index * chartWidth / (data.labels.length - 1));
      const y = padding + chartHeight - (value / maxFocus * chartHeight);
      
      if (index === 0) {
        focusPath.moveTo(x, y);
        fillPath.moveTo(x, padding + chartHeight);
        fillPath.lineTo(x, y);
      } else {
        focusPath.lineTo(x, y);
        fillPath.lineTo(x, y);
      }
    });
    
    fillPath.lineTo(padding + chartWidth, padding + chartHeight);
    fillPath.closePath();
    
    ctx.fill(fillPath);
    ctx.stroke(focusPath);

    // Draw habits line
    ctx.strokeStyle = '#388E3C';
    ctx.fillStyle = 'rgba(56, 142, 60, 0.1)';
    
    const habitsPath = new Path2D();
    const habitsFillPath = new Path2D();
    
    data.habitsCompleted.forEach((value, index) => {
      const x = padding + (index * chartWidth / (data.labels.length - 1));
      const y = padding + chartHeight - (value / maxHabits * chartHeight);
      
      if (index === 0) {
        habitsPath.moveTo(x, y);
        habitsFillPath.moveTo(x, padding + chartHeight);
        habitsFillPath.lineTo(x, y);
      } else {
        habitsPath.lineTo(x, y);
        habitsFillPath.lineTo(x, y);
      }
    });
    
    habitsFillPath.lineTo(padding + chartWidth, padding + chartHeight);
    habitsFillPath.closePath();
    
    ctx.fill(habitsFillPath);
    ctx.stroke(habitsPath);

    // Draw labels
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    data.labels.forEach((label, index) => {
      const x = padding + (index * chartWidth / (data.labels.length - 1));
      ctx.fillText(label, x, canvas.height - 10);
    });

  }, []);

  return (
    <div className="bg-surface p-6 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Weekly Progress</h3>
        <Select defaultValue="this-week">
          <SelectTrigger className="w-32" data-testid="select-time-range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="last-week">Last Week</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-64 relative">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={200} 
          className="w-full h-full"
          data-testid="progress-chart"
        />
        
        {/* Legend */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-gray-600">Focus Time (hours)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-secondary rounded-full"></div>
            <span className="text-gray-600">Habits Completed (%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
