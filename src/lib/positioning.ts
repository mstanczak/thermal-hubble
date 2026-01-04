/**
 * positioning.ts
 * Utility for calculating viewport-aware positioning for tooltips and popovers.
 */

export type Placement = 'top' | 'bottom' | 'left' | 'right';

export interface PositionResult {
    x: number;
    y: number;
    placement: Placement;
    arrowOffset: number; // Offset from the start of the tooltip/popover
}

interface Rect {
    top: number;
    left: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
}

/**
 * Calculates the best position for a floating element relative to a target element,
 * ensuring it stays within the viewport.
 * 
 * @param targetRect The bounding client rect of the target element.
 * @param floaterRect The bounding client rect of the floating element (tooltip).
 * @param preferredPlacement The preferred side to place the floater.
 * @param offset Distance between target and floater in pixels.
 * @param padding Minimum distance from viewport edges in pixels.
 */
export function calculatePosition(
    targetRect: DOMRect | Rect,
    floaterRect: DOMRect | Rect,
    preferredPlacement: Placement = 'top',
    offset: number = 8,
    padding: number = 10
): PositionResult {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let placement = preferredPlacement;
    let x = 0;
    let y = 0;

    // 1. Calculate initial position based on preference
    const getCoords = (p: Placement): { x: number, y: number } => {
        switch (p) {
            case 'top':
                return {
                    x: targetRect.left + (targetRect.width / 2) - (floaterRect.width / 2),
                    y: targetRect.top - floaterRect.height - offset
                };
            case 'bottom':
                return {
                    x: targetRect.left + (targetRect.width / 2) - (floaterRect.width / 2),
                    y: targetRect.bottom + offset
                };
            case 'left':
                return {
                    x: targetRect.left - floaterRect.width - offset,
                    y: targetRect.top + (targetRect.height / 2) - (floaterRect.height / 2)
                };
            case 'right':
                return {
                    x: targetRect.right + offset,
                    y: targetRect.top + (targetRect.height / 2) - (floaterRect.height / 2)
                };
        }
    };

    let coords = getCoords(placement);

    // 2. Flip Logic: Check if it fits, if not, try opposite
    const fits = (p: Placement, c: { x: number, y: number }): boolean => {
        switch (p) {
            case 'top': return c.y >= padding;
            case 'bottom': return c.y + floaterRect.height <= viewportHeight - padding;
            case 'left': return c.x >= padding;
            case 'right': return c.x + floaterRect.width <= viewportWidth - padding;
        }
    };

    if (!fits(placement, coords)) {
        const opposites: Record<Placement, Placement> = {
            'top': 'bottom', 'bottom': 'top', 'left': 'right', 'right': 'left'
        };
        const newPlacement = opposites[placement];
        const newCoords = getCoords(newPlacement);

        if (fits(newPlacement, newCoords)) {
            placement = newPlacement;
            coords = newCoords;
        }
    }

    // 3. Shift/Clamp Logic (Cross-axis)
    // Ensure the tooltip doesn't go off screen horizontally (for top/bottom) or vertically (for left/right)
    x = coords.x;
    y = coords.y;

    if (placement === 'top' || placement === 'bottom') {
        // Clamp X
        const minX = padding;
        const maxX = viewportWidth - floaterRect.width - padding;
        x = Math.max(minX, Math.min(x, maxX));
    } else {
        // Clamp Y
        const minY = padding;
        const maxY = viewportHeight - floaterRect.height - padding;
        y = Math.max(minY, Math.min(y, maxY));
    }

    // 4. Calculate Arrow Offset
    // The arrow should point to the center of the target
    // We calculate where the center of the target is relative to the *new* tooltip position
    let arrowOffset = 0;
    if (placement === 'top' || placement === 'bottom') {
        const targetCenter = targetRect.left + (targetRect.width / 2);
        // Relative to tooltip left edge
        arrowOffset = targetCenter - x;
    } else {
        const targetCenter = targetRect.top + (targetRect.height / 2);
        // Relative to tooltip top edge
        arrowOffset = targetCenter - y;
    }

    return { x, y, placement, arrowOffset };
}
