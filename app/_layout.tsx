import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ProjectProvider } from "@/contexts/ProjectContext";
import Colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: Colors.bg.primary },
        headerTintColor: Colors.accent.gold,
        headerTitleStyle: { color: Colors.text.primary },
        contentStyle: { backgroundColor: Colors.bg.primary },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="new-project" options={{ presentation: "modal", title: "New Project" }} />
      <Stack.Screen name="new-shot" options={{ presentation: "modal", title: "New Shot" }} />
      <Stack.Screen name="new-crew" options={{ presentation: "modal", title: "New Crew Member" }} />
      <Stack.Screen name="new-schedule-day" options={{ presentation: "modal", title: "New Shoot Day" }} />
      <Stack.Screen name="log-take" options={{ presentation: "modal", title: "Log Take" }} />
      <Stack.Screen name="script-breakdown" options={{ title: "Script Breakdown" }} />
      <Stack.Screen name="new-breakdown" options={{ presentation: "modal", title: "New Breakdown" }} />
      <Stack.Screen name="locations" options={{ title: "Locations" }} />
      <Stack.Screen name="new-location" options={{ presentation: "modal", title: "New Location" }} />
      <Stack.Screen name="budget" options={{ title: "Budget" }} />
      <Stack.Screen name="new-budget-item" options={{ presentation: "modal", title: "New Budget Item" }} />
      <Stack.Screen name="digital-slate" options={{ title: "Digital Slate", headerStyle: { backgroundColor: '#000' } }} />
      <Stack.Screen name="continuity" options={{ title: "Continuity" }} />
      <Stack.Screen name="new-continuity" options={{ presentation: "modal", title: "New Continuity Note" }} />
      <Stack.Screen name="lens-calculator" options={{ title: "Lens Calculator" }} />
      <Stack.Screen name="vfx-tracker" options={{ title: "VFX Tracker" }} />
      <Stack.Screen name="new-vfx" options={{ presentation: "modal", title: "New VFX Shot" }} />
      <Stack.Screen name="festival-tracker" options={{ title: "Festivals" }} />
      <Stack.Screen name="new-festival" options={{ presentation: "modal", title: "New Festival" }} />
      <Stack.Screen name="production-notes" options={{ title: "Notes" }} />
      <Stack.Screen name="new-note" options={{ presentation: "modal", title: "New Note" }} />
      <Stack.Screen name="mood-boards" options={{ title: "Mood Boards" }} />
      <Stack.Screen name="new-mood-item" options={{ presentation: "modal", title: "New Mood Item" }} />
      <Stack.Screen name="call-sheets" options={{ title: "Call Sheets" }} />
      <Stack.Screen name="crew-directory" options={{ title: "Crew Directory" }} />
      <Stack.Screen name="portfolio" options={{ title: "Portfolio" }} />
      <Stack.Screen name="frame-guides" options={{ title: "Frame Guides" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ProjectProvider>
          <RootLayoutNav />
        </ProjectProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
