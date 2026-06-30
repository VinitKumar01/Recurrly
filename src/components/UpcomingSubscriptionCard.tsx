import { formatCurrency } from "@/lib/utils";
import { Image as ExpoImage } from "expo-image";
import { styled } from "nativewind";
import { View, Text } from "react-native";

const Image = styled(ExpoImage);

export default function UpcomingSubscriptionCard({
  name,
  price,
  daysLeft,
  icon,
  currency,
}: UpcomingSubscriptionCardProps) {
  return (
    <View className="upcoming-card shadow-sm drop-shadow-sm my-2 mx-1">
      <View className="upcoming-row">
        <Image source={icon} className="upcoming-icon" />
        <View>
          <Text className="upcoming-price">
            {formatCurrency(price, currency)}
          </Text>
          <Text className="upcoming-meta">
            {daysLeft > 1 ? `${daysLeft} days left` : "Last day"}
          </Text>
        </View>
      </View>

      <Text className="upcoming-name">{name}</Text>
    </View>
  );
}
