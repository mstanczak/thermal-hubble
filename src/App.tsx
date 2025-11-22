import { Layout } from './components/Layout';
import { SettingsPanel } from './components/SettingsPanel';
import { HazmatForm } from './components/HazmatForm';
import { useState, useEffect } from 'react';
import { Settings, ArrowLeft, AlertTriangle, X } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState<'form' | 'settings'>('form');
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const acknowledged = localStorage.getItem('ai_disclaimer_acknowledged');
    if (!acknowledged) {
      setShowDisclaimer(true);
    }
  }, []);

  const handleDismissDisclaimer = () => {
    localStorage.setItem('ai_disclaimer_acknowledged', 'true');
    setShowDisclaimer(false);
  };

  return (
    <Layout onSettingsClick={() => setCurrentPage('settings')}>
      <div className="max-w-4xl mx-auto">
        {currentPage === 'form' ? (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">New Shipment Validation</h2>
                <p className="text-gray-600">
                  Enter shipment details below to validate against carrier regulations and compliance rules.
                </p>

                {showDisclaimer && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start relative">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800 pr-6">
                      <p className="font-semibold mb-1">AI Disclaimer</p>
                      <p>
                        This tool uses Artificial Intelligence to estimate compliance and provide suggestions.
                        It is intended only as a knowledge resource to help troubleshoot shipping issues or confirm
                        information for verified hazmat shippers.
                      </p>
                      <p className="mt-2 font-medium">
                        Please acknowledge that AI can make mistakes and "hallucinate" incorrect information even with
                        a 100% confidence score, just as humans can. Always verify with official regulations.
                      </p>
                    </div>
                    <button
                      onClick={handleDismissDisclaimer}
                      className="absolute top-2 right-2 text-amber-400 hover:text-amber-700 transition-colors"
                      title="Dismiss and don't show again"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
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
