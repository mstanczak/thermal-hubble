import { Book, ExternalLink, Package, Truck } from 'lucide-react';

export function Documentation() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <Book className="w-8 h-8 text-blue-600" />
                    Hazmat Documentation Resources
                </h1>
                <p className="text-gray-600 mb-8 max-w-2xl">
                    Access official carrier guidelines and regulatory information to ensure your hazardous materials shipments are compliant.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* FedEx Section */}
                    <div className="p-6 rounded-xl border border-gray-200 bg-gray-50 bg-gradient-to-br from-purple-50 to-white hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-purple-100 p-2 rounded-lg">
                                <Truck className="w-6 h-6 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">FedEx Ground/Express</h2>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                            Official requirements for shipping dangerous goods via FedEx Express and Ground services.
                        </p>
                        <a
                            href="https://www.fedex.com/en-us/service-guide/hazardous-materials/resources.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-purple-600 font-medium hover:text-purple-700 hover:underline"
                        >
                            View FedEx Service Guide
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>

                    {/* UPS Section */}
                    <div className="p-6 rounded-xl border border-gray-200 bg-gray-50 bg-gradient-to-br from-amber-50 to-white hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-amber-100 p-2 rounded-lg">
                                <Package className="w-6 h-6 text-amber-700" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">UPS</h2>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                            UPS Guide for Shipping Ground and Air Hazardous Materials (Domestic & International).
                        </p>
                        <a
                            href="https://www.ups.com/us/en/support/shipping-support/shipping-special-care-regulated-items/hazardous-materials-guide.page"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-amber-700 font-medium hover:text-amber-800 hover:underline"
                        >
                            View UPS Hazmat Guide
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Need 49 CFR / IATA Regulations?</h3>
                <p className="text-blue-800 text-sm">
                    While carrier guides are essential, always refer to the official <a href="https://www.phmsa.dot.gov/regulations/title49/b/2/1" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-blue-950">49 CFR</a> (Code of Federal Regulations) or current IATA Dangerous Goods Regulations for legal compliance.
                </p>
            </div>
        </div>
    );
}
