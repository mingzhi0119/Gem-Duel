# GemDuel v1.0.2 Release Notes

## 💎 UI Improvements
- **Refill Button Update:**
  - Increased font size for better readability.
  - Added a smooth transition animation when the button appears.
- **New Cancel Action:**
  - The "Refill" button now smartly transforms into a "Cancel" button when you select gems, making it easier to clear your selection.
  - Implemented seamless layout animations (using `layoutId`) so the Cancel/Refill button transition feels fluid and doesn't cause surrounding elements to jump.

## 📦 Build & Assets
- **New App Icon:** Updated the Windows application icon to use the specialized `GameIcon.png`.
- **Packaging:** Configured electron-builder to correctly bundle the new icon resource.
