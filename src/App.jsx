import React from 'react';
import VideoPreloader from './components/VideoPreloader';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { MainLayout } from './layouts/MainLayout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Machines } from './pages/Machines';
import { MachineDetails } from './pages/MachineDetails';
import { MachineHistory } from './pages/MachineHistory';
import { Analytics } from './pages/Analytics';
import { OEEAnalysis } from './pages/OEEAnalysis';
import { Alerts } from './pages/Alerts';
import { AlertDetails } from './pages/AlertDetails';
import { Reports } from './pages/Reports';
import { Maintenance } from './pages/Maintenance';
import { Integrations } from './pages/Integrations';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Notifications } from './pages/Notifications';
import { TeamManagement } from './pages/TeamManagement';
import { PlantSettings } from './pages/PlantSettings';
import { About } from './pages/About';

function App() {
  const [showPreloader, setShowPreloader] = React.useState(true);
  const handlePreloaderFinished = () => setShowPreloader(false);

  return (
    <AppProvider>
      {showPreloader ? (
        <VideoPreloader onFinished={handlePreloaderFinished} />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/machines" element={<Machines />} />
              <Route path="/machines/:machineId" element={<MachineDetails />} />
              <Route path="/history" element={<MachineHistory />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/analytics/oee" element={<OEEAnalysis />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/alerts/:alertId" element={<AlertDetails />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/team" element={<TeamManagement />} />
              <Route path="/plant" element={<PlantSettings />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      )}
    </AppProvider>
  );
}

export default App;
