import { Link } from "expo-router";
import { Text } from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function Subscriptions() {
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-background">
      <Text className="text-xl font-bold">Subscriptions</Text>
      <Link
        href={"/subscriptions/spotify"}
        className="mt-4 rounded bg-primary text-white p-4"
      >
        Spotify subscription
      </Link>

      <Link
        href={{
          pathname: "/subscriptions/[id]",
          params: { id: "claude" },
        }}
        className="mt-4 rounded bg-primary text-white p-4"
      >
        Claude subscription
      </Link>
    </SafeAreaView>
  );
}
