import { useState } from "react";
import {
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useSignIn, useOAuth, useClerk, useAuth } from "@clerk/expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { signIn } = useSignIn();
  const { setActive } = useClerk();
  const { isLoaded } = useAuth();
  const router = useRouter();

  // Social Auth flows
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({
    strategy: "oauth_google",
  });
  const { startOAuthFlow: startAppleOAuth } = useOAuth({
    strategy: "oauth_apple",
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const validateEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const handleSignIn = async () => {
    if (!isLoaded || !signIn) return;

    let hasError = false;

    if (!email || !validateEmail(email)) {
      setEmailError(true);
      hasError = true;
    }
    if (!password) {
      setPasswordError(true);
      hasError = true;
    }

    if (hasError) {
      setErrorMsg("Please correct the errors in the form.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.error) {
        setErrorMsg(
          result.error.message || "An error occurred during sign-in.",
        );
        setLoading(false);
        return;
      }

      if (signIn.status === "complete") {
        await setActive({ session: signIn.createdSessionId });
        router.replace("/(tabs)");
      } else {
        console.warn("Sign-in status not complete:", signIn.status);
        setErrorMsg(
          `Sign-in requires additional verification: ${signIn.status}`,
        );
      }
    } catch (err: any) {
      console.error("Sign-in error:", err);
      const errorMessage =
        err?.errors?.[0]?.message ||
        err?.message ||
        "An unexpected error occurred.";
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (
    strategy: "oauth_google" | "oauth_apple",
  ) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const startOAuth =
        strategy === "oauth_google" ? startGoogleOAuth : startAppleOAuth;
      const { createdSessionId, setActive: setOAuthActive } =
        await startOAuth();

      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
        router.replace("/(tabs)");
      } else {
        setErrorMsg("Authentication could not be completed.");
      }
    } catch (err: any) {
      console.error("OAuth error:", err);
      const errorMessage =
        err?.errors?.[0]?.message ||
        err?.message ||
        "Authentication cancelled or failed.";
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="auth-scroll"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="auth-content justify-center">
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark shadow-sm">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">recurrly</Text>
                  <Text className="auth-wordmark-sub">
                    Subscription Manager
                  </Text>
                </View>
              </View>
              <Text className="auth-title">Welcome back</Text>
              <Text className="auth-subtitle">
                Sign in to continue managing your subscriptions
              </Text>
            </View>

            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className={`auth-input ${emailError ? "auth-input-error" : ""}`}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      setEmailError(false);
                    }}
                    editable={!loading}
                  />
                  {emailError && (
                    <Text className="auth-error">
                      Please enter a valid email address.
                    </Text>
                  )}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <View className="relative">
                    <TextInput
                      className={`auth-input pr-16 ${
                        passwordError ? "auth-input-error" : ""
                      }`}
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(0, 0, 0, 0.4)"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={(val) => {
                        setPassword(val);
                        setPasswordError(false);
                      }}
                      autoCapitalize="none"
                      editable={!loading}
                    />
                    <Pressable
                      className="absolute right-4 top-4"
                      onPress={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      <Text className="text-sm font-sans-semibold text-accent">
                        {showPassword ? "Hide" : "Show"}
                      </Text>
                    </Pressable>
                  </View>
                  {passwordError && (
                    <Text className="auth-error">
                      Password cannot be empty.
                    </Text>
                  )}
                </View>

                {errorMsg && (
                  <View className="rounded-xl bg-destructive/10 p-3 border border-destructive/20 mt-1">
                    <Text className="text-xs font-sans-medium text-destructive text-center">
                      {errorMsg}
                    </Text>
                  </View>
                )}

                <Pressable
                  className={`auth-button ${
                    !email || !password || loading ? "auth-button-disabled" : ""
                  }`}
                  onPress={handleSignIn}
                  disabled={!email || !password || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text className="auth-button-text">Sign in</Text>
                  )}
                </Pressable>

                <View className="auth-link-row mt-3">
                  <Text className="auth-link-copy">New to recurrly?</Text>
                  <Link href="/(auth)/sign-up" asChild>
                    <Pressable disabled={loading}>
                      <Text className="auth-link">Create an account</Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
            </View>

            <View className="auth-divider-row mt-6">
              <View className="auth-divider-line" />
              <Text className="auth-divider-text">Or continue with</Text>
              <View className="auth-divider-line" />
            </View>

            <View className="gap-3 mt-2">
              <Pressable
                onPress={() => handleOAuthSignIn("oauth_google")}
                className="auth-secondary-button flex-row items-center justify-center gap-3"
                disabled={loading}
              >
                <Text className="auth-secondary-button-text">Google</Text>
              </Pressable>
              <Pressable
                onPress={() => handleOAuthSignIn("oauth_apple")}
                className="auth-secondary-button flex-row items-center justify-center gap-3"
                disabled={loading}
              >
                <Text className="auth-secondary-button-text">Apple</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
