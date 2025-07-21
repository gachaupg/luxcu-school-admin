# User Preferences Implementation

This document describes the implementation of user preferences functionality in the school admin application.

## Overview

The preferences system allows users to customize their dashboard experience and control data-related features. All preferences are stored in Redux state and synchronized with the backend API.

## Features Implemented

### Dashboard Preferences

1. **Show Analytics** (`showAnalytics`)

   - Controls whether analytics and statistics cards are displayed on the dashboard
   - When disabled, the `StatOverviewCards` component is hidden
   - Default: `true`

2. **Show Recent Activity** (`showRecentActivity`)

   - Controls whether recent trips table is displayed on the dashboard
   - When disabled, the `RecentTripsTable` component is hidden
   - Default: `true`

3. **Show Notifications Panel** (`showNotificationsPanel`)
   - Controls whether the notifications panel is displayed on the dashboard
   - When disabled, the notifications panel is hidden
   - Default: `true`

### Data Preferences

1. **Allow Data Export** (`allowDataExport`)

   - Controls whether users can export school data and reports
   - Can be used to conditionally show/hide export buttons throughout the app
   - Default: `true`

2. **Auto Backup** (`autoBackup`)
   - Controls whether school data is automatically backed up
   - Can be used to control backup scheduling and execution
   - Default: `true`

### Theme & Appearance

1. **Theme** (`theme`)

   - Controls the application theme: 'light', 'dark', or 'auto'
   - Default: 'light'

2. **Language** (`language`)
   - Controls the application language: 'en', 'sw', 'fr'
   - Default: 'en'

## Technical Implementation

### Redux Store Structure

```typescript
interface UserPreferences {
  // Dashboard Preferences
  showAnalytics: boolean;
  showRecentActivity: boolean;
  showNotificationsPanel: boolean;

  // Data Preferences
  allowDataExport: boolean;
  autoBackup: boolean;

  // Theme & Appearance
  theme: "light" | "dark" | "auto";
  language: "en" | "sw" | "fr";
}
```

### Files Modified/Created

1. **`src/redux/slices/preferencesSlice.ts`** (NEW)

   - Redux slice for managing user preferences
   - Async thunks for fetching and updating preferences
   - Local state management with immediate updates

2. **`src/redux/store.ts`** (MODIFIED)

   - Added preferences reducer to the store

3. **`src/utils/api.ts`** (MODIFIED)

   - Added `PREFERENCES` endpoint

4. **`src/pages/Settings.tsx`** (MODIFIED)

   - Updated Personalization tab to use real preferences state
   - Added loading states and error handling
   - Implemented real-time preference updates

5. **`src/pages/Overview.tsx`** (MODIFIED)
   - Dashboard now respects user preferences
   - Conditional rendering based on preference settings
   - Added notifications panel component

### API Endpoints

**Note: API endpoints are not yet implemented on the server. The app currently uses localStorage for persistence.**

- `GET /api/preferences/` - Fetch user preferences (TODO)
- `PUT /api/preferences/` - Update user preferences (TODO)

### Current Implementation

- **LocalStorage Persistence** - Preferences are saved to browser localStorage
- **Default Values** - Fallback to default preferences if none are stored
- **API Ready** - Code is structured to easily switch to API calls when backend is ready

### Usage Examples

#### In Components

```typescript
import { useAppSelector } from "@/redux/hooks";

const MyComponent = () => {
  const { preferences } = useAppSelector((state) => state.preferences);

  // Conditionally render based on preferences
  if (!preferences.showAnalytics) {
    return null;
  }

  return <AnalyticsComponent />;
};
```

#### Updating Preferences

```typescript
import { useAppDispatch } from "@/redux/hooks";
import { updateUserPreferences } from "@/redux/slices/preferencesSlice";

const MyComponent = () => {
  const dispatch = useAppDispatch();

  const handleToggleAnalytics = async () => {
    try {
      await dispatch(updateUserPreferences({ showAnalytics: false })).unwrap();
      // Success handling
    } catch (error) {
      // Error handling
    }
  };
};
```

## Dashboard Behavior

The dashboard (Overview page) now dynamically shows/hides sections based on user preferences:

- **Analytics Section**: Shows statistics cards when `showAnalytics` is true
- **Recent Activity Section**: Shows recent trips table when `showRecentActivity` is true
- **Notifications Panel**: Shows notifications when `showNotificationsPanel` is true
- **Empty State**: Shows a helpful message when all sections are disabled

## Future Enhancements

1. **Theme Implementation**: Implement actual theme switching functionality
2. **Language Support**: Add internationalization (i18n) support
3. **Data Export**: Implement actual data export functionality using the `allowDataExport` preference
4. **Auto Backup**: Implement actual backup scheduling using the `autoBackup` preference
5. **Preference Persistence**: Add persistence for preferences across sessions
6. **School-level Preferences**: Allow different preferences for different schools

## Testing

To test the preferences functionality:

1. Navigate to Settings → Personalization tab
2. Toggle different preferences on/off
3. Navigate to the Overview page to see changes take effect
4. Refresh the page to verify preferences persist
5. Check browser network tab to see API calls being made

## Notes

- Preferences are fetched on app initialization
- Changes are immediately reflected in the UI for better UX
- **Currently uses localStorage for persistence** (API not yet implemented)
- Error handling includes user-friendly toast notifications
- Loading states are shown during preference updates
- **API Ready** - Easy to switch to backend API when available
