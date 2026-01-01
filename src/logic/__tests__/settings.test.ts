import { describe, it, expect } from 'vitest';
import { RESOLUTION_SETTINGS } from '../../hooks/useSettings';

describe('Settings & Mobile Adaptation', () => {
    it('should have a mobile resolution preset', () => {
        expect(RESOLUTION_SETTINGS).toHaveProperty('mobile');
        expect(RESOLUTION_SETTINGS.mobile.label).toContain('Mobile');
    });

    it('should have smaller scales for mobile preset', () => {
        const mobile = RESOLUTION_SETTINGS.mobile;
        const desktop = RESOLUTION_SETTINGS['2k'];

        // Extract numeric scale values from strings like "scale-[0.45]" or "scale-100"
        const getScaleValue = (scaleStr: string) => {
            if (scaleStr === 'scale-100') return 1.0;
            const match = scaleStr.match(/\[([\d.]+)\]/);
            return match ? parseFloat(match[1]) : 1.0;
        };

        expect(getScaleValue(mobile.boardScale)).toBeLessThan(getScaleValue(desktop.boardScale));
        expect(getScaleValue(mobile.zoneScale)).toBeLessThan(getScaleValue(desktop.zoneScale));

        // Mobile board scale should be 0.45 as defined
        expect(getScaleValue(mobile.boardScale)).toBe(0.45);
    });

    it('should correctly identify small screens logic', () => {
        const checkIsSmallScreen = (width: number) => width < 1024;

        expect(checkIsSmallScreen(375)).toBe(true); // iPhone
        expect(checkIsSmallScreen(1023)).toBe(true); // Boundary
        expect(checkIsSmallScreen(1024)).toBe(false); // Laptop
    });
});
