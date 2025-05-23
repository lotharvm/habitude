import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  ListCreationSection,
  useListCreationStore,
} from "../store/listCreationStore";
import { HabitItem } from "./(tabs)/lists";

type ListItemType = "input" | "section" | "deleteButton";
interface ScreenListItem {
  id: string;
  type: ListItemType;
  sectionName?: "Morning" | "Afternoon" | "Evening";
}

export default function CreateListModal() {
  const router = useRouter();

  const {
    listName,
    morningItems,
    afternoonItems,
    eveningItems,
    editingListId,
    setListName,
    setHabitsForSection,
    saveCurrentList,
    resetCreateListState,
    deleteList,
  } = useListCreationStore();

  const handleSavePress = async () => {
    const success = await saveCurrentList();
    if (success) {
      router.back();
    }
  };

  const handleCancelPress = () => {
    resetCreateListState();
    router.back();
  };

  const handleDeletePress = () => {
    if (editingListId) {
      Alert.alert(
        "Delete List",
        "Are you sure you want to delete this list? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              const success = await deleteList(editingListId);
              if (success) {
                router.back();
              }
            },
          },
        ]
      );
    }
  };

  const navigateToSelectHabit = (
    sectionTarget: "Morning" | "Afternoon" | "Evening"
  ) => {
    router.push({
      pathname: "/select-habit",
      params: { targetSection: sectionTarget.toLowerCase() },
    });
  };

  const removeHabitFromSection = (
    habitId: string,
    section: ListCreationSection
  ) => {
    let currentItems: HabitItem[] = [];
    if (section === "morning") currentItems = morningItems;
    if (section === "afternoon") currentItems = afternoonItems;
    if (section === "evening") currentItems = eveningItems;

    const updatedItems = currentItems.filter((item) => item.id !== habitId);
    setHabitsForSection(updatedItems, section);
  };

  const renderDraggableHabitItem = (sectionKey: ListCreationSection) => {
    const DraggableHabitItem = ({
      item,
      drag,
      isActive,
    }: RenderItemParams<HabitItem>) => (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[styles.draggableItem, isActive && styles.draggableItemActive]}
        >
          <ThemedText style={styles.draggableItemText}>
            {item.emoji} {item.name}
          </ThemedText>
          <View style={styles.habitActions}>
            <TouchableOpacity
              onPress={() => removeHabitFromSection(item.id, sectionKey)}
              style={styles.removeHabitButton}
            >
              <IconSymbol name="minus.circle.fill" size={20} color="#FF3B30" />
            </TouchableOpacity>
            <IconSymbol name="line.3.horizontal" size={20} color="#888" />
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );

    return DraggableHabitItem;
  };

  const screenListData: ScreenListItem[] = [
    { id: "listNameInput", type: "input" },
    { id: "morningSection", type: "section", sectionName: "Morning" },
    { id: "afternoonSection", type: "section", sectionName: "Afternoon" },
    { id: "eveningSection", type: "section", sectionName: "Evening" },
  ];
  if (editingListId) {
    screenListData.push({ id: "deleteBtn", type: "deleteButton" });
  }

  const renderScreenItem = ({ item }: { item: ScreenListItem }) => {
    if (item.type === "input") {
      return (
        <TextInput
          style={styles.input}
          placeholder={
            editingListId
              ? "Edit List Name"
              : "List Name (e.g., Productive Day)"
          }
          value={listName}
          onChangeText={setListName}
          placeholderTextColor="#888"
        />
      );
    }

    if (item.type === "section" && item.sectionName) {
      let currentItems: HabitItem[] = [];
      let sectionKey: ListCreationSection = "morning";
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
            data={currentItems}
            onDragEnd={({ data }) => setHabitsForSection(data, sectionKey)}
            keyExtractor={(habit) => habit.id}
            renderItem={renderDraggableHabitItem(sectionKey)}
            scrollEnabled={false}
          />
          <TouchableOpacity
            onPress={() => navigateToSelectHabit(sectionNameForDisplay)}
            style={styles.addActivityButton}
          >
            <IconSymbol name="plus" size={16} color="#007AFF" />
            <ThemedText style={styles.addActivityButtonText}>
              {" "}
              Add a habit
            </ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (item.type === "deleteButton") {
      return (
        <TouchableOpacity
          onPress={handleDeletePress}
          style={styles.deleteButton}
        >
          <IconSymbol name="trash.fill" size={18} color="#FF3B30" />
          <ThemedText style={styles.deleteButtonText}>Delete List</ThemedText>
        </TouchableOpacity>
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
            {editingListId ? "Edit List" : "Create List"}
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
          ListFooterComponent={
            <View style={{ height: editingListId ? 30 : 0 }} />
          }
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
    paddingBottom: 20,
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
    backgroundColor: "#FFFFFF",
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
  habitActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  removeHabitButton: {
    padding: 5,
    marginRight: 8,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF3B301A",
    paddingVertical: 12,
    marginHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 30,
  },
  deleteButtonText: {
    fontSize: 16,
    color: "#FF3B30",
    marginLeft: 8,
    fontWeight: "bold",
  },
});
