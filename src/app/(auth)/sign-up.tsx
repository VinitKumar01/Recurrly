import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function SignUp() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold">Sign Up</Text>
      <Link
        href={"/(auth)/sign-in"}
        className="bg-primary text-white mt-4 px-4 rounded"
      >
        Already have an account?
      </Link>
    </View>
  );
}
