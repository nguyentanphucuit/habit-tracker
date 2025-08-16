import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/theme-context";
import { HabitProvider } from "@/contexts/habit-context";
import { HealthProvider } from "@/contexts/health-context";
import { TimezoneProvider } from "@/contexts/timezone-context";
import { QueryProvider } from "@/components/providers/query-provider";
import { Navigation } from "@/components/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Daily Habit Tracker",
  description: "Track your daily habits and build streaks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <ThemeProvider>
          <QueryProvider>
            <TimezoneProvider>
              <HabitProvider>
                <HealthProvider>
                  <div className="min-h-screen flex flex-col">
                    <Navigation />
                    <main className="flex-1 container mx-auto px-4 py-4">
                      {children}
                    </main>
                  </div>
                </HealthProvider>
              </HabitProvider>
            </TimezoneProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
