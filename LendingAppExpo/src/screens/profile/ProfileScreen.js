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
import { colors } from "../../theme/colors";
import { spacing, borderRadius } from "../../theme/spacing";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { logout } from "../../redux/slices/authSlice";

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { creditScore } = useSelector((state) => state.user);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await dispatch(logout());
        },
      },
    ]);
  };

  const handleConnectWallet = () => {
    Alert.alert(
      "Connect Wallet",
      "Wallet connection will be implemented in the next phase with WalletConnect integration.",
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Icon name="person" size={48} color={colors.primary} />
            </View>
          </View>

          <Text style={styles.userName}>{user?.name || "User"}</Text>
          <Text style={styles.userEmail}>
            {user?.email || "email@example.com"}
          </Text>

          {user?.walletAddress && (
            <View style={styles.walletBadge}>
              <Icon name="wallet-outline" size={16} color={colors.success} />
              <Text style={styles.walletText} numberOfLines={1}>
                {user.walletAddress.slice(0, 6)}...
                {user.walletAddress.slice(-4)}
              </Text>
            </View>
          )}
        </Card>

        {/* Credit Score Card */}
        <TouchableOpacity
          onPress={() => navigation.navigate("CreditScore")}
          activeOpacity={0.7}
        >
          <Card style={styles.creditScoreCard}>
            <View style={styles.creditScoreHeader}>
              <View style={styles.creditScoreInfo}>
                <Text style={styles.creditScoreLabel}>Credit Score</Text>
                <Text style={styles.creditScoreValue}>{creditScore || 0}</Text>
              </View>
              <Icon name="star" size={32} color={colors.warning} />
            </View>
            <View style={styles.creditScoreBar}>
              <View
                style={[
                  styles.creditScoreFill,
                  { width: `${((creditScore || 0) / 1000) * 100}%` },
                ]}
              />
            </View>
            <View style={styles.creditScoreFooter}>
              <Text style={styles.creditScoreSubtext}>Tap to view details</Text>
              <Icon
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </View>
          </Card>
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>

          {!user?.walletAddress && (
            <MenuItem
              icon="wallet-outline"
              title="Connect Wallet"
              subtitle="Link your Web3 wallet"
              onPress={handleConnectWallet}
              iconColor={colors.primary}
            />
          )}

          <MenuItem
            icon="wallet-outline"
            title="Wallet"
            subtitle="View balance & transactions"
            onPress={() => navigation.navigate("Wallet")}
          />

          <MenuItem
            icon="stats-chart-outline"
            title="Credit Score"
            subtitle="View your lending history"
            onPress={() => navigation.navigate("CreditScore")}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>

          <MenuItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get help with the app"
            onPress={() => Alert.alert("Help", "Help center coming soon!")}
          />

          <MenuItem
            icon="document-text-outline"
            title="Terms & Conditions"
            subtitle="Read our terms"
            onPress={() => Alert.alert("Terms", "Terms & Conditions")}
          />

          <MenuItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            subtitle="How we protect your data"
            onPress={() => Alert.alert("Privacy", "Privacy Policy")}
          />
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>DeFi Lending v1.0.0</Text>
          <Text style={styles.appSubtext}>Built with ❤️ on Ethereum</Text>
        </View>

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          fullWidth
          icon={<Icon name="log-out-outline" size={20} color={colors.error} />}
          style={styles.logoutButton}
          textStyle={{ color: colors.error }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// Menu Item Component
const MenuItem = ({ icon, title, subtitle, onPress, iconColor }) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuIconContainer}>
      <Icon name={icon} size={24} color={iconColor || colors.text} />
    </View>
    <View style={styles.menuTextContainer}>
      <Text style={styles.menuTitle}>{title}</Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.primary,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  walletBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.success,
  },
  walletText: {
    fontSize: 12,
    color: colors.success,
    fontFamily: "monospace",
    marginLeft: spacing.sm,
    fontWeight: "600",
  },
  creditScoreCard: {
    marginBottom: spacing.md,
  },
  creditScoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  creditScoreInfo: {
    flex: 1,
  },
  creditScoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  creditScoreValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
  },
  creditScoreBar: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  creditScoreFill: {
    height: "100%",
    backgroundColor: colors.warning,
    borderRadius: borderRadius.sm,
  },
  creditScoreFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  creditScoreSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  menuSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  appInfo: {
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  appVersion: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  appSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  logoutButton: {
    borderColor: colors.error,
    marginBottom: spacing.lg,
  },
});

export default ProfileScreen;
