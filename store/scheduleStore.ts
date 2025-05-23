import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { HabitList } from "../app/(tabs)/lists";

const SCHEDULE_STORAGE_KEY = "habitude_schedule";
const LISTS_STORAGE_KEY = "habitude_lists";

// Days of the week in order
export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

// Helper to get day abbreviations for display
export const DAY_ABBREVIATIONS: { [K in DayOfWeek]: string } = {
  monday: "MON",
  tuesday: "TUE",
  wednesday: "WED",
  thursday: "THU",
  friday: "FRI",
  saturday: "SAT",
  sunday: "SUN",
};

// Simplified schedule item - just day and listId
export interface ScheduleItem {
  day: DayOfWeek;
  listId: string | null;
  listName: string | null; // Computed from availableLists
}

interface ScheduleState {
  // Core state - just a simple array
  scheduleItems: ScheduleItem[];
  availableLists: HabitList[];
  isLoading: boolean;

  // Actions
  loadScheduleAndLists: () => Promise<void>;
  assignListToDay: (day: DayOfWeek, listId: string | null) => Promise<void>;
  reorderSchedule: (fromIndex: number, toIndex: number) => Promise<void>;

  // Getters
  getListById: (id: string) => HabitList | null;
  getTodaysAssignment: () => { day: DayOfWeek; list: HabitList | null };
}

// Initialize with empty schedule
const createInitialSchedule = (): ScheduleItem[] => {
  return DAYS_OF_WEEK.map((day) => ({
    day,
    listId: null,
    listName: null,
  }));
};

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  scheduleItems: createInitialSchedule(),
  availableLists: [],
  isLoading: false,

  loadScheduleAndLists: async () => {
    set({ isLoading: true });
    try {
      // Load schedule from AsyncStorage
      const scheduleJson = await AsyncStorage.getItem(SCHEDULE_STORAGE_KEY);
      let scheduleItems = scheduleJson
        ? JSON.parse(scheduleJson)
        : createInitialSchedule();

      // Ensure we have all days (for backwards compatibility)
      if (scheduleItems.length !== DAYS_OF_WEEK.length) {
        scheduleItems = createInitialSchedule();
      }

      // Load available lists from AsyncStorage
      const listsJson = await AsyncStorage.getItem(LISTS_STORAGE_KEY);
      const availableLists: HabitList[] = listsJson
        ? JSON.parse(listsJson)
        : [];

      // IMPORTANT: Ensure items are always in the correct day order
      // Create a map from the loaded data
      const scheduleMap = new Map();
      scheduleItems.forEach((item: ScheduleItem) => {
        scheduleMap.set(item.day, item);
      });

      // Rebuild array in correct order
      const orderedScheduleItems = DAYS_OF_WEEK.map((day) => {
        const existingItem = scheduleMap.get(day);
        if (existingItem) {
          // Update listName based on current available lists
          const list = existingItem.listId
            ? availableLists.find(
                (l: HabitList) => l.id === existingItem.listId
              )
            : null;
          return {
            ...existingItem,
            listName: list?.name || null,
          };
        } else {
          // Create missing day
          return {
            day,
            listId: null,
            listName: null,
          };
        }
      });

      set({
        scheduleItems: orderedScheduleItems,
        availableLists,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load schedule and lists:", error);
      set({ scheduleItems: createInitialSchedule(), isLoading: false });
    }
  },

  assignListToDay: async (day: DayOfWeek, listId: string | null) => {
    try {
      const { scheduleItems, availableLists } = get();
      const list = listId ? availableLists.find((l) => l.id === listId) : null;

      const updatedItems = scheduleItems.map((item) =>
        item.day === day
          ? { ...item, listId, listName: list?.name || null }
          : item
      );

      set({ scheduleItems: updatedItems });

      // Save to AsyncStorage
      await AsyncStorage.setItem(
        SCHEDULE_STORAGE_KEY,
        JSON.stringify(updatedItems)
      );
    } catch (error) {
      console.error("Failed to assign list to day:", error);
    }
  },

  reorderSchedule: async (fromIndex: number, toIndex: number) => {
    try {
      if (fromIndex === toIndex) return;

      const { scheduleItems } = get();

      // Instead of moving items, swap the assignments between days
      // This maintains the Monday-Sunday day order
      const fromItem = scheduleItems[fromIndex];
      const toItem = scheduleItems[toIndex];

      const newItems = scheduleItems.map((item, index) => {
        if (index === fromIndex) {
          // Give fromItem the toItem's assignment
          return {
            ...item,
            listId: toItem.listId,
            listName: toItem.listName,
          };
        } else if (index === toIndex) {
          // Give toItem the fromItem's assignment
          return {
            ...item,
            listId: fromItem.listId,
            listName: fromItem.listName,
          };
        }
        return item;
      });

      set({ scheduleItems: newItems });

      // Save to AsyncStorage
      await AsyncStorage.setItem(
        SCHEDULE_STORAGE_KEY,
        JSON.stringify(newItems)
      );
    } catch (error) {
      console.error("Failed to reorder schedule:", error);
    }
  },

  getListById: (id: string) => {
    const { availableLists } = get();
    return availableLists.find((list) => list.id === id) || null;
  },

  getTodaysAssignment: () => {
    const today = new Date()
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase() as DayOfWeek;

    const { scheduleItems } = get();
    const todayItem = scheduleItems.find((item) => item.day === today);
    const list = todayItem?.listId ? get().getListById(todayItem.listId) : null;

    return { day: today, list };
  },
}));
