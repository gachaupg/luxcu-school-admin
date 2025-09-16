# Color Usage Guide for #f7c624

This guide demonstrates all the different ways to use the brand color `#f7c624` (yellow) in the LuxCab School Admin project.

## 🎨 Color Information

- **Hex Value**: `#f7c624`
- **HSL Value**: `47 100% 56%`
- **Token Name**: `tokens.secondary`
- **Tailwind Class**: `bg-brand-yellow`, `text-brand-yellow`, etc.

## 📋 Available Methods

### 1. Using Tokens (Recommended for consistency)

```tsx
import { tokens } from '@/utils/tokens';

// Background
<div style={{ backgroundColor: tokens.secondary }}>Content</div>

// Text color
<p style={{ color: tokens.secondary }}>Text content</p>

// Border
<div style={{ borderColor: tokens.secondary }}>Content</div>
```

### 2. Using Tailwind Brand Colors (Recommended for utility classes)

```tsx
// Background
<div className="bg-brand-yellow">Content</div>

// Text color
<p className="text-brand-yellow">Text content</p>

// Border
<div className="border-brand-yellow">Content</div>

// Hover states
<button className="bg-brand-yellow hover:bg-brand-yellow/90">
  Button
</button>
```

### 3. Using Direct Hex Value

```tsx
// Background
<div style={{ backgroundColor: '#f7c624' }}>Content</div>

// Text color
<p style={{ color: '#f7c624' }}>Text content</p>

// Border
<div style={{ borderColor: '#f7c624' }}>Content</div>
```

### 4. Using Tailwind Arbitrary Values

```tsx
// Background
<div className="bg-[#f7c624]">Content</div>

// Text color
<p className="text-[#f7c624]">Text content</p>

// Border
<div className="border-[#f7c624]">Content</div>

// With opacity
<div className="bg-[#f7c624]/20">20% opacity</div>
<div className="bg-[#f7c624]/40">40% opacity</div>
<div className="bg-[#f7c624]/60">60% opacity</div>
<div className="bg-[#f7c624]/80">80% opacity</div>
```

## 🎯 Common Use Cases

### Buttons

```tsx
// Primary action button
<Button 
  style={{ backgroundColor: tokens.secondary, color: '#000' }}
  className="hover:opacity-90"
>
  Primary Action
</Button>

// Using Tailwind
<Button className="bg-brand-yellow text-black hover:bg-brand-yellow/90">
  Primary Action
</Button>
```

### Badges

```tsx
// Status badge
<Badge 
  style={{ backgroundColor: tokens.secondary, color: '#000' }}
  className="px-3 py-1"
>
  Active
</Badge>

// Using Tailwind
<Badge className="bg-brand-yellow text-black px-3 py-1">
  Active
</Badge>
```

### Icons

```tsx
// Icon with background
<div className="w-12 h-12 bg-brand-yellow rounded-lg flex items-center justify-center">
  <Icon className="h-6 w-6 text-black" />
</div>

// Icon color
<Icon className="h-6 w-6 text-brand-yellow" />
```

### Cards

```tsx
// Card with accent border
<Card className="border-l-4 border-brand-yellow">
  <CardContent>
    <p>Card content</p>
  </CardContent>
</Card>

// Card with accent background
<Card className="bg-brand-yellow/10">
  <CardContent>
    <p>Card content</p>
  </CardContent>
</Card>
```

### Gradients

```tsx
// Linear gradient
<div className="bg-gradient-to-r from-brand-yellow to-brand-blue">
  Gradient content
</div>

// Radial gradient
<div className="bg-gradient-to-br from-brand-yellow via-brand-yellow/80 to-brand-blue">
  Gradient content
</div>
```

### Text Highlights

```tsx
// Highlighted text
<p>
  This is <span className="text-brand-yellow font-semibold">highlighted</span> text.
</p>

// Background highlight
<p>
  This is <span className="bg-brand-yellow/20 px-1 rounded">highlighted</span> text.
</p>
```

## 🎨 Color Combinations

### Primary Brand Colors

- **Yellow**: `#f7c624` (brand-yellow)
- **Blue**: `#10213f` (brand-blue)

### Complementary Colors

```tsx
// Yellow + Blue combination
<div className="bg-gradient-to-r from-brand-yellow to-brand-blue text-white">
  Brand gradient
</div>

// Yellow + White combination
<div className="bg-brand-yellow text-black">
  High contrast
</div>

// Yellow + Gray combination
<div className="bg-brand-yellow/10 text-gray-700">
  Subtle accent
</div>
```

## 🔧 Implementation Examples

### Navigation Elements

```tsx
// Active nav item
<nav className="space-y-2">
  <a className="flex items-center px-4 py-2 text-gray-600 hover:bg-brand-yellow/10 hover:text-brand-yellow rounded-lg">
    Dashboard
  </a>
  <a className="flex items-center px-4 py-2 bg-brand-yellow text-black rounded-lg">
    Active Page
  </a>
</nav>
```

### Status Indicators

```tsx
// Status dot
<div className="flex items-center space-x-2">
  <div className="w-3 h-3 bg-brand-yellow rounded-full"></div>
  <span>Active Status</span>
</div>

// Status badge
<Badge className="bg-brand-yellow/20 text-brand-yellow border-brand-yellow/30">
  Active
</Badge>
```

### Form Elements

```tsx
// Focused input
<Input className="focus:border-brand-yellow focus:ring-brand-yellow/20" />

// Submit button
<Button className="bg-brand-yellow text-black hover:bg-brand-yellow/90">
  Submit
</Button>
```

## 📱 Responsive Design

```tsx
// Responsive color usage
<div className="bg-brand-yellow md:bg-brand-blue lg:bg-brand-yellow">
  Responsive background
</div>

// Conditional styling
<div className={`${isActive ? 'bg-brand-yellow' : 'bg-gray-200'}`}>
  Conditional styling
</div>
```

## 🌙 Dark Mode Support

The brand colors work well in both light and dark modes:

```tsx
// Dark mode compatible
<div className="bg-brand-yellow text-black dark:bg-brand-yellow/90 dark:text-black">
  Works in both modes
</div>
```

## 🎯 Best Practices

1. **Use tokens for consistency**: Import `tokens` from `@/utils/tokens` for programmatic usage
2. **Use Tailwind classes for styling**: Prefer `bg-brand-yellow` over inline styles
3. **Maintain contrast**: Always ensure sufficient contrast with text colors
4. **Use opacity for subtle effects**: Use `/20`, `/40`, etc. for subtle backgrounds
5. **Combine with brand blue**: Use both brand colors together for gradients and accents

## 🔍 Testing

To see all these examples in action, import and use the `ColorUsageExample` component:

```tsx
import ColorUsageExample from '@/components/ColorUsageExample';

// In your component
<ColorUsageExample />
```

This component demonstrates all the different methods of using the `#f7c624` color in your project.




