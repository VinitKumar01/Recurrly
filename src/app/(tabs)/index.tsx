import { styled } from "nativewind";
import { FlatList, Text, View } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency, formatSubscriptionDateTime } from "@/lib/utils";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useState } from "react";

const SafeAreaView = styled(RNSafeAreaView);
const Image = styled(ExpoImage);

function HomeListHeader() {
  return (
    <>
      <View className="home-header">
        <View className="home-user">
          <Image
            source={images.avatar}
            className="home-avatar shadow-gray-500 shadow-sm drop-shadow-sm"
          />
          <Text className="home-user-name">{HOME_USER.name}</Text>
        </View>
        <Image
          source={icons.add}
          className="home-add-icon bg-white/10 rounded-full shadow-gray-500 shadow-sm drop-shadow-sm"
        />
      </View>

      <View className="home-balance-card shadow-sm drop-shadow-sm">
        <Text className="home-balance-label">Balance</Text>
        <View className="home-balance-row">
          <Text className="home-balance-amount">
            {formatCurrency(HOME_BALANCE.amount)}
          </Text>
          <Text className="home-balance-date">
            {formatSubscriptionDateTime(HOME_BALANCE.nextRenewalDate)}
          </Text>
        </View>
      </View>

      <View>
        <ListHeading title="Upcoming" />
        <FlatList
          data={UPCOMING_SUBSCRIPTIONS}
          renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={
            <Text className="home-empty-state">No upcoming renewals yet.</Text>
          }
        />
      </View>

      <ListHeading title="All Subscriptions" />
    </>
  );
}

export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-5">
        <FlatList
          ListHeaderComponent={HomeListHeader}
          data={HOME_SUBSCRIPTIONS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() =>
                setExpandedSubscriptionId((currentId) =>
                  currentId === item.id ? null : item.id,
                )
              }
            />
          )}
          extraData={expandedSubscriptionId}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text className="home-empty-state">No subscriptions yet.</Text>
          }
          contentContainerClassName="pb-30"
        />
      </View>
    </SafeAreaView>
  );
}
