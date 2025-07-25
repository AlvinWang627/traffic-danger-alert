# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native Expo TypeScript app that provides traffic danger alerts by monitoring the user's location against known dangerous road segments in Taipei. The app runs in background and sends notifications when users approach accident hotspots.

## Development Commands

### Core Commands
- `npm start` or `expo start` - Start the development server
- `npm run android` or `expo start --android` - Run on Android device/emulator
- `npm run ios` or `expo start --ios` - Run on iOS device/simulator (if supported)
- `npm run web` or `expo start --web` - Run in web browser
- `npm run lint` or `expo lint` - Run ESLint code linting

### Development Workflow
- Use `npm start` to start the development server, then scan QR code with Expo Go app
- For testing background services, use physical Android device as emulators may not support background location properly
- No test framework is currently configured - tests would need to be set up first

## Architecture Overview

### App Structure (Expo Router)
- **app/_layout.tsx** - Root layout with navigation stack and theme provider
- **app/index.tsx** - Main home screen with monitoring controls and status display
- **app/settings.tsx** - Settings screen for alert distance, sound, and background service configuration
- **app/battery-optimization.tsx** - Battery optimization settings for background service
- **app/performance-*.tsx** - Performance monitoring and settings screens

### Core Services Architecture
The app uses a service-oriented architecture with singleton patterns:

**BackgroundService** (`src/services/BackgroundService.ts`)
- Singleton service managing background location monitoring and notifications
- Integrates with Expo Background Fetch and Task Manager
- Handles foreground/background location permissions and updates
- Coordinates with BatteryOptimizationService for power efficiency

**DangerSpotService** (`src/services/DangerSpotService.ts`)
- Manages danger spot data loaded from `assets/accident_hotspots_grouped/113/taipei.json`
- Provides distance calculation using Haversine formula
- Offers methods to check nearby danger spots within configurable radius

**BatteryOptimizationService** (`src/services/BatteryOptimizationService.ts`)
- Optimizes background location updates based on movement patterns
- Adapts location accuracy and update intervals dynamically
- Tracks movement statistics and provides battery usage recommendations

### Custom Hooks
- **useLocation** (`hooks/useLocation.ts`) - Location tracking with foreground/background intervals
- **useBackgroundService** - Background service management and status
- **useAlerts** - Danger spot detection and alert management
- **usePerformanceMonitor** - Performance metrics and monitoring

### Key Integrations
- **Expo Location** - GPS positioning with background support
- **Expo Notifications** - Push notifications for danger alerts
- **Expo Task Manager** - Background task management
- **Expo Background Fetch** - Periodic background updates
- **AsyncStorage** - Settings persistence
- **Expo Audio/Haptics** - Sound and vibration alerts

### Data Flow
1. Location updates trigger through useLocation hook or background tasks
2. Current position is checked against danger spots using DangerSpotService
3. If dangerous area detected, BackgroundService sends notification
4. BatteryOptimizationService adjusts update frequency based on movement patterns
5. Settings are persisted via AsyncStorage and affect service behavior

## Development Notes

### Location Services
- The app requires both foreground and background location permissions
- Background location uses different update intervals (10s foreground, 30s background)
- Location accuracy can be adjusted based on battery optimization settings

### Background Processing
- Background tasks are registered using Expo Task Manager
- Background fetch runs every 15 minutes minimum
- Location updates continue when app is backgrounded or screen is off

### Data Source
- Accident data is stored in JSON format under `assets/accident_hotspots_grouped/113/taipei.json`
- Data represents Taipei city accident hotspots with latitude/longitude coordinates
- The service calculates distances in meters using Haversine formula

### Settings Management
- All user settings are stored in AsyncStorage
- Settings include: alert distance (50-500m), sound enabled, background service enabled
- Battery optimization settings are managed separately through BatteryOptimizationService

### Performance Monitoring
- The app includes comprehensive performance monitoring components
- PerformanceMonitor tracks memory usage, location updates, and battery optimization
- Performance settings allow fine-tuning of update intervals and accuracy

## Important Considerations

- Background location requires careful permission handling and user consent
- Battery optimization features help balance accuracy with power consumption
- The app is designed primarily for Android deployment to Google Play Store
- Notification permissions are required for background alerts
- Physical device testing is recommended for background service functionality