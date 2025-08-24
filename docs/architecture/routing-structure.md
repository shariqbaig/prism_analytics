# PRISM Analytics - Routing & Navigation Structure

## Router Configuration

### Routes Overview
- `/` - Redirects to `/dashboard`
- `/dashboard` - Executive summary dashboard
- `/upload` - File upload interface
- `/inventory` - Inventory analysis (requires inventory data)
- `/osr` - OSR command center (requires OSR data)
- `/reports` - Reports and export functionality

### Adaptive Route Guards
The `DataGuard` component protects routes that require specific data:
- **Inventory Analysis**: Requires 'inventory' data
- **OSR Command Center**: Requires 'osr' data
- Redirects to `/upload` when required data is missing
- Shows informative message explaining what data is needed

### Navigation Structure
Sidebar navigation with visual icons:
- 📊 Dashboard
- 📁 Upload Files
- 📦 Inventory Analysis
- ⚠️ OSR Command Center
- 📄 Reports & Export

## Code Splitting & Performance
- Lazy loading for all page components
- Code splitting configured in Vite for vendor, charts, and UI chunks
- Suspense boundaries with loading spinners
- Error boundaries for graceful error handling

## Layout System
- **Header**: PRISM Analytics branding with executive subtitle
- **Sidebar**: Fixed navigation with active state indicators
- **Main Content**: Responsive layout with proper scrolling

## Technical Implementation
- React Router v6 with browser history
- TypeScript interfaces for route protection
- Tailwind CSS for responsive design
- Path aliases (@/*) for clean imports

## Future Enhancements
- Breadcrumb navigation for drill-downs
- Route-based state persistence
- Analytics tracking for user navigation patterns
- Progressive enhancement for offline mode