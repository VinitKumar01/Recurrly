import { Tabs } from "expo-router";
import { tabs } from "../../constants/data";
import { View } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { colors, components } from "../../constants/theme";
import { clsx } from "clsx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styled } from "nativewind";

const tabBar = components.tabBar;
const Image = styled(ExpoImage);

const TabIcon = ({ focused, icon }: TabIconProps) => {
  return (
    <View className="flex items-center justify-center w-full h-full">
      <View
        className={clsx(
          "flex items-center justify-center rounded-full p-2",
          focused && "tabs-active",
        )}
      >
        <Image source={icon} contentFit="contain" className="tabs-glyph" />
      </View>
    </View>
  );
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: Math.max(insets.bottom, tabBar.horizontalInset),
          height: tabBar.height,
          left: tabBar.horizontalInset,
          right: tabBar.horizontalInset,
          borderRadius: tabBar.radius,
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          shadowColor: "#000000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.8,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarItemStyle: {
          paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6,
        },
        tabBarIconStyle: {
          width: tabBar.iconFrame,
          height: tabBar.iconFrame,
          alignItems: "center",
        },
      }}
    >
      {tabs.map((tab) => {
        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ focused }) => (
                <TabIcon focused={focused} icon={tab.icon} />
              ),
            }}
          />
        );
      })}
    </Tabs>
  );
}
