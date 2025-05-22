import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { HabitItem } from "./(tabs)/lists";
// Import the store and section type
import {
  ListCreationSection,
  useListCreationStore,
} from "../store/listCreationStore"; // Corrected path

const HABIT_LIBRARY_STORAGE_KEY = "habitude_habit_library"; // Renamed for clarity

const INITIAL_HABITS: HabitItem[] = [
  { id: uuidv4(), name: "Walking", emoji: "🚶" },
  { id: uuidv4(), name: "Stretching", emoji: "🧘" },
  { id: uuidv4(), name: "Meditation", emoji: "🙏" },
  { id: uuidv4(), name: "Gym", emoji: "💪" },
  { id: uuidv4(), name: "Reading", emoji: "📚" },
  { id: uuidv4(), name: "Journaling", emoji: "✏️" },
  { id: uuidv4(), name: "Yoga", emoji: "🤸" },
  { id: uuidv4(), name: "Hydrate", emoji: "💧" },
  { id: uuidv4(), name: "Mindful eating", emoji: "🥗" },
];

export default function SelectHabitModal() {
  const router = useRouter();
  // targetSection will be 'morning', 'afternoon', or 'evening'
  const params = useLocalSearchParams<{ targetSection?: string }>();
  const targetSection = params.targetSection as ListCreationSection | undefined;

  // Get the action from the store
  const { addHabitToSection: addHabitToGlobalList } =
    useListCreationStore.getState();

  const [availableHabits, setAvailableHabits] = useState<HabitItem[]>([]);
  const [isEditing, setIsEditing] = useState<HabitItem | null>(null);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitEmoji, setNewHabitEmoji] = useState("");

  const loadHabits = async () => {
    try {
      let storedHabits = await AsyncStorage.getItem(HABIT_LIBRARY_STORAGE_KEY);
      if (!storedHabits) {
        await AsyncStorage.setItem(
          HABIT_LIBRARY_STORAGE_KEY,
          JSON.stringify(INITIAL_HABITS)
        );
        setAvailableHabits(INITIAL_HABITS);
      } else {
        setAvailableHabits(JSON.parse(storedHabits));
      }
    } catch (e) {
      console.error("Failed to load habits from library.", e);
      setAvailableHabits(INITIAL_HABITS);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

  const saveHabitLibrary = async (updatedHabits: HabitItem[]) => {
    try {
      await AsyncStorage.setItem(
        HABIT_LIBRARY_STORAGE_KEY,
        JSON.stringify(updatedHabits)
      );
      setAvailableHabits(updatedHabits);
    } catch (e) {
      console.error("Failed to save habit library.", e);
    }
  };

  const handleSelectHabit = (habit: HabitItem) => {
    if (targetSection) {
      addHabitToGlobalList(habit, targetSection);
      router.back(); // Go back to the create-list screen
    } else {
      Alert.alert("Error", "No section specified. Cannot add habit.");
      router.back();
    }
  };

  const handleAddOrUpdateHabitInLibrary = () => {
    if (!newHabitName.trim() || newHabitEmoji.length === 0) {
      Alert.alert(
        "Missing Info",
        "Please provide a name and an emoji for the habit."
      );
      return;
    }
    let updatedHabits;
    if (isEditing) {
      updatedHabits = availableHabits.map((h) =>
        h.id === isEditing.id
          ? { ...h, name: newHabitName.trim(), emoji: newHabitEmoji.trim() }
          : h
      );
    } else {
      const newHabit: HabitItem = {
        id: uuidv4(),
        name: newHabitName.trim(),
        emoji: newHabitEmoji.trim(),
      };
      updatedHabits = [...availableHabits, newHabit];
    }
    saveHabitLibrary(updatedHabits);
    setNewHabitName("");
    setNewHabitEmoji("");
    setIsEditing(null);
  };

  const startEditHabit = (habit: HabitItem) => {
    setIsEditing(habit);
    setNewHabitName(habit.name);
    setNewHabitEmoji(habit.emoji);
  };

  const handleDeleteHabitFromLibrary = (habitId: string) => {
    Alert.alert("Confirm Delete", "Delete this habit from the library?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updatedHabits = availableHabits.filter((h) => h.id !== habitId);
          saveHabitLibrary(updatedHabits);
        },
      },
    ]);
  };

  const renderHabitItem = ({ item }: { item: HabitItem }) => (
    <View style={styles.habitItemContainer}>
      <TouchableOpacity
        style={styles.habitSelectArea}
        onPress={() => handleSelectHabit(item)}
      >
        <ThemedText style={styles.habitEmoji}>{item.emoji}</ThemedText>
        <ThemedText style={styles.habitName}>{item.name}</ThemedText>
      </TouchableOpacity>
      <View style={styles.editDeleteButtons}>
        <TouchableOpacity
          onPress={() => startEditHabit(item)}
          style={styles.editButton}
        >
          <IconSymbol name="pencil" size={20} color="#FF9500" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteHabitFromLibrary(item.id)}
          style={styles.deleteButton}
        >
          <IconSymbol name="trash" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <ThemedText style={styles.headerButtonText}>Back</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.modalTitle}>
          Manage & Select Habit
        </ThemedText>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Habit Name"
          value={newHabitName}
          onChangeText={setNewHabitName}
          placeholderTextColor="#888"
        />
        <TextInput
          style={[styles.input, styles.emojiInput]}
          placeholder="✏️"
          value={newHabitEmoji}
          onChangeText={setNewHabitEmoji}
          maxLength={Platform.OS === "ios" ? 2 : 1}
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          onPress={handleAddOrUpdateHabitInLibrary}
          style={styles.addButton}
        >
          <ThemedText style={styles.addButtonText}>
            {isEditing ? "Update" : "Add New"}
          </ThemedText>
        </TouchableOpacity>
        {isEditing && (
          <TouchableOpacity
            onPress={() => {
              setIsEditing(null);
              setNewHabitName("");
              setNewHabitEmoji("");
            }}
            style={styles.cancelEditButton}
          >
            <IconSymbol name="xmark.circle.fill" size={22} color="#555" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={availableHabits}
        renderItem={renderHabitItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListEmptyComponent={
          <ThemedText style={styles.emptyListText}>
            No habits in library. Add some!
          </ThemedText>
        }
      />
    </ThemedView>
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
    paddingHorizontal: 15,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 18,
  },
  headerButton: {
    padding: 10,
    minWidth: 60,
    alignItems: "flex-start",
  },
  headerButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 8,
    fontSize: 15,
    backgroundColor: "#FFFFFF",
  },
  emojiInput: {
    flex: 0.3,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  cancelEditButton: {
    marginLeft: 8,
    padding: 5,
  },
  list: {
    flex: 1,
  },
  habitItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  habitSelectArea: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  habitEmoji: {
    fontSize: Platform.OS === "ios" ? 22 : 18,
    marginRight: 15,
  },
  habitName: {
    fontSize: 16,
    flexShrink: 1,
  },
  editDeleteButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    padding: 8,
    marginLeft: 10,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 5,
  },
  emptyListText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#888",
  },
});
