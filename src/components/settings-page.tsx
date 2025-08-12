"use client";

import { useState } from "react";
import { Download, Upload, Trash2, Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/contexts/theme-context";
import { storage } from "@/lib/storage";

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [importData, setImportData] = useState("");

  const handleExport = () => {
    const data = storage.exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habit-tracker-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (importData.trim()) {
      const success = storage.importData(importData);
      if (success) {
        alert("Data imported successfully! Please refresh the page.");
        setImportData("");
      } else {
        alert("Failed to import data. Please check the format.");
      }
    }
  };

  const handleClearData = () => {
    if (
      confirm(
        "Are you sure you want to clear all data? This action cannot be undone."
      )
    ) {
      storage.clearAll();
      alert("All data has been cleared. Please refresh the page.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Customize your habit tracker experience
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of your app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <div className="text-sm text-muted-foreground">
                  Choose your preferred color scheme
                </div>
              </div>
              <Select
                value={theme.system ? "system" : theme.mode}
                onValueChange={(value) => {
                  if (value === "system") {
                    setTheme({ mode: "light", system: true });
                  } else {
                    setTheme({
                      mode: value as "light" | "dark",
                      system: false,
                    });
                  }
                }}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4" />
                      <span>Light</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center space-x-2">
                      <Moon className="h-4 w-4" />
                      <span>Dark</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4" />
                      <span>System</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Language</CardTitle>
            <CardDescription>Choose your preferred language</CardDescription>
          </CardHeader>
          <CardContent>
            <Select defaultValue="en">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export, import, or clear your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleExport}
              className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </Button>
            <p className="text-sm text-muted-foreground">
              Download all your habits and progress data as a JSON file
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="import">Import Data</Label>
            <div className="flex space-x-2">
              <textarea
                id="import"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste your exported JSON data here..."
                className="flex-1 min-h-[100px] p-3 border rounded-md resize-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleImport}
                variant="outline"
                className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </Button>
              <p className="text-sm text-muted-foreground">
                Import previously exported data (this will overwrite current
                data)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={handleClearData}
              variant="destructive"
              className="flex items-center space-x-2">
              <Trash2 className="h-4 w-4" />
              <span>Clear All Data</span>
            </Button>
            <p className="text-sm text-muted-foreground">
              Permanently delete all your habits and progress data
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Information about this application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Version:</strong> 1.0.0
            </p>
            <p>
              <strong>Built with:</strong> Next.js 15, React 19, TypeScript,
              Tailwind CSS
            </p>
            <p>
              <strong>Storage:</strong> Local browser storage (offline-first)
            </p>
            <p>
              <strong>Features:</strong> Habit tracking, streaks, statistics,
              dark/light mode
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
