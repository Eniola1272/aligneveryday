import { Tabs } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import AddShelfModal from '@/app/components/AddShelfModal';

function TabGlyph({ glyph, active }: { glyph: string; active: boolean }) {
  return (
    <Text className={`text-2xl ${active ? 'text-accent' : 'text-zinc-500'}`}>
      {glyph}
    </Text>
  );
}

export default function TabLayout() {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: '#0A0A0A' },
          tabBarActiveTintColor: '#FF9D00',
          tabBarInactiveTintColor: '#737373',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 2,
          },
          tabBarStyle: {
            backgroundColor: '#0A0A0A',
            borderTopWidth: 0,
            height: 90,
            paddingBottom: 18,
            paddingTop: 10,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ focused }) => <TabGlyph active={focused} glyph="⌂" />,
          }}
        />
        <Tabs.Screen
          name="add"
          listeners={{
            tabPress: (event) => event.preventDefault(),
          }}
          options={{
            title: '',
            tabBarButton: () => (
              <Pressable
                accessibilityLabel="Add to learning shelf"
                accessibilityRole="button"
                className="-mt-6 h-16 w-16 items-center justify-center self-center rounded-full bg-accent shadow-lg active:bg-orange-400"
                onPress={() => setIsAddSheetOpen(true)}
              >
                <Text className="-mt-1 text-4xl font-light text-black">+</Text>
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="portfolio"
          options={{
            title: 'Portfolio',
            tabBarIcon: ({ focused }) => <TabGlyph active={focused} glyph="▣" />,
          }}
        />
      </Tabs>

      <AddShelfModal
        onClose={() => setIsAddSheetOpen(false)}
        visible={isAddSheetOpen}
      />
    </>
  );
}
