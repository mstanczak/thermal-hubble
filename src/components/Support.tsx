import { useState } from 'react';
import { Skull, ShieldAlert, ExternalLink, TriangleAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Support() {
    const [breachActive, setBreachActive] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <AnimatePresence>
                {breachActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-yellow-500 overflow-hidden"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(45deg, #eab308, #eab308 20px, #ca8a04 20px, #ca8a04 40px)'
                        }}
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 5, -5, 5, 0],
                            }}
                            transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                repeatType: "reverse"
                            }}
                            className="bg-black text-yellow-500 p-8 rounded-full border-8 border-double border-yellow-500 mb-8 shadow-2xl relative"
                        >
                            <ShieldAlert className="w-32 h-32" />
                            <motion.div
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 0.2, repeat: Infinity }}
                                className="absolute inset-0 bg-red-500 rounded-full mix-blend-overlay"
                            />
                        </motion.div>

                        <motion.h1
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-5xl md:text-7xl font-black text-black uppercase tracking-widest bg-yellow-400 px-8 py-4 border-4 border-black mb-6 transform -rotate-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                        >
                            Contamination Risk
                        </motion.h1>

                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-black bg-opacity-90 p-8 rounded-xl max-w-2xl text-center border-2 border-yellow-500 mx-4"
                        >
                            <p className="text-2xl text-yellow-500 font-bold mb-6 leading-relaxed">
                                Please reference the <br />
                                <span className="text-white text-3xl">Emergency Response Guidebook</span>
                                <br /> immediately!
                            </p>

                            <a
                                href="https://www.phmsa.dot.gov/training/hazmat/erg/emergency-response-guidebook-erg"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xl rounded-lg transition-transform hover:scale-105 animate-pulse shadow-lg border-2 border-red-400"
                            >
                                <ExternalLink className="w-6 h-6" />
                                OPEN ERG GUIDE
                            </a>

                            <button
                                onClick={() => setBreachActive(false)}
                                className="block mx-auto mt-8 text-gray-500 hover:text-white underline text-sm transition-colors"
                            >
                                False Alarm - Dismiss Protocol
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="text-center py-20">
                <div className="mb-12">
                    <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-100">
                        <TriangleAlert className="w-12 h-12 text-red-600" />
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">Hazmat Incident Support</h2>
                    <p className="text-xl text-gray-500 mt-3 font-medium">Use only in case of emergency.</p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setBreachActive(true)}
                    className="group relative inline-flex items-center justify-center gap-4 px-12 py-8 bg-gray-900 text-red-500 text-2xl font-black rounded-3xl border-b-8 border-r-8 border-gray-800 hover:border-red-900 hover:bg-black transition-all shadow-xl hover:shadow-2xl overflow-hidden active:border-b-0 active:border-r-0 active:translate-y-2 active:translate-x-2"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <Skull className="w-12 h-12 group-hover:animate-spin" />
                    <span className="tracking-widest">REPORT RADIOACTIVE SPILL</span>
                    <Skull className="w-12 h-12 group-hover:animate-spin" />
                </motion.button>
            </div>
        </div>
    );
}
