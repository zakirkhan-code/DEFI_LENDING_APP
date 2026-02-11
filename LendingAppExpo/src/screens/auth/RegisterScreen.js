import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons as Icon } from "@expo/vector-icons";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { register } from "../../redux/slices/authSlice";

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    walletAddress: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Add at top of RegisterScreen
  const testBackend = async () => {
    console.log("=================================");
    console.log("🧪 Testing Backend Connection");
    console.log("📡 URL:", `${API_BASE_URL}/auth/register`);
    console.log("=================================");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Test User",
          email: "test@test.com",
          password: "password123",
        }),
      });

      console.log("Response Status:", response.status);

      const data = await response.json();
      console.log("Response Data:", data);

      Alert.alert("Success", JSON.stringify(data));
    } catch (error) {
      console.error("Test Error:", error);
      Alert.alert("Error", error.message);
    }
  };

  // Add test button before main register button
  <Button
    title="Test Backend Connection"
    onPress={testBackend}
    variant="outline"
    fullWidth
    style={{ marginBottom: spacing.md }}
  />;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // ✅ Validate wallet address if provided
    if (formData.walletAddress.trim()) {
      const walletRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!walletRegex.test(formData.walletAddress)) {
        newErrors.walletAddress =
          "Invalid Ethereum address. Must start with 0x followed by 40 hex characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    console.log("=================================");
    console.log("🎯 Registration Button Clicked");
    console.log("📋 Form Data:", {
      name: formData.name,
      email: formData.email,
      hasWallet: !!formData.walletAddress,
    });
    console.log("=================================");

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      if (formData.walletAddress.trim()) {
        userData.walletAddress = formData.walletAddress;
      }

      console.log("📤 Dispatching register action...");

      const result = await dispatch(register(userData)).unwrap();

      console.log("=================================");
      console.log("🎉 Registration Success:", result);
      console.log("=================================");

      // Navigation handled by AppNavigator
    } catch (err) {
      console.log("=================================");
      console.error("💥 Registration Failed");
      console.error("Error Type:", err.constructor.name);
      console.error("Error Message:", err.message);
      console.error("Full Error:", err);
      console.log("=================================");

      Alert.alert(
        "Registration Failed",
        err.message || err || "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join the decentralized lending platform
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            error={errors.name}
            leftIcon={
              <Icon
                name="person-outline"
                size={20}
                color={colors.textSecondary}
              />
            }
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            leftIcon={
              <Icon
                name="mail-outline"
                size={20}
                color={colors.textSecondary}
              />
            }
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChangeText={(text) =>
              setFormData({ ...formData, password: text })
            }
            secureTextEntry={!showPassword}
            error={errors.password}
            leftIcon={
              <Icon
                name="lock-closed-outline"
                size={20}
                color={colors.textSecondary}
              />
            }
            rightIcon={
              <Icon
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.textSecondary}
              />
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChangeText={(text) =>
              setFormData({ ...formData, confirmPassword: text })
            }
            secureTextEntry={!showConfirmPassword}
            error={errors.confirmPassword}
            leftIcon={
              <Icon
                name="lock-closed-outline"
                size={20}
                color={colors.textSecondary}
              />
            }
            rightIcon={
              <Icon
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.textSecondary}
              />
            }
            onRightIconPress={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          />

          <Input
            label="Wallet Address (Optional)"
            placeholder="0x5F7668D007FBa59F54F5Ccf8dD2c304f4766cfa3"
            value={formData.walletAddress}
            onChangeText={(text) =>
              setFormData({ ...formData, walletAddress: text })
            }
            autoCapitalize="none"
            error={errors.walletAddress}
            leftIcon={
              <Icon
                name="wallet-outline"
                size={20}
                color={colors.textSecondary}
              />
            }
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
            style={styles.registerButton}
          />

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: spacing.xl,
  },
  registerButton: {
    marginTop: spacing.lg,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default RegisterScreen;
