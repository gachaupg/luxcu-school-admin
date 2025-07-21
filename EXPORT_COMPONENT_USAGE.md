# ExportDropdown Component Usage Guide

This document explains how to use the reusable `ExportDropdown` component across all pages in the school admin application.

## Overview

The `ExportDropdown` component provides a consistent way to export data in three formats:
- **Excel (CSV)** - For spreadsheet applications
- **PDF (HTML)** - For document viewing and printing
- **Word (DOC)** - For word processing applications

## Component Location

The component is located at: `src/components/ExportDropdown.tsx`

## Basic Usage

### 1. Import the Component

```typescript
import { ExportDropdown } from "@/components/ExportDropdown";
```

### 2. Use the Component

```typescript
<ExportDropdown
  data={{
    headers: ["Column 1", "Column 2", "Column 3"],
    data: yourDataArray,
    fileName: "export_filename",
    title: "Report Title"
  }}
  className="your-custom-classes"
  variant="outline"
  size="default"
/>
```

## Props Interface

```typescript
interface ExportData {
  headers: string[];        // Column headers for the export
  data: any[];             // Array of data objects
  fileName: string;        // Base filename for the export
  title?: string;          // Optional title for the report
}

interface ExportDropdownProps {
  data: ExportData;        // Required: Export data configuration
  className?: string;      // Optional: Custom CSS classes
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}
```

## Implementation Examples

### Parents Page Example

```typescript
<ExportDropdown
  data={{
    headers: [
      "Name",
      "Email", 
      "Phone Number",
      "Address",
      "Emergency Contact",
      "Secondary Phone",
      "Preferred Contact Method",
      "Authorized Pickup Persons"
    ],
    data: filteredParents.map((parent) => ({
      name: `${parent.user_data?.first_name || ""} ${parent.user_data?.last_name || ""}`,
      email: parent.user_data?.email || parent.user_email || "",
      phone_number: parent.user_data?.phone_number || parent.phone_number || "",
      address: parent.address || "",
      emergency_contact: parent.emergency_contact || "",
      secondary_phone: parent.secondary_phone || "",
      preferred_contact_method: parent.preferred_contact_method || "",
      authorized_pickup_persons: parent.authorized_pickup_persons?.persons
        ?.map(person => `${person.name} (${person.relation})`)
        .join("; ") || "None"
    })),
    fileName: "parents_export",
    title: "Parents Directory"
  }}
  className="border-gray-200 hover:bg-gray-50 px-3 py-2"
/>
```

### Students Page Example

```typescript
<ExportDropdown
  data={{
    headers: [
      "Name",
      "Admission Number", 
      "Grade",
      "Section",
      "Gender",
      "Transport Status"
    ],
    data: filteredStudents.map((student) => ({
      name: `${student.first_name || ""} ${student.middle_name || ""} ${student.last_name || ""}`,
      admission_number: student.admission_number || "",
      grade: student.grade || "",
      section: student.section || "",
      gender: student.gender || "",
      transport_status: student.transport_enabled ? "Active" : "Inactive"
    })),
    fileName: "students_export",
    title: "Students Directory"
  }}
  className="border-gray-200 hover:bg-gray-50 px-3 py-2"
/>
```

### Drivers Page Example

```typescript
<ExportDropdown
  data={{
    headers: [
      "Name",
      "License Number",
      "Phone Number",
      "Email",
      "Vehicle Assigned",
      "Status"
    ],
    data: filteredDrivers.map((driver) => ({
      name: `${driver.user_data?.first_name || ""} ${driver.user_data?.last_name || ""}`,
      license_number: driver.license_number || "",
      phone_number: driver.user_data?.phone_number || driver.phone_number || "",
      email: driver.user_data?.email || driver.user_email || "",
      vehicle_assigned: driver.vehicle?.registration_number || "Not Assigned",
      status: driver.is_active ? "Active" : "Inactive"
    })),
    fileName: "drivers_export",
    title: "Drivers Directory"
  }}
  className="border-gray-200 hover:bg-gray-50 px-3 py-2"
/>
```

### Vehicles Page Example

```typescript
<ExportDropdown
  data={{
    headers: [
      "Registration Number",
      "Make & Model",
      "Capacity",
      "Driver Assigned",
      "Status",
      "Last Maintenance"
    ],
    data: filteredVehicles.map((vehicle) => ({
      registration_number: vehicle.registration_number || "",
      make_model: `${vehicle.make || ""} ${vehicle.model || ""}`,
      capacity: vehicle.capacity || "",
      driver_assigned: vehicle.driver?.user_data?.first_name 
        ? `${vehicle.driver.user_data.first_name} ${vehicle.driver.user_data.last_name}`
        : "Not Assigned",
      status: vehicle.is_active ? "Active" : "Inactive",
      last_maintenance: vehicle.last_maintenance_date || "Not Available"
    })),
    fileName: "vehicles_export",
    title: "Vehicles Directory"
  }}
  className="border-gray-200 hover:bg-gray-50 px-3 py-2"
/>
```

