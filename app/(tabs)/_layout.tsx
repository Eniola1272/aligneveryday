import { Tabs } from "expo-router";
import { useState } from "react";
import { Pressable, Text } from "react-native";

import AddShelfModal from "@/app/components/AddShelfModal";
import { useProductivity } from "@/contexts/ProductivityContext";
import { TabActionsProvider } from "@/contexts/TabActionsContext";

function TabGlyph({ glyph, active }: { glyph: string; active: boolean }) {
  return (
    <Text className={`text-xl ${active ? "text-accent" : "text-zinc-600"}`}>
      {glyph}
    </Text>
  );
}

export default function TabLayout() {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const { addCourse } = useProductivity();

  return (
    <TabActionsProvider openAddCourse={() => setIsAddSheetOpen(true)}>
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: "#0A0A0A" },
          tabBarActiveTintColor: "#FF9D00",
          tabBarInactiveTintColor: "#66666A",
          tabBarLabelStyle: { fontSize: 10, fontWeight: "600", marginTop: 1 },
          tabBarStyle: {
            backgroundColor: "#0A0A0A",
            borderTopWidth: 0,
            height: 88,
            paddingBottom: 18,
            paddingTop: 10,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Today",
            tabBarIcon: ({ focused }) => (
              <TabGlyph active={focused} glyph="⌂" />
            ),
          }}
        />
        <Tabs.Screen
          name="shelf"
          options={{
            title: "Shelf",
            tabBarIcon: ({ focused }) => (
              <TabGlyph active={focused} glyph="▤" />
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          listeners={{ tabPress: (event) => event.preventDefault() }}
          options={{
            title: "",
            tabBarButton: () => (
              <Pressable
                accessibilityLabel="Add to learning shelf"
                className="-mt-6 h-16 w-16 items-center justify-center self-center rounded-full bg-accent shadow-lg active:bg-orange-400"
                onPress={() => setIsAddSheetOpen(true)}
              >
                <Text className="-mt-1 text-4xl font-light text-black">+</Text>
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="alignments"
          options={{
            title: "Align",
            tabBarIcon: ({ focused }) => (
              <TabGlyph active={focused} glyph="✓" />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "You",
            tabBarIcon: ({ focused }) => (
              <TabGlyph active={focused} glyph="◉" />
            ),
          }}
        />
        <Tabs.Screen name="portfolio" options={{ href: null }} />
      </Tabs>

      <AddShelfModal
        onAdd={async (draft) => {
          await addCourse(draft);
        }}
        onClose={() => setIsAddSheetOpen(false)}
        visible={isAddSheetOpen}
      />
    </TabActionsProvider>
  );
}
