import { styled } from "nativewind";
import { Link } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-5">
        <Text className="text-5xl font-extrabold">Home</Text>
        <Link
          href={"/OnBoarding"}
          className="mt-4 font-sans-bold rounded bg-primary text-white p-4"
        >
          Go to OnBoarding
        </Link>
        <Link
          href={"/(auth)/sign-in"}
          className="mt-4 font-sans-bold rounded bg-primary text-white p-4"
        >
          Sign In
        </Link>
        <Link
          href={"/(auth)/sign-up"}
          className="mt-4 font-sans-bold rounded bg-primary text-white p-4"
        >
          Sign Up
        </Link>
      </View>
    </SafeAreaView>
  );
}
