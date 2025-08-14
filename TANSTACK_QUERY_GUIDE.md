# TanStack Query Integration Guide

This guide explains how to use TanStack Query (React Query) in your habit tracker application for efficient API data management.

## 🚀 What We've Implemented

### 1. **Query Client Setup**

- **File**: `src/lib/query-client.ts`
- **Purpose**: Centralized query client configuration with sensible defaults
- **Features**: 5-minute stale time, 10-minute garbage collection, 1 retry attempt

### 2. **Query Provider**

- **File**: `src/components/providers/query-provider.tsx`
- **Purpose**: Wraps the app with TanStack Query context
- **Features**: Includes React Query DevTools for development

### 3. **Custom Hooks**

- **File**: `src/hooks/use-habits.ts`
- **Purpose**: Pre-built hooks for common API operations

## 📚 Available Hooks

### `useHabits()`

Fetches raw habits data from the API.

```typescript
const { data, isLoading, error, refetch } = useHabits();
```

**Returns:**

- `data`: `{ habits: Habit[], checks: HabitCheck[] }`
- `isLoading`: `boolean`
- `error`: `Error | null`
- `refetch`: `() => void`

### `useHabitsWithChecks()`

Fetches habits with their associated checks and calculated stats.

```typescript
const { data: habits, isLoading, error, refetch } = useHabitsWithChecks();
```

**Returns:**

- `data`: `HabitWithChecks[]`
- `isLoading`: `boolean`
- `error`: `Error | null`
- `refetch`: `() => void`

### `useUpdateHabitProgress()`

Updates habit progress with automatic cache invalidation.

```typescript
const updateProgress = useUpdateHabitProgress();

// Usage
await updateProgress.mutateAsync({
  habitId: "123",
  currentProgress: 75,
});
```

**Returns:**

- `mutate`: `(variables) => void`
- `mutateAsync`: `(variables) => Promise<T>`
- `isPending`: `boolean`
- `isError`: `boolean`
- `error`: `Error | null`

## 🎯 How to Use in Components

### Basic Data Fetching

```typescript
import { useHabitsWithChecks } from "@/hooks/use-habits";

export function MyComponent() {
  const { data: habits, isLoading, error } = useHabitsWithChecks();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {habits.map((habit) => (
        <div key={habit.id}>{habit.name}</div>
      ))}
    </div>
  );
}
```

### Mutations with Cache Updates

```typescript
import { useUpdateHabitProgress } from "@/hooks/use-habits";

export function UpdateButton({ habitId }: { habitId: string }) {
  const updateProgress = useUpdateHabitProgress();

  const handleUpdate = async () => {
    try {
      await updateProgress.mutateAsync({
        habitId,
        currentProgress: 100,
      });
      // Cache automatically invalidates and refetches!
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <button onClick={handleUpdate} disabled={updateProgress.isPending}>
      {updateProgress.isPending ? "Updating..." : "Update"}
    </button>
  );
}
```

## 🔧 Configuration Options

### Query Client Settings

```typescript
// src/lib/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1, // 1 retry attempt
      refetchOnWindowFocus: false, // No refetch on focus
    },
  },
});
```

### Custom Query Options

```typescript
const { data } = useQuery({
  queryKey: ["habits"],
  queryFn: fetchHabits,
  staleTime: 1000 * 60 * 10, // Override default
  enabled: shouldFetch, // Conditional fetching
});
```

## 🎨 Built-in Features

### ✅ **Automatic Loading States**

- `isLoading` for initial load
- `isFetching` for background updates
- `isPending` for mutations

### ✅ **Error Handling**

- Automatic error boundaries
- Retry mechanisms
- Error state management

### ✅ **Cache Management**

- Automatic background refetching
- Smart cache invalidation
- Optimistic updates support

### ✅ **Performance**

- Request deduplication
- Background synchronization
- Intelligent refetching

## 🚀 Creating New Hooks

### Example: Adding a New API Hook

```typescript
// src/hooks/use-habits.ts

export const useCreateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitData: CreateHabitData) => {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(habitData),
      });

      if (!response.ok) throw new Error("Failed to create habit");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch habits
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
};
```

### Usage

```typescript
const createHabit = useCreateHabit();

const handleCreate = async () => {
  try {
    await createHabit.mutateAsync({
      name: "New Habit",
      frequency: "daily",
      // ... other fields
    });
    // Success! Data automatically refetches
  } catch (error) {
    // Handle error
  }
};
```

## 🧪 Development Tools

### React Query DevTools

- **Access**: Automatically included in development
- **Features**: Query inspector, cache viewer, mutation logs
- **Toggle**: Click the floating React Query icon

### Debugging Queries

```typescript
// Check query state in console
console.log(queryClient.getQueryData(["habits"]));

// Manually invalidate queries
queryClient.invalidateQueries({ queryKey: ["habits"] });

// Reset entire cache
queryClient.clear();
```

## 🔄 Migration from Context

### Before (Context)

```typescript
import { useHabits } from "@/contexts/habit-context";

const { habitsWithChecks, isLoading } = useHabits();
```

### After (TanStack Query)

```typescript
import { useHabitsWithChecks } from "@/hooks/use-habits";

const { data: habits, isLoading, error, refetch } = useHabitsWithChecks();
```

## 📱 Benefits Over Redux

1. **Smaller Bundle**: ~2.5KB vs Redux's 20KB+
2. **Automatic Caching**: Built-in cache management
3. **Loading States**: Automatic loading/error states
4. **Background Updates**: Keeps data fresh automatically
5. **TypeScript**: Excellent type inference
6. **DevTools**: Built-in debugging tools
7. **Performance**: Request deduplication and optimization

## 🎯 Next Steps

1. **Replace remaining context usage** with TanStack Query hooks
2. **Add more custom hooks** for other API endpoints
3. **Implement optimistic updates** for better UX
4. **Add offline support** with persistence
5. **Create reusable query patterns** for common operations

## 📚 Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Best Practices](https://tanstack.com/query/latest/docs/react/guides/best-practices)
