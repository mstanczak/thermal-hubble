import { Layout } from './components/Layout';
import { SettingsPanel } from './components/SettingsPanel';
import { HazmatForm } from './components/HazmatForm';
import { useState } from 'react';
import { Settings, ArrowLeft } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState<'form' | 'settings'>('form');

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {currentPage === 'form' ? (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">New Shipment Validation</h2>
                <p className="text-gray-600">
                  Enter shipment details below to validate against carrier regulations and compliance rules.
                </p>
              </div>
              <button
                onClick={() => setCurrentPage('settings')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>

            <HazmatForm />
          </>
        ) : (
          <>
            <div className="mb-8 flex items-center gap-4">
              <button
                onClick={() => setCurrentPage('form')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Form
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
                <p className="text-gray-600">
                  Configure AI settings and default values for your shipments.
                </p>
              </div>
            </div>

            <SettingsPanel />
          </>
        )}
      </div>
    </Layout>
  );
}

export default App;
