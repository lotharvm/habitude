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
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  DAYS_OF_WEEK,
  DAY_ABBREVIATIONS,
  DayOfWeek,
  ScheduleItem,
  useScheduleStore,
} from "../../store/scheduleStore";

export default function ScheduleScreen() {
  const router = useRouter();

  const {
    scheduleItems,
    availableLists,
    isLoading,
    loadScheduleAndLists,
    reorderSchedule,
  } = useScheduleStore();

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadScheduleAndLists();
    }, [loadScheduleAndLists])
  );

  const handleScheduleItemPress = (day: DayOfWeek) => {
    router.push({
      pathname: "/assign-list-to-day",
      params: { day },
    });
  };

  const handleDragEnd = useCallback(
    ({ from, to }: { from: number; to: number }) => {
      reorderSchedule(from, to);
    },
    [reorderSchedule]
  );

  // Render left column (static days) - removed onPress
  const renderDayItem = ({ item: day }: { item: DayOfWeek }) => (
    <View style={styles.dayItem}>
      <ThemedText style={styles.dayAbbreviation}>
        {DAY_ABBREVIATIONS[day]}
      </ThemedText>
    </View>
  );

  // Render right column (draggable assignments) - added onPress
  const renderScheduleItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<ScheduleItem>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          onPress={() => !isActive && handleScheduleItemPress(item.day)}
          disabled={isActive}
          style={[styles.scheduleItem, isActive && styles.scheduleItemActive]}
          activeOpacity={0.7}
        >
          {item.listName ? (
            <View style={styles.assignedListContainer}>
              <ThemedText style={styles.listName}>{item.listName}</ThemedText>
              <IconSymbol name="line.3.horizontal" size={20} color="#888" />
            </View>
          ) : (
            <View style={styles.emptySlotContainer}>
              <ThemedText style={styles.emptySlotText}>
                Tap to assign
              </ThemedText>
              <IconSymbol name="plus" size={16} color="#007AFF" />
            </View>
          )}
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  console.log({ isLoading });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Schedule
          </ThemedText>
        </View>

        <View style={styles.scheduleContainer}>
          {/* Left Column - Static Days */}
          <View style={styles.daysColumn}>
            <FlatList
              data={DAYS_OF_WEEK}
              renderItem={renderDayItem}
              keyExtractor={(item, index) => `static-day-${item}-${index}`}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* Right Column - Draggable Assignments */}
          <View style={styles.assignmentsColumn}>
            <DraggableFlatList
              data={scheduleItems}
              onDragEnd={handleDragEnd}
              keyExtractor={(item, index) =>
                `draggable-${item.day}-${item.listId || "empty"}-${index}`
              }
              renderItem={renderScheduleItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 25 : 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 40,
  },
  title: {},
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scheduleContainer: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  daysColumn: {
    width: "20%",
    marginRight: 10,
  },
  assignmentsColumn: {
    flex: 1,
  },
  dayItem: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
  },
  dayAbbreviation: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  scheduleItem: {
    height: 60,
    justifyContent: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scheduleItemActive: {
    backgroundColor: "#F0F0F0",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ scale: 1.02 }],
  },
  assignedListContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listName: {
    fontSize: 16,
    fontWeight: "500",
  },
  emptySlotContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  emptySlotText: {
    fontSize: 16,
    color: "#999",
    fontStyle: "italic",
  },
});
