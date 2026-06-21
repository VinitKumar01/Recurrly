import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";

export default function SubscriptionDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View>
      <Text>Subscription Details: {id}</Text>
    </View>
  );
}
