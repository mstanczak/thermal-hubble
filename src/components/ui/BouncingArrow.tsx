import { motion } from 'framer-motion';

interface BouncingArrowProps {
    direction?: 'up' | 'down' | 'left' | 'right';
    className?: string;
    color?: string;
}

export function BouncingArrow({ direction = 'down', className = '', color = '#2563eb' }: BouncingArrowProps) {
    const rotation = {
        up: 180,
        down: 0,
        left: 90,
        right: -90
    }[direction];

    return (
        <motion.div
            className={`absolute z-50 pointer-events-none ${className}`}
            animate={{
                y: direction === 'up' || direction === 'down' ? [0, -10, 0] : 0,
                x: direction === 'left' || direction === 'right' ? [0, -10, 0] : 0
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            style={{
                width: 40,
                height: 40,
                // Position centering handled by parent
            }}
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                {/* Dashed Shaft */}
                <path
                    d="M12 2L12 15"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="4 4"
                />
                {/* Solid Arrowhead */}
                <path
                    d="M12 22L7 16H17L12 22Z"
                    fill={color}
                />
            </svg>
        </motion.div>
    );
}
