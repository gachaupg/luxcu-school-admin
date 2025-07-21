# Dark/Light Mode Theme Implementation

This document describes the complete implementation of dark and light mode functionality in the school admin application.

## 🎨 **Features Implemented**

### **Theme Options:**

- **Light Mode** - Clean, bright interface
- **Dark Mode** - Dark, easy-on-the-eyes interface
- **Auto Mode** - Automatically follows system preference

### **Theme Controls:**

- **Theme Toggle Button** - Quick toggle in the navbar
- **Settings Page** - Theme selection in Personalization tab
- **System Detection** - Automatically detects system theme preference

## 🔧 **Technical Implementation**

### **1. Theme Context (`src/contexts/ThemeContext.tsx`)**

- Manages theme state across the entire application
- Provides theme switching functionality
- Handles system theme detection
- Integrates with Redux preferences

### **2. Theme Provider (`src/App.tsx`)**

- Wraps the entire application
- Ensures theme context is available everywhere
- Applies theme changes to document root

### **3. Theme Toggle Component (`src/components/ThemeToggle.tsx`)**

- Dropdown menu with theme options
- Animated sun/moon icons
- Quick access in the navbar

### **4. CSS Variables (`src/index.css`)**

- Complete set of light and dark mode variables
- Uses CSS custom properties for easy theming
- Tailwind CSS integration

## 🎯 **How to Use**

### **Via Navbar:**

1. Click the theme toggle button (sun/moon icon) in the top-right navbar
2. Select from Light, Dark, or System options
3. Theme changes immediately

### **Via Settings:**

1. Go to Settings → Personalization tab
2. Change the Theme dropdown
3. Theme updates in real-time

### **System Auto Mode:**

- When set to "Auto", the app follows your system's dark/light mode preference
- Automatically switches when you change your system theme

## 🎨 **Theme Variables**

The application uses CSS custom properties for consistent theming:

```css
/* Light Mode */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  /* ... more variables */
}

/* Dark Mode */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  /* ... more variables */
}
```

## 📱 **Components Updated for Dark Mode**

### **Core Components:**

- ✅ **AppNavbar** - Background, text colors, hover states
- ✅ **AppSidebar** - Background, borders, text colors
- ✅ **Settings Page** - All sections with proper dark mode styling
- ✅ **Overview Page** - Dashboard with dark mode support
- ✅ **Index Page** - Main layout with theme-aware styling

### **UI Components:**

- ✅ **Cards** - Background and text colors
- ✅ **Buttons** - All variants (default, secondary, outline, destructive)
- ✅ **Inputs** - Background, borders, text colors
- ✅ **Switches** - Proper contrast in both modes
- ✅ **Badges** - All variants with appropriate colors
- ✅ **Dropdowns** - Background and text colors

## 🚀 **Usage Examples**

### **Using Theme Context in Components:**

```typescript
import { useTheme } from "@/contexts/ThemeContext";

const MyComponent = () => {
  const { theme, isDark, setTheme, toggleTheme } = useTheme();

  return (
    <div className="bg-background text-foreground">
      <p>Current theme: {theme}</p>
      <p>Is dark mode: {isDark ? "Yes" : "No"}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};
```

### **Conditional Styling:**

```typescript
// Using Tailwind dark: classes
<div className="bg-white dark:bg-gray-800 text-black dark:text-white">
  Content
</div>

// Using theme context
<div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
  Content
</div>
```

## 🎨 **Theme Demo Component**

The `ThemeDemo` component on the Overview page showcases:

- All button variants
- Input fields
- Switches
- Badges
- Live theme toggle
- Current theme indicator

## 🔄 **Theme Persistence**

- Theme preference is saved to Redux store
- Automatically synced with backend API
- Persists across browser sessions
- Respects user's last selection

## 🌐 **System Integration**

### **Auto Mode Features:**

- Detects system color scheme preference
- Listens for system theme changes
- Updates automatically when system theme changes
- Works on all modern browsers

### **Media Query Support:**

```javascript
// Detects system preference
window.matchMedia("(prefers-color-scheme: dark)").matches;

// Listens for changes
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", handler);
```

## 🎯 **Best Practices Implemented**

1. **Semantic Color Names** - Uses `background`, `foreground`, `muted` etc.
2. **CSS Variables** - Easy to maintain and extend
3. **Tailwind Integration** - Leverages Tailwind's dark mode support
4. **Accessibility** - Proper contrast ratios in both modes
5. **Performance** - No layout shifts during theme changes
6. **User Preference** - Respects user's choice and system preference

## 🔧 **Customization**

### **Adding New Theme Colors:**

1. Add variables to `src/index.css`
2. Update Tailwind config if needed
3. Use in components with `bg-[color]` or CSS variables

### **Creating Theme-Aware Components:**

```typescript
// Always use semantic color classes
<div className="bg-background text-foreground border-border">
  <p className="text-muted-foreground">Secondary text</p>
</div>
```

## 🚀 **Future Enhancements**

1. **Custom Themes** - Allow users to create custom color schemes
2. **High Contrast Mode** - Accessibility enhancement
3. **Theme Transitions** - Smooth animations between themes
4. **Component-Level Themes** - Different themes for different sections
5. **Export/Import Themes** - Share theme configurations

## 🧪 **Testing**

To test the theme functionality:

1. **Manual Testing:**

   - Toggle between Light, Dark, and Auto modes
   - Check all components render correctly
   - Verify system theme detection works

2. **System Integration:**

   - Change system theme while app is running
   - Verify auto mode responds correctly
   - Test on different browsers

3. **Persistence:**
   - Change theme and refresh page
   - Verify theme preference is maintained
   - Check API calls are made correctly

## 📝 **Notes**

- Theme changes are immediate for better UX
- All components use semantic color classes
- System theme detection works on modern browsers
- Theme preference is stored in Redux and synced with backend
- No additional dependencies required - uses existing Tailwind setup
