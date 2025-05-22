import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol"; // Assuming this is your icon component
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

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

  const loadLists = async () => {
    try {
      const storedLists = await AsyncStorage.getItem(LISTS_STORAGE_KEY);
      if (storedLists) {
        setLists(JSON.parse(storedLists));
      }
    } catch (e) {
      console.error("Failed to load lists.", e);
    }
  };

  // Load lists when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadLists();
    }, [])
  );

  const renderItem = ({ item }: { item: HabitList }) => (
    <ThemedView style={styles.listItemContainer}>
      <ThemedText style={styles.listItemTitle}>{item.name}</ThemedText>
      <ThemedText style={styles.listItemSubtitle}>
        M: {item.morning.length}, A: {item.afternoon.length}, E:{" "}
        {item.evening.length}
      </ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Your Lists
        </ThemedText>
        <Link href="/create-list" asChild>
          <TouchableOpacity style={styles.addButton}>
            <IconSymbol name="plus.circle.fill" size={30} color="#007AFF" />
          </TouchableOpacity>
        </Link>
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
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
  listContentContainer: {
    paddingHorizontal: 20,
  },
  listItemContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    // ThemedView will handle background color based on theme
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // For Android
  },
  listItemTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  listItemSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});
