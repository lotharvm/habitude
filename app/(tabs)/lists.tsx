import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol"; // Assuming this is your icon component
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useListCreationStore } from "../../store/listCreationStore"; // Import the store

const LISTS_STORAGE_KEY = "habitude_lists";

// Define the structure of a single habit item and a list
export interface HabitItem {
  id: string;
  name: string;
  emoji: string;
}

export interface HabitList {
  id: string;
  name: string;
  morning: HabitItem[];
  afternoon: HabitItem[];
  evening: HabitItem[];
}

export default function ListsScreen() {
  const [lists, setLists] = useState<HabitList[]>([]);
  const router = useRouter();
  // Get store actions directly, no need for getState() if only calling actions
  const { initializeForEdit, prepareForCreateNew } =
    useListCreationStore.getState();

  const loadLists = async () => {
    try {
      const storedLists = await AsyncStorage.getItem(LISTS_STORAGE_KEY);
      if (storedLists) {
        setLists(JSON.parse(storedLists));
      } else {
        setLists([]);
      }
    } catch (e) {
      console.error("Failed to load lists.", e);
      setLists([]);
    }
  };

  // Load lists when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadLists();
    }, [])
  );

  const handleEditList = (list: HabitList) => {
    initializeForEdit(list); // Prepare store for editing
    router.push("/create-list"); // Navigate without params
  };

  const handleCreateNewList = () => {
    prepareForCreateNew(); // Prepare store for new list creation
    router.push("/create-list"); // Navigate without params
  };

  const renderItem = ({ item }: { item: HabitList }) => {
    // Combine all habits from all sections
    const allHabits = [
      ...(item.morning || []),
      ...(item.afternoon || []),
      ...(item.evening || []),
    ];

    // Create a display string of habit names
    const habitNames =
      allHabits.length > 0
        ? allHabits.map((habit) => habit.name).join(", ")
        : "No habits";

    return (
      <Pressable
        onPress={() => handleEditList(item)}
        style={({ pressed }) => [
          styles.listItemContainer,
          pressed && styles.listItemPressed,
        ]}
      >
        <View style={styles.listItemTextContainer}>
          <ThemedText style={styles.listItemTitle}>{item.name}</ThemedText>
          <ThemedText style={styles.listItemSubtitle} numberOfLines={2}>
            {habitNames}
          </ThemedText>
        </View>
        <IconSymbol name="chevron.right" size={20} color="#C7C7CC" />
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Your lists
        </ThemedText>
        <TouchableOpacity
          onPress={handleCreateNewList}
          style={styles.addButton}
        >
          <IconSymbol name="plus.circle.fill" size={30} color="#007AFF" />
        </TouchableOpacity>
      </View>
      {lists.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            No lists yet. Tap the + to create one!
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={lists}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 25 : 50, // Adjust for status bar
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    // ThemedText handles its own font weight for type="title"
  },
  addButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  listContentContainer: {
    paddingHorizontal: 20,
  },
  listItemContainer: {
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  listItemPressed: {
    opacity: 0.8,
  },
  listItemTextContainer: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 3,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: "#666",
  },
});
