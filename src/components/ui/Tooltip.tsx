import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    // Using a simple state toggle mechanism that works for both click (mobile) and hover (desktop)
    // For a stricter separation, we could detect touch capabilities, but hybrid handling is often smoother.

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => window.innerWidth >= 768 && setIsVisible(true)}
            onMouseLeave={() => window.innerWidth >= 768 && setIsVisible(false)}
            onClick={() => setIsVisible(!isVisible)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg -translate-x-1/2 left-1/2 bottom-full mb-2 w-max max-w-xs whitespace-normal text-center"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when tapping the tooltip content itself if needed
                    >
                        {content}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
