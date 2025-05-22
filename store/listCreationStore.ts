import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native"; // For confirmation dialogs
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
  editingListId: string | null; // To track if we are editing an existing list
  setListName: (name: string) => void;
  addHabitToSection: (habit: HabitItem, section: ListCreationSection) => void;
  setHabitsForSection: (
    items: HabitItem[],
    section: ListCreationSection
  ) => void;
  saveCurrentList: () => Promise<boolean>; // Returns true on success, false on failure
  resetCreateListState: () => void;
  initializeForEdit: (listToEdit: HabitList) => void; // Action to load a list for editing
  deleteList: (listIdToDelete: string) => Promise<boolean>; // Action to delete a list
  prepareForCreateNew: () => void; // New action
}

const initialListState = {
  listName: "",
  morningItems: [],
  afternoonItems: [],
  eveningItems: [],
  editingListId: null,
};

export const useListCreationStore = create<ListCreationState>((set, get) => ({
  ...initialListState,

  setListName: (name) => set({ listName: name }),

  addHabitToSection: (habit, section) => {
    set((state) => {
      const sectionKey = `${section}Items` as
        | "morningItems"
        | "afternoonItems"
        | "eveningItems";
      const currentSectionItems = state[sectionKey];
      if (!currentSectionItems.some((item) => item.id === habit.id)) {
        return { [sectionKey]: [...currentSectionItems, habit] };
      }
      return {}; // No change if item already exists
    });
  },

  setHabitsForSection: (items, section) => {
    set({
      [`${section}Items`]: items,
    });
  },

  initializeForEdit: (listToEdit) => {
    set({
      listName: listToEdit.name,
      morningItems: [...listToEdit.morning], // Ensure new arrays are created
      afternoonItems: [...listToEdit.afternoon],
      eveningItems: [...listToEdit.evening],
      editingListId: listToEdit.id,
    });
  },

  prepareForCreateNew: () => {
    set(initialListState); // Reset to initial state for creating a new list
  },

  saveCurrentList: async () => {
    const {
      listName,
      morningItems,
      afternoonItems,
      eveningItems,
      editingListId,
    } = get();
    if (!listName.trim()) {
      Alert.alert("Validation Error", "Please enter a name for your list.");
      return false;
    }

    const listData: Omit<HabitList, "id"> = {
      name: listName.trim(),
      morning: morningItems,
      afternoon: afternoonItems,
      evening: eveningItems,
    };

    try {
      const existingListsJson = await AsyncStorage.getItem(LISTS_STORAGE_KEY);
      let existingLists: HabitList[] = existingListsJson
        ? JSON.parse(existingListsJson)
        : [];

      if (editingListId) {
        // Update existing list
        existingLists = existingLists.map((list) =>
          list.id === editingListId ? { ...listData, id: editingListId } : list
        );
      } else {
        // Add new list
        const newListWithId: HabitList = { ...listData, id: uuidv4() };
        existingLists.push(newListWithId);
      }

      await AsyncStorage.setItem(
        LISTS_STORAGE_KEY,
        JSON.stringify(existingLists)
      );
      get().resetCreateListState(); // Reset state after successful save
      return true;
    } catch (e) {
      console.error("Failed to save list:", e);
      Alert.alert("Save Error", "Failed to save list. Please try again.");
      return false;
    }
  },

  deleteList: async (listIdToDelete) => {
    try {
      const existingListsJson = await AsyncStorage.getItem(LISTS_STORAGE_KEY);
      if (!existingListsJson) return true; // Nothing to delete
      let existingLists: HabitList[] = JSON.parse(existingListsJson);
      existingLists = existingLists.filter(
        (list) => list.id !== listIdToDelete
      );
      await AsyncStorage.setItem(
        LISTS_STORAGE_KEY,
        JSON.stringify(existingLists)
      );
      get().resetCreateListState(); // Also reset state after deletion
      return true;
    } catch (e) {
      console.error("Failed to delete list:", e);
      Alert.alert("Delete Error", "Failed to delete list. Please try again.");
      return false;
    }
  },

  resetCreateListState: () => {
    set(initialListState); // Use the defined initial state for resetting
  },
}));
