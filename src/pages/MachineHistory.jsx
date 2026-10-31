import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid
} from 'recharts';
import { 
  CheckCircle2, 
  AlertTriangle,
  Activity,
  Wrench,
  Download,
  ChevronRight
} from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { useApp } from '../context/AppContext';
import { EventDetailsModal } from '../components/EventDetailsModal';
import { downloadService } from '../services/downloadService';

export const MachineHistory = () => {
  const [searchParams] = useSearchParams();
  const { machines } = useApp();
  const initialMachine = searchParams.get('machine') || 'CNC-01';

  const [selectedMachineId, setSelectedMachineId] = useState(initialMachine);
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const selectedMachine = machines.find(m => m.id === selectedMachineId) || machines[0];

  // 7-day temperature history data matching reference image
  const historyChartData = [
    { day: 'Mon', actual: 68, target: 70, baseline: 65, vibration: 1.8 },
    { day: 'Tue', actual: 72, target: 70, baseline: 65, vibration: 1.9 },
    { day: 'Wed', actual: 74, target: 70, baseline: 65, vibration: 2.1 },
    { day: 'Thu', actual: 82, target: 70, baseline: 65, vibration: 3.1 },
    { day: 'Fri', actual: 79, target: 70, baseline: 65, vibration: 2.4 },
    { day: 'Sat', actual: 76, target: 70, baseline: 65, vibration: 2.0 },
    { day: 'Sun', actual: 75, target: 70, baseline: 65, vibration: 1.9 },
  ];

  const eventsList = [
    {
      id: 'e1',
      time: '12:45',
      date: 'Today',
      severity: 'High',
      machineId: selectedMachine.id,
      zone: selectedMachine.zone,
      title: 'Temp. exceeded threshold',
      description: 'Zone 3 • 12°C above target. Localized cooling line flagged.',
      icon: AlertTriangle,
      color: 'text-[#FF4D0A] bg-orange-50'
    },
    {
      id: 'e2',
      time: '10:32',
      date: 'Today',
      severity: 'Medium',
      machineId: selectedMachine.id,
      zone: selectedMachine.zone,
      title: 'Vibration spike detected',
      description: 'Zone 2 • 8.4 mm/s harmonic transient registered.',
      icon: Activity,
      color: 'text-amber-500 bg-amber-50'
    },
    {
      id: 'e3',
      time: '08:17',
      date: 'Today',
      severity: 'Low',
      machineId: selectedMachine.id,
      zone: selectedMachine.zone,
      title: 'Process back to normal',
      description: 'Zone 1 • Stable thermal equilibrium maintained.',
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-50'
    },
    {
      id: 'e4',
      time: '06:50',
      date: 'Today',
      severity: 'Info',
      machineId: selectedMachine.id,
      zone: selectedMachine.zone,
      title: 'Maintenance completed',
      description: 'Zone 3 • Routine bearing inspection signed off.',
      icon: Wrench,
      color: 'text-blue-500 bg-blue-50'
    }
  ];

  const handleExportCSV = () => {
    downloadService.downloadMachineReportCSV(selectedMachine);
  };

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader title="History" showBack backPath="/machines" />

      <div className="p-4 space-y-4">
        {/* Machine & Range Selectors matching reference image */}
        <div className="flex items-center space-x-2">
          {/* Machine Selector */}
          <div className="flex-1 relative">
            <select
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-soft focus:outline-none focus:ring-2 focus:ring-[#FF4D0A]/20"
            >
              {machines.map(m => (
                <option key={m.id} value={m.id}>
                  {m.id} — {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range Selector */}
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="pl-3 pr-8 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-soft focus:outline-none focus:ring-2 focus:ring-[#FF4D0A]/20"
            >
              <option value="24h">24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>

          {/* Download CSV */}
          <button
            onClick={handleExportCSV}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-[#FF4D0A] shadow-soft"
            title="Export CSV Telemetry"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* History Chart matching reference image */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900">Temperature (°C)</span>
              <span className="text-[10px] text-slate-400 font-mono">[{selectedMachine.id}]</span>
            </div>

            <div className="flex items-center space-x-3 text-[10px] font-semibold">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#FF4D0A]" />
                <span className="text-slate-600">Actual</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span className="text-slate-600">Target</span>
              </div>
            </div>
          </div>

          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#102438', 
                    borderRadius: '12px', 
                    border: 'none', 
                    color: '#fff', 
                    fontSize: '11px' 
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#0EA5E9" 
                  strokeWidth={2} 
                  strokeDasharray="4 4" 
                  dot={false} 
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#FF4D0A" 
                  strokeWidth={2.5} 
                  dot={{ r: 3.5, fill: '#FF4D0A', strokeWidth: 1.5, stroke: '#fff' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Log matching reference image */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Chronological Event Log
            </h2>
            <span className="text-[11px] font-semibold text-slate-400">
              {eventsList.length} Events
            </span>
          </div>

          <div className="space-y-3.5">
            {eventsList.map((evt) => {
              const Icon = evt.icon;
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="flex items-start space-x-3 cursor-pointer group hover:bg-slate-50 p-2 -mx-2 rounded-2xl transition-colors"
                >
                  <div className="text-xs font-mono font-bold text-slate-500 mt-1 flex-shrink-0">
                    {evt.time}
                  </div>

                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${evt.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#FF4D0A] transition-colors truncate">
                      {evt.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {evt.description}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#FF4D0A] transition-colors mt-1.5 flex-shrink-0" />
                </div>
              );
            })}
          </div>

          <button
            onClick={() => downloadService.downloadMachineReportCSV(selectedMachine)}
            className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center space-x-1.5"
          >
            <span>View Full Machine Audit Log</span>
          </button>
        </div>
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={Boolean(selectedEvent)}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};
