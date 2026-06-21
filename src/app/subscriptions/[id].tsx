import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function SubscriptionDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <Text>Subscription Details: {id}</Text>
    </SafeAreaView>
  );
}
