import { styled } from "nativewind";
import { FlatList, Text, View } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import {
  HOME_BALANCE,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency, formatSubscriptionDateTime } from "@/lib/utils";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";

const SafeAreaView = styled(RNSafeAreaView);
const Image = styled(ExpoImage);

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-5">
        <View className="home-header">
          <View className="home-user">
            <Image
              source={images.avatar}
              className="home-avatar shadow-gray-500 shadow-lg drop-shadow-lg"
            />
            <Text className="home-user-name text-shadow-sm text-shadow-gray-300 drop-shadow-lg">
              {HOME_USER.name}
            </Text>
          </View>
          <Image
            source={icons.add}
            className="home-add-icon bg-white/10 rounded-full shadow-gray-500  shadow-lg drop-shadow-lg"
          />
        </View>

        <View className="home-balance-card shadow-gray-500 shadow-lg drop-shadow-sm">
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
              <Text className="home-empty-state">
                No upcoming renewals yet.
              </Text>
            }
          />
        </View>

        <View>
          <ListHeading title="All Subscriptions" />
        </View>
      </View>
    </SafeAreaView>
  );
}
