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
import { useSignUp, useOAuth, useClerk, useAuth } from "@clerk/expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { signUp } = useSignUp();
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

  const [phase, setPhase] = useState<"input" | "verify">("input");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const validateEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const handleSignUpSubmit = async () => {
    if (!isLoaded || !signUp) return;

    let hasError = false;

    setEmailError(false);
    setPasswordError(false);
    setConfirmPasswordError(false);
    setErrorMsg(null);

    if (!email || !validateEmail(email)) {
      setEmailError(true);
      hasError = true;
    }
    if (!password || password.length < 8) {
      setPasswordError(true);
      hasError = true;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError(true);
      hasError = true;
    }

    if (hasError) {
      if (password && password.length < 8) {
        setErrorMsg("Password must be at least 8 characters.");
      } else if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
      } else {
        setErrorMsg("Please fill in all fields correctly.");
      }
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
      });

      if (result.error) {
        setErrorMsg(
          result.error.message || "An error occurred during sign-up.",
        );
        setLoading(false);
        return;
      }

      const verifyResult = await signUp.verifications.sendEmailCode();
      if (verifyResult.error) {
        setErrorMsg(
          verifyResult.error.message || "Failed to send verification code.",
        );
        setLoading(false);
        return;
      }

      setPhase("verify");
    } catch (err: any) {
      console.error("Sign-up error:", err);
      const errorMessage =
        err?.errors?.[0]?.message ||
        err?.message ||
        "An unexpected error occurred.";
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCodeSubmit = async () => {
    if (!isLoaded || !signUp) return;

    if (!verificationCode || verificationCode.length < 4) {
      setCodeError(true);
      setErrorMsg("Please enter a valid verification code.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setCodeError(false);

    try {
      const verifyResult = await signUp.verifications.verifyEmailCode({
        code: verificationCode,
      });

      if (verifyResult.error) {
        setErrorMsg(verifyResult.error.message || "Invalid verification code.");
        setCodeError(true);
        setLoading(false);
        return;
      }

      if (signUp.status === "complete") {
        await setActive({ session: signUp.createdSessionId });
        router.replace("/(tabs)");
      } else {
        console.warn(
          "Verification completed but status is not complete:",
          signUp.status,
        );
        setErrorMsg(`Verification incomplete. Status: ${signUp.status}`);
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      const errorMessage =
        err?.errors?.[0]?.message ||
        err?.message ||
        "Invalid verification code.";
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !signUp) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await signUp.verifications.sendEmailCode();
      if (result.error) {
        setErrorMsg(
          result.error.message || "Failed to resend verification code.",
        );
      } else {
        setErrorMsg("A new verification code has been sent.");
      }
    } catch (err: any) {
      console.error("Resend code error:", err);
      const errorMessage =
        err?.errors?.[0]?.message ||
        err?.message ||
        "Failed to resend verification code.";
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignUp = async (
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

              {phase === "input" ? (
                <>
                  <Text className="auth-title">Create account</Text>
                  <Text className="auth-subtitle">
                    Start tracking and managing your subscriptions seamlessly
                  </Text>
                </>
              ) : (
                <>
                  <Text className="auth-title">Verify email</Text>
                  <Text className="auth-subtitle text-center">
                    Enter the code sent to {email}
                  </Text>
                </>
              )}
            </View>

            {phase === "input" ? (
              <>
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
                          Password must be at least 8 characters.
                        </Text>
                      )}
                    </View>

                    <View className="auth-field">
                      <Text className="auth-label">Confirm password</Text>
                      <View className="relative">
                        <TextInput
                          className={`auth-input pr-16 ${
                            confirmPasswordError ? "auth-input-error" : ""
                          }`}
                          placeholder="Confirm your password"
                          placeholderTextColor="rgba(0, 0, 0, 0.4)"
                          secureTextEntry={!showConfirmPassword}
                          value={confirmPassword}
                          onChangeText={(val) => {
                            setConfirmPassword(val);
                            setConfirmPasswordError(false);
                          }}
                          autoCapitalize="none"
                          editable={!loading}
                        />
                        <Pressable
                          className="absolute right-4 top-4"
                          onPress={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          disabled={loading}
                        >
                          <Text className="text-sm font-sans-semibold text-accent">
                            {showConfirmPassword ? "Hide" : "Show"}
                          </Text>
                        </Pressable>
                      </View>
                      {confirmPasswordError && (
                        <Text className="auth-error">
                          Passwords must match.
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
                        !email || !password || !confirmPassword || loading
                          ? "auth-button-disabled"
                          : ""
                      }`}
                      onPress={handleSignUpSubmit}
                      disabled={
                        !email || !password || !confirmPassword || loading
                      }
                    >
                      {loading ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                      ) : (
                        <Text className="auth-button-text">Sign up</Text>
                      )}
                    </Pressable>

                    <View className="auth-link-row mt-3">
                      <Text className="auth-link-copy">
                        Already have an account?
                      </Text>
                      <Link href="/(auth)/sign-in" asChild>
                        <Pressable disabled={loading}>
                          <Text className="auth-link">Sign in</Text>
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
                    onPress={() => handleOAuthSignUp("oauth_google")}
                    className="auth-secondary-button flex-row items-center justify-center gap-3"
                    disabled={loading}
                  >
                    <Text className="auth-secondary-button-text">Google</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleOAuthSignUp("oauth_apple")}
                    className="auth-secondary-button flex-row items-center justify-center gap-3"
                    disabled={loading}
                  >
                    <Text className="auth-secondary-button-text">Apple</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <View className="auth-card">
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Verification code</Text>
                    <TextInput
                      className={`auth-input text-center text-xl tracking-[10px] ${
                        codeError ? "auth-input-error" : ""
                      }`}
                      placeholder="000000"
                      placeholderTextColor="rgba(0, 0, 0, 0.2)"
                      keyboardType="numeric"
                      maxLength={6}
                      value={verificationCode}
                      onChangeText={(val) => {
                        setVerificationCode(val);
                        setCodeError(false);
                      }}
                      editable={!loading}
                    />
                    {codeError && (
                      <Text className="auth-error">
                        Please enter the 6-digit code.
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
                      verificationCode.length < 6 || loading
                        ? "auth-button-disabled"
                        : ""
                    }`}
                    onPress={handleVerifyCodeSubmit}
                    disabled={verificationCode.length < 6 || loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text className="auth-button-text">Verify email</Text>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={handleResendCode}
                    className="auth-secondary-button mt-2"
                    disabled={loading}
                  >
                    <Text className="auth-secondary-button-text">
                      Resend Code
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setPhase("input");
                      setVerificationCode("");
                      setErrorMsg(null);
                    }}
                    className="items-center py-2 mt-2"
                    disabled={loading}
                  >
                    <Text className="text-sm font-sans-semibold text-muted-foreground">
                      Start Over
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
