import { Layout } from './components/Layout';
import { SettingsPanel } from './components/SettingsPanel';
import { HazmatForm } from './components/HazmatForm';
import { DGValidator } from './components/DGValidator';
import { Documentation } from './components/Documentation';
import { Support } from './components/Support';
import { ComplianceBanner } from './components/ComplianceBanner';
import { ComplianceInfo } from './components/ComplianceInfo';
import { useState, useEffect } from 'react';
import { Settings, ArrowLeft, Scan } from 'lucide-react';
import clsx from 'clsx';

function App() {
  const [currentPage, setCurrentPage] = useState<'form' | 'settings' | 'validator' | 'documentation' | 'support' | 'compliance-info'>('form');
  const [isComplianceVerified, setIsComplianceVerified] = useState(false);
  const [previousPage, setPreviousPage] = useState<'form' | 'validator'>('form');

  useEffect(() => {
    // Check local storage for compliance banner
    const complianceAcknowledged = localStorage.getItem('thermal_hubble_compliance_acknowledged');
    if (complianceAcknowledged) {
      setIsComplianceVerified(true);
    }
  }, []);

  const handleComplianceAccept = () => {
    setIsComplianceVerified(true);
  };

  const handleLearnMore = () => {
    if (currentPage !== 'compliance-info') {
      // Save where we came from if it's one of the main tools
      if (currentPage === 'form' || currentPage === 'validator') {
        setPreviousPage(currentPage);
      }
      setCurrentPage('compliance-info');
    }
  };

  const handleBackFromInfo = () => {
    setCurrentPage(previousPage);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'compliance-info':
        return <ComplianceInfo onBack={handleBackFromInfo} />;
      case 'settings':
        return (
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
        );
      case 'documentation':
        return <Documentation />;
      case 'support':
        return <Support />;
      case 'validator':
      case 'form':
      default:
        return (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">New Shipment Validation</h2>
                <p className="text-gray-600">
                  Enter shipment details below to validate against carrier regulations and compliance rules.
                </p>

                {/* Disclaimer removed as per user request */}
              </div>
              <button
                onClick={() => setCurrentPage('settings')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>

            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setCurrentPage('form')}
                className={clsx(
                  "flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all text-center",
                  currentPage === 'form'
                    ? "border-purple-600 bg-purple-50 text-purple-700"
                    : "border-gray-200 hover:border-purple-200 text-gray-600"
                )}
              >
                New Shipment Form
              </button>
              <button
                onClick={() => setCurrentPage('validator')}
                className={clsx(
                  "flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all text-center flex items-center justify-center gap-2",
                  currentPage === 'validator'
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-blue-200 text-gray-600"
                )}
              >
                <Scan className="w-4 h-4" />
                DG Validator (OCR)
              </button>
            </div>

            {currentPage === 'form' ? (
              <HazmatForm isSubmitDisabled={!isComplianceVerified} />
            ) : (
              <DGValidator />
            )}
          </>
        );
    }
  };

  return (
    <Layout
      onSettingsClick={() => setCurrentPage('settings')}
      onDocumentationClick={() => setCurrentPage('documentation')}
      onSupportClick={() => setCurrentPage('support')}
      onLogoClick={() => setCurrentPage('form')}
      onComplianceClick={handleLearnMore}
    >
      {/* Show banner only if not verified AND not currently looking at the info page */}
      {(!isComplianceVerified && currentPage !== 'compliance-info') && (
        <ComplianceBanner
          onAccept={handleComplianceAccept}
          onLearnMore={handleLearnMore}
        />
      )}
      <div className="max-w-4xl mx-auto">
        {renderContent()}
      </div>
    </Layout>
  );
}

export default App;
