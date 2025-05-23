import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  DAY_ABBREVIATIONS,
  DayOfWeek,
  DAYS_OF_WEEK,
  useScheduleStore,
} from "../store/scheduleStore";
import { HabitList } from "./(tabs)/lists";

export default function AssignListToDayModal() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Extract and validate the day parameter safely
  const dayParam = params?.day;
  const selectedDay =
    typeof dayParam === "string" && DAYS_OF_WEEK.includes(dayParam as DayOfWeek)
      ? (dayParam as DayOfWeek)
      : null;

  const { scheduleItems, availableLists, assignListToDay } = useScheduleStore();

  // Validate selectedDay parameter
  if (!selectedDay) {
    return (
      <View style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <ThemedText style={styles.headerButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title" style={styles.modalTitle}>
            Error
          </ThemedText>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.content}>
          <ThemedText style={styles.errorText}>
            Invalid day parameter
          </ThemedText>
        </View>
      </View>
    );
  }

  const handleCancelPress = () => {
    router.back();
  };

  const handleAssignList = async (listId: string) => {
    if (selectedDay && typeof listId === "string") {
      await assignListToDay(selectedDay, listId);
      router.back();
    }
  };

  const handleRemoveAssignment = async () => {
    if (selectedDay) {
      await assignListToDay(selectedDay, null);
      router.back();
    }
  };

  // Find current assignment for the selected day
  const currentAssignment =
    scheduleItems.find((item) => item.day === selectedDay)?.listId || null;

  const renderListItem = ({ item }: { item: HabitList }) => {
    if (!item || !item.id || !item.name) {
      return null;
    }

    return (
      <TouchableOpacity
        style={[
          styles.listItem,
          currentAssignment === item.id && styles.listItemSelected,
        ]}
        onPress={() => handleAssignList(item.id)}
      >
        <View style={styles.listItemTextContainer}>
          <ThemedText style={styles.listItemTitle}>{item.name}</ThemedText>
          <ThemedText style={styles.listItemSubtitle}>
            {"M: " +
              (item.morning?.length || 0) +
              ", A: " +
              (item.afternoon?.length || 0) +
              ", E: " +
              (item.evening?.length || 0)}
          </ThemedText>
        </View>
        {currentAssignment === item.id && (
          <IconSymbol name="checkmark" size={20} color="#007AFF" />
        )}
      </TouchableOpacity>
    );
  };

  const containerContent = (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleCancelPress}
          style={styles.headerButton}
        >
          <ThemedText style={styles.headerButtonText}>Cancel</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.modalTitle}>
          {DAY_ABBREVIATIONS[selectedDay] + " - Assign List"}
        </ThemedText>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        {availableLists && availableLists.length > 0 ? (
          <View>
            <ThemedText style={styles.sectionTitle}>Available Lists</ThemedText>
            <FlatList
              data={availableLists}
              renderItem={renderListItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <IconSymbol name="list.bullet.clipboard" size={60} color="#CCC" />
            <ThemedText style={styles.emptyTitle}>
              No lists available
            </ThemedText>
            <ThemedText style={styles.emptyDescription}>
              Create a list first in the Lists tab
            </ThemedText>
          </View>
        )}

        {currentAssignment ? (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemoveAssignment}
          >
            <IconSymbol name="trash.fill" size={18} color="#FF3B30" />
            <ThemedText style={styles.removeButtonText}>
              Remove Assignment
            </ThemedText>
          </TouchableOpacity>
        ) : null}
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
      {containerContent}
    </View>
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
  modalTitle: {
    fontSize: 18,
    textAlign: "center",
    flex: 1,
  },
  headerButton: {
    padding: 10,
    minWidth: 60, // Ensure consistent spacing
  },
  headerButtonText: {
    fontSize: 16,
    color: "#007AFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  listContainer: {
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemSelected: {
    backgroundColor: "#F0F8FF",
    borderWidth: 2,
    borderColor: "#007AFF",
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
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF3B301A",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 30,
  },
  removeButtonText: {
    fontSize: 16,
    color: "#FF3B30",
    marginLeft: 8,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    lineHeight: 22,
  },
});
