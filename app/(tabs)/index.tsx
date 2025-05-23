import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useScheduleStore } from "../../store/scheduleStore";
import { HabitItem } from "./lists";

export default function TodayScreen() {
  const router = useRouter();
  const {
    scheduleItems,
    availableLists,
    loadScheduleAndLists,
    getTodaysAssignment,
  } = useScheduleStore();

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadScheduleAndLists();
    }, [loadScheduleAndLists])
  );

  // Get today's assignment - this will now be reactive to store changes
  const { day: today, list: todaysList } = getTodaysAssignment();

  const renderHabitItem = ({ item }: { item: HabitItem }) => (
    <View style={styles.habitItem}>
      <ThemedText style={styles.habitText}>
        {item.emoji} {item.name}
      </ThemedText>
    </View>
  );

  const renderSection = (title: string, habits: HabitItem[]) => (
    <View style={styles.sectionContainer}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {habits && habits.length > 0 ? (
        <FlatList
          data={habits}
          renderItem={renderHabitItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      ) : (
        <ThemedText style={styles.emptyText}>
          No habits for {title.toLowerCase()}
        </ThemedText>
      )}
    </View>
  );

  const navigateToSchedule = () => {
    router.push("/(tabs)/schedule");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Today
        </ThemedText>
        <ThemedText style={styles.dayText}>
          {today ? today.charAt(0).toUpperCase() + today.slice(1) : "Unknown"}
        </ThemedText>
      </View>

      {todaysList ? (
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <ThemedText style={styles.listName}>{todaysList.name}</ThemedText>
          </View>

          <View style={styles.sectionsContainer}>
            {renderSection("Morning", todaysList.morning || [])}
            {renderSection("Afternoon", todaysList.afternoon || [])}
            {renderSection("Evening", todaysList.evening || [])}
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <IconSymbol name="calendar" size={60} color="#CCC" />
          <ThemedText style={styles.emptyTitle}>No habits for today</ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Visit the Schedule tab to assign a list to {today || "today"}
          </ThemedText>
          <TouchableOpacity
            style={styles.scheduleButton}
            onPress={navigateToSchedule}
          >
            <ThemedText style={styles.scheduleButtonText}>
              Go to Schedule
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 25 : 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 30,
    marginTop: 40,
  },
  title: {},
  dayText: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listHeader: {
    marginBottom: 25,
  },
  listName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
  },
  sectionsContainer: {
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  habitItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  habitText: {
    fontSize: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#666",
  },
  emptyDescription: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  scheduleButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scheduleButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