### Trips Page Example

```typescript
<ExportDropdown
  data={{
    headers: [
      "Trip ID",
      "Route",
      "Driver",
      "Vehicle",
      "Scheduled Time",
      "Status",
      "Students Count"
    ],
    data: filteredTrips.map((trip) => ({
      trip_id: trip.id || "",
      route: trip.route?.name || "",
      driver: trip.driver?.user_data?.first_name 
        ? `${trip.driver.user_data.first_name} ${trip.driver.user_data.last_name}`
        : "Not Assigned",
      vehicle: trip.vehicle?.registration_number || "Not Assigned",
      scheduled_time: trip.scheduled_time || "",
      status: trip.status || "",
      students_count: trip.students?.length || 0
    })),
    fileName: "trips_export",
    title: "Trips Report"
  }}
  className="border-gray-200 hover:bg-gray-50 px-3 py-2"
/>
```

## Data Mapping Guidelines

### 1. Headers
- Use clear, descriptive column headers
- Keep headers concise but informative
- Use title case for consistency

### 2. Data Objects
- Map your data to match the header keys
- Use lowercase with underscores for object keys
- Handle null/undefined values gracefully
- Format complex data (arrays, objects) as readable strings

### 3. File Names
- Use descriptive, lowercase names
- Avoid spaces (use underscores)
- Include the data type (e.g., "parents_export", "students_report")

### 4. Titles
- Use clear, descriptive titles for reports
- Keep titles concise but informative

## Styling Options

### Button Variants
- `default` - Primary button style
- `outline` - Bordered button (recommended for export buttons)
- `secondary` - Secondary button style
- `ghost` - Minimal button style
- `link` - Link-style button
- `destructive` - Red/danger button style

### Button Sizes
- `default` - Standard size
- `sm` - Small size
- `lg` - Large size
- `icon` - Icon-only size

### Custom Classes
You can add custom CSS classes for specific styling:

```typescript
className="border-gray-200 hover:bg-gray-50 px-3 py-2 text-sm"
```

## Best Practices

### 1. Data Preparation
- Always filter data before passing to the component
- Handle empty states gracefully
- Format dates and numbers consistently
- Sanitize data to prevent export errors

### 2. Performance
- Use filtered data arrays, not the entire dataset
- Avoid complex calculations in the data mapping
- Consider pagination for large datasets

### 3. User Experience
- Place export buttons in consistent locations
- Use appropriate button variants and sizes
- Provide clear feedback through toast notifications
- Handle errors gracefully

### 4. Accessibility
- The component includes proper ARIA labels
- Keyboard navigation is supported
- Screen reader friendly

## Error Handling

The component includes built-in error handling:
- Invalid data formats
- File download failures
- Browser compatibility issues

All errors are displayed as toast notifications to the user.

## Browser Compatibility

The component works in all modern browsers:
- Chrome/Chromium
- Firefox
- Safari
- Edge

## File Formats

### Excel (CSV)
- Compatible with Excel, Google Sheets, and other spreadsheet applications
- UTF-8 encoded for international character support
- Properly escaped CSV format

### PDF (HTML)
- HTML file that can be opened in browsers
- Can be saved as PDF using browser print function
- Clean, professional formatting

### Word (DOC)
- HTML file that can be opened in Microsoft Word
- Compatible with other word processors
- Professional document formatting

## Troubleshooting

### Common Issues

1. **Data not exporting correctly**
   - Check that data object keys match header names
   - Ensure all required fields are present
   - Verify data types are strings or numbers

2. **File download not working**
   - Check browser download settings
   - Ensure popup blockers are disabled
   - Verify file permissions

3. **Styling issues**
   - Check CSS class conflicts
   - Verify Tailwind classes are available
   - Ensure proper component imports

### Debug Tips

1. Console log the data before passing to component
2. Check browser developer tools for errors
3. Verify component props are correct
4. Test with minimal data first

## Future Enhancements

Potential improvements for the ExportDropdown component:
- Custom date formatting options
- Advanced filtering before export
- Template-based exports
- Real-time export progress
- Batch export functionality
- Custom file naming patterns 