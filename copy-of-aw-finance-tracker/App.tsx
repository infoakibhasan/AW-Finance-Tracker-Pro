
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { FinanceProvider } from './store/FinanceContext';
import Layout from './components/Layout';
import Dashboard from './screens/Dashboard';
import AddEntry from './screens/AddEntry';
import Transfers from './screens/Transfers';
import Reports from './screens/Reports';
import Trash from './screens/Trash';
import Settings from './screens/Settings';
import Calculator from './screens/Calculator';
import RemittanceDashboard from './screens/RemittanceDashboard';
import TPAssistant from './screens/TPAssistant';

const App: React.FC = () => {
  return (
    <Router>
      <FinanceProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddEntry />} />
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/trash" element={<Trash />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/remittance-dashboard" element={<RemittanceDashboard />} />
            <Route path="/tp-assistant" element={<TPAssistant />} />
          </Routes>
        </Layout>
      </FinanceProvider>
    </Router>
  );
};

export default App;
