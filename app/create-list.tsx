import { useRouter } from "expo-router"; // Removed useLocalSearchParams
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// AsyncStorage and uuidv4 are now handled by the store for saving
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  ListCreationSection,
  useListCreationStore,
} from "../store/listCreationStore"; // Corrected path
import { HabitItem } from "./(tabs)/lists";

// Define types for the main FlatList data items
type ListItemType = "input" | "section";
interface ScreenListItem {
  id: string;
  type: ListItemType;
  sectionName?: "Morning" | "Afternoon" | "Evening";
}

export default function CreateListModal() {
  const router = useRouter();

  // Get state and actions from Zustand store
  const {
    listName,
    morningItems,
    afternoonItems,
    eveningItems,
    setListName,
    // addHabitToSection is now handled by select-habit modal directly calling store
    setHabitsForSection,
    saveCurrentList,
    resetCreateListState,
  } = useListCreationStore();

  const handleSavePress = async () => {
    const success = await saveCurrentList();
    if (success) {
      router.back();
    } else {
      // Alert is already shown by the store, but you could add more specific UI feedback here
    }
  };

  const handleCancelPress = () => {
    resetCreateListState();
    router.back();
  };

  const navigateToSelectHabit = (
    sectionTarget: "Morning" | "Afternoon" | "Evening"
  ) => {
    // Pass the target section name to the select-habit modal
    // The select-habit modal will then use this to call the store's addHabitToSection
    router.push({
      pathname: "/select-habit",
      params: { targetSection: sectionTarget.toLowerCase() },
    });
  };

  const renderDraggableHabitItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<HabitItem>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[styles.draggableItem, isActive && styles.draggableItemActive]}
        >
          <ThemedText style={styles.draggableItemText}>
            {item.emoji} {item.name}
          </ThemedText>
          <IconSymbol name="line.3.horizontal" size={20} color="#888" />
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  const screenListData: ScreenListItem[] = [
    { id: "listNameInput", type: "input" },
    { id: "morningSection", type: "section", sectionName: "Morning" },
    { id: "afternoonSection", type: "section", sectionName: "Afternoon" },
    { id: "eveningSection", type: "section", sectionName: "Evening" },
  ];

  const renderScreenItem = ({ item }: { item: ScreenListItem }) => {
    if (item.type === "input") {
      return (
        <TextInput
          style={styles.input}
          placeholder="List Name (e.g., Productive Day)"
          value={listName} // From store
          onChangeText={setListName} // Action from store
          placeholderTextColor="#888"
        />
      );
    }

    if (item.type === "section" && item.sectionName) {
      let currentItems: HabitItem[] = [];
      let sectionKey: ListCreationSection = "morning"; // Default, will be updated

      if (item.sectionName === "Morning") {
        currentItems = morningItems;
        sectionKey = "morning";
      }
      if (item.sectionName === "Afternoon") {
        currentItems = afternoonItems;
        sectionKey = "afternoon";
      }
      if (item.sectionName === "Evening") {
        currentItems = eveningItems;
        sectionKey = "evening";
      }

      const sectionNameForDisplay = item.sectionName;

      return (
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>
            {sectionNameForDisplay}
          </ThemedText>
          <DraggableFlatList
            data={currentItems} // From store
            onDragEnd={({ data }) => setHabitsForSection(data, sectionKey)}
            keyExtractor={(habit) => habit.id}
            renderItem={renderDraggableHabitItem}
            scrollEnabled={false}
            // containerStyle={{ minHeight: currentItems.length > 0 ? 0 : 60 }}
          />
          <TouchableOpacity
            onPress={() => navigateToSelectHabit(sectionNameForDisplay)}
            style={styles.addActivityButton}
          >
            <IconSymbol name="plus" size={16} color="#007AFF" />
            <ThemedText style={styles.addActivityButtonText}>
              {" "}
              Add a solitude habit
            </ThemedText>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleCancelPress}
            style={styles.headerButton}
          >
            <ThemedText style={styles.headerButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title" style={styles.modalTitle}>
            Create List
          </ThemedText>
          <TouchableOpacity
            onPress={handleSavePress}
            style={styles.headerButton}
          >
            <ThemedText
              style={[styles.headerButtonText, styles.saveButtonText]}
            >
              Save
            </ThemedText>
          </TouchableOpacity>
        </View>

        <FlatList
          data={screenListData}
          renderItem={renderScreenItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
        />
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: Platform.OS === "ios" ? 8 : 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: { fontSize: 18 },
  headerButton: { padding: 10 },
  headerButtonText: { fontSize: 16, color: "#007AFF" },
  saveButtonText: { fontWeight: "bold" },
  listContentContainer: {
    paddingBottom: 50,
  },
  input: {
    height: 50,
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    fontSize: 16,
    // If using ThemedInput, provide theme-aware colors or remove backgroundColor
    // backgroundColor: '#FFFFFF',
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2.0,
    elevation: 1,
    // backgroundColor should come from ThemedView or be managed by theme
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  addActivityButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF1A",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  addActivityButtonText: {
    fontSize: 16,
    color: "#007AFF",
    marginLeft: 5,
  },
  draggableItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 5,
    backgroundColor: "#FFFFFF", // Ensure contrast if ThemedView parent is dark
  },
  draggableItemActive: {
    backgroundColor: "#F8F8F8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  draggableItemText: { fontSize: 16 },
  emptySectionText: {
    textAlign: "center",
    color: "#888",
    paddingVertical: 20,
    fontStyle: "italic",
    minHeight: 20,
  },
});
