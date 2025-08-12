# Daily Habit Tracker

A fast, responsive daily habit tracker built with Next.js 15, React 19, and TypeScript. Track your habits, build streaks, and visualize your progress with beautiful statistics and heatmaps.

## Features

- ✨ **Modern Tech Stack**: Next.js 15 with App Router, React 19, TypeScript
- 🎯 **Habit Management**: Create, edit, and delete habits with custom frequencies
- 📅 **Daily Check-ins**: Mark habits as complete with a beautiful interface
- 🔥 **Streak Tracking**: Monitor current and best streaks for motivation
- 📊 **Statistics**: View completion rates, heatmaps, and detailed analytics
- 🌙 **Dark/Light Mode**: Automatic theme switching with system preference support
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 💾 **Offline-First**: Local storage with export/import functionality
- ⚡ **Fast Development**: Turbopack for lightning-fast development experience

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **State Management**: React Context + Hooks
- **Storage**: LocalStorage (offline-first)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd habit-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development with Turbopack

The project is configured to use Turbopack for faster development:

```bash
npm run dev
# This runs: next dev --turbopack
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Dashboard page
│   ├── stats/             # Statistics page
│   └── settings/          # Settings page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard.tsx     # Main dashboard
│   ├── habit-list.tsx    # Habit list component
│   ├── add-habit-dialog.tsx # Add habit dialog
│   └── ...               # Other components
├── contexts/             # React contexts
│   ├── theme-context.tsx # Theme management
│   └── habit-context.tsx # Habit state management
├── lib/                  # Utility functions
│   ├── habit-utils.ts   # Habit calculation functions
│   ├── storage.ts        # LocalStorage utilities
│   └── utils.ts          # General utilities
└── types/                # TypeScript type definitions
    └── habit.ts          # Habit-related types
```

## Key Features

### Habit Management
- Create habits with custom names, emojis, and colors
- Set frequency (daily or custom days of the week)
- Edit and delete existing habits

### Daily Tracking
- Mark habits as complete for today
- Visual indicators for eligible vs. ineligible days
- Quick toggle interface for daily check-ins

### Statistics & Analytics
- Current and best streak tracking
- 7-day and 30-day completion rates
- 8-week heatmap calendar
- Individual habit performance metrics

### Data Management
- Export all data as JSON
- Import previously exported data
- Clear all data option
- Local storage with debounced writes

### Theme & Customization
- Light, dark, and system theme modes
- Automatic theme switching
- Responsive design for all devices

## Usage

### Creating a Habit
1. Click "Add Habit" on the dashboard
2. Enter a name and select an emoji
3. Choose a color and frequency
4. For custom frequency, select specific days
5. Click "Create Habit"

### Daily Check-ins
- On the dashboard, click the check button for each habit
- Green indicates completed, gray indicates incomplete
- Only eligible days can be marked (respects custom frequency)

### Viewing Statistics
- Navigate to the Stats page for detailed analytics
- View heatmap calendar showing last 8 weeks
- See top-performing habits and completion rates

### Managing Data
- Go to Settings to export/import data
- Export creates a JSON file with all your data
- Import overwrites current data (use with caution)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
# habitracker
