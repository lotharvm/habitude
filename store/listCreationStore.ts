import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { HabitItem, HabitList } from "../app/(tabs)/lists"; // Adjust path as necessary

const LISTS_STORAGE_KEY = "habitude_lists";

export type ListCreationSection = "morning" | "afternoon" | "evening";

interface ListCreationState {
  listName: string;
  morningItems: HabitItem[];
  afternoonItems: HabitItem[];
  eveningItems: HabitItem[];
  setListName: (name: string) => void;
  addHabitToSection: (habit: HabitItem, section: ListCreationSection) => void;
  setHabitsForSection: (
    items: HabitItem[],
    section: ListCreationSection
  ) => void;
  saveCurrentList: () => Promise<boolean>; // Returns true on success, false on failure
  resetCreateListState: () => void;
  // For future edit functionality if needed
  // initializeForEdit: (list: HabitList) => void;
}

export const useListCreationStore = create<ListCreationState>((set, get) => ({
  listName: "",
  morningItems: [],
  afternoonItems: [],
  eveningItems: [],

  setListName: (name) => set({ listName: name }),

  addHabitToSection: (habit, section) => {
    set((state) => {
      const currentSectionItems =
        state[
          section === "morning"
            ? "morningItems"
            : section === "afternoon"
            ? "afternoonItems"
            : "eveningItems"
        ];
      if (!currentSectionItems.some((item) => item.id === habit.id)) {
        return {
          [`${section}Items`]: [...currentSectionItems, habit],
        };
      }
      return {}; // No change if item already exists
    });
  },

  setHabitsForSection: (items, section) => {
    set({
      [`${section}Items`]: items,
    });
  },

  saveCurrentList: async () => {
    const { listName, morningItems, afternoonItems, eveningItems } = get();
    if (!listName.trim()) {
      alert("Please enter a name for your list."); // Consider moving alerts to UI layer
      return false;
    }
    const newList: HabitList = {
      id: uuidv4(),
      name: listName.trim(),
      morning: morningItems,
      afternoon: afternoonItems,
      evening: eveningItems,
    };
    try {
      const existingListsJson = await AsyncStorage.getItem(LISTS_STORAGE_KEY);
      const existingLists: HabitList[] = existingListsJson
        ? JSON.parse(existingListsJson)
        : [];
      existingLists.push(newList);
      await AsyncStorage.setItem(
        LISTS_STORAGE_KEY,
        JSON.stringify(existingLists)
      );
      get().resetCreateListState(); // Reset state after successful save
      return true;
    } catch (e) {
      console.error("Failed to save list via store.", e);
      alert("Failed to save list. Please try again."); // Consider moving alerts to UI layer
      return false;
    }
  },

  resetCreateListState: () => {
    set({
      listName: "",
      morningItems: [],
      afternoonItems: [],
      eveningItems: [],
    });
  },

  // Example for future edit functionality:
  // initializeForEdit: (listToEdit) => {
  //   set({
  //     listName: listToEdit.name,
  //     morningItems: listToEdit.morning,
  //     afternoonItems: listToEdit.afternoon,
  //     eveningItems: listToEdit.evening,
  //     // We might need an `editingListId` field if we want to update an existing list rather than always creating new
  //   });
  // },
}));
