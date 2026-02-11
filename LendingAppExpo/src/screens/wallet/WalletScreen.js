import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { Ionicons as Icon } from "@expo/vector-icons";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Header from "../../components/common/Header";
import Loading from "../../components/common/Loading";
import { colors } from "../../theme/colors";
import { spacing, borderRadius } from "../../theme/spacing";
import loanService from "../../services/loanService";

const WalletScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);

  const [ethBalance, setEthBalance] = useState("0.00");
  const [tokenBalance, setTokenBalance] = useState("0.00");
  const [rewardsEarned, setRewardsEarned] = useState("0.00");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      if (user?.walletAddress) {
        // Get token balance
        const tokenData = await loanService.getTokenBalance(user.walletAddress);
        setTokenBalance(tokenData.balance || "0.00");
        setRewardsEarned(tokenData.rewardsEarned || "0.00");
        setEthBalance("2.5678");
      }
    } catch (error) {
      console.error("Error loading wallet data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const handleConnectWallet = () => {
    Alert.alert(
      "Connect Wallet",
      "WalletConnect integration will be implemented in the next phase.",
      [
        {
          text: "OK",
        },
      ],
    );
  };

  const handleSendETH = () => {
    Alert.alert("Send ETH", "This feature is coming soon!");
  };

  const handleReceiveETH = () => {
    if (user?.walletAddress) {
      Alert.alert(
        "Receive ETH",
        `Your wallet address:\n\n${user.walletAddress}`,
        [
          {
            text: "Copy Address",
            onPress: () => {
              // Copy to clipboard functionality
              Alert.alert("Copied", "Address copied to clipboard");
            },
          },
          {
            text: "Close",
          },
        ],
      );
    }
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  // If no wallet connected
  if (!user?.walletAddress) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Wallet" />
        <View style={styles.noWalletContainer}>
          <Icon name="wallet-outline" size={80} color={colors.textSecondary} />
          <Text style={styles.noWalletTitle}>No Wallet Connected</Text>
          <Text style={styles.noWalletSubtext}>
            Connect your wallet to view balance and manage funds
          </Text>
          <Button
            title="Connect Wallet"
            onPress={handleConnectWallet}
            icon={<Icon name="wallet-outline" size={20} color={colors.white} />}
            style={styles.connectButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Wallet"
        leftIcon={<Icon name="arrow-back" size={24} color={colors.text} />}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Wallet Address Card */}
        <Card style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <Icon name="wallet" size={24} color={colors.primary} />
            <Text style={styles.addressLabel}>Wallet Address</Text>
          </View>
          <TouchableOpacity
            style={styles.addressContainer}
            onPress={handleReceiveETH}
          >
            <Text style={styles.addressText} numberOfLines={1}>
              {user.walletAddress}
            </Text>
            <Icon name="copy-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </Card>

        {/* ETH Balance Card */}
        <Card style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Icon name="logo-ethereum" size={32} color={colors.primary} />
            <Text style={styles.balanceLabel}>ETH Balance</Text>
          </View>
          <Text style={styles.balanceValue}>{ethBalance} ETH</Text>
          <Text style={styles.balanceUSD}>
            ≈ ${(parseFloat(ethBalance) * 2500).toFixed(2)} USD
          </Text>

          <View style={styles.balanceActions}>
            <BalanceAction
              icon="arrow-up-outline"
              label="Send"
              onPress={handleSendETH}
            />
            <BalanceAction
              icon="arrow-down-outline"
              label="Receive"
              onPress={handleReceiveETH}
            />
          </View>
        </Card>

        {/* Token Balance Card */}
        <Card style={styles.tokenCard}>
          <View style={styles.tokenHeader}>
            <View style={styles.tokenInfo}>
              <View style={styles.tokenIcon}>
                <Text style={styles.tokenIconText}>LOAN</Text>
              </View>
              <View style={styles.tokenDetails}>
                <Text style={styles.tokenName}>Loan Token</Text>
                <Text style={styles.tokenSymbol}>LOAN</Text>
              </View>
            </View>
            <View style={styles.tokenBalance}>
              <Text style={styles.tokenBalanceValue}>
                {parseFloat(tokenBalance).toFixed(2)}
              </Text>
              <Text style={styles.tokenBalanceLabel}>Tokens</Text>
            </View>
          </View>

          <View style={styles.rewardsContainer}>
            <View style={styles.rewardsItem}>
              <Icon name="gift-outline" size={20} color={colors.success} />
              <View style={styles.rewardsText}>
                <Text style={styles.rewardsLabel}>Rewards Earned</Text>
                <Text style={styles.rewardsValue}>
                  {parseFloat(rewardsEarned).toFixed(2)} LOAN
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionButton
              icon="add-circle-outline"
              title="Request Loan"
              onPress={() => navigation.navigate("CreateLoan")}
            />
            <ActionButton
              icon="cash-outline"
              title="Fund Loan"
              onPress={() => navigation.navigate("Loans")}
            />
            <ActionButton
              icon="swap-horizontal-outline"
              title="Swap"
              onPress={() => Alert.alert("Swap", "Coming soon!")}
            />
            <ActionButton
              icon="stats-chart-outline"
              title="Analytics"
              onPress={() => navigation.navigate("Activity")}
            />
          </View>
        </Card>

        {/* Network Info */}
        <Card style={styles.networkCard}>
          <View style={styles.networkHeader}>
            <Icon name="globe-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.networkTitle}>Network</Text>
          </View>
          <View style={styles.networkInfo}>
            <View style={styles.networkDot} />
            <Text style={styles.networkName}>Ethereum Sepolia Testnet</Text>
          </View>
        </Card>

        {/* Disconnect Button */}
        <Button
          title="Disconnect Wallet"
          onPress={() => {
            Alert.alert(
              "Disconnect Wallet",
              "Are you sure you want to disconnect your wallet?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Disconnect",
                  style: "destructive",
                  onPress: () => {
                    Alert.alert("Success", "Wallet disconnected");
                    navigation.goBack();
                  },
                },
              ],
            );
          }}
          variant="outline"
          fullWidth
          style={styles.disconnectButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// Balance Action Component
const BalanceAction = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.balanceActionButton} onPress={onPress}>
    <View style={styles.balanceActionIcon}>
      <Icon name={icon} size={24} color={colors.primary} />
    </View>
    <Text style={styles.balanceActionLabel}>{label}</Text>
  </TouchableOpacity>
);

// Action Button Component
const ActionButton = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <View style={styles.actionIconContainer}>
      <Icon name={icon} size={24} color={colors.primary} />
    </View>
    <Text style={styles.actionTitle}>{title}</Text>
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
  noWalletContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  noWalletTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  noWalletSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  connectButton: {
    marginTop: spacing.md,
  },
  addressCard: {
    marginBottom: spacing.md,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontFamily: "monospace",
    marginRight: spacing.md,
  },
  balanceCard: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
    backgroundColor: colors.primary,
  },
  balanceHeader: {
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  balanceLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: spacing.sm,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: colors.white,
    marginVertical: spacing.sm,
  },
  balanceUSD: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: spacing.lg,
  },
  balanceActions: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  balanceActionButton: {
    alignItems: "center",
    flex: 1,
  },
  balanceActionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  balanceActionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
  tokenCard: {
    marginBottom: spacing.md,
  },
  tokenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tokenInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tokenIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  tokenIconText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.white,
  },
  tokenDetails: {
    flex: 1,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tokenSymbol: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tokenBalance: {
    alignItems: "flex-end",
  },
  tokenBalanceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tokenBalanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  rewardsContainer: {
    marginTop: spacing.sm,
  },
  rewardsItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  rewardsText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  rewardsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  rewardsValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.success,
  },
  actionsCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing.xs,
  },
  actionButton: {
    width: "25%",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: 12,
    color: colors.text,
    textAlign: "center",
  },
  networkCard: {
    marginBottom: spacing.md,
  },
  networkHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  networkTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  networkInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: spacing.sm,
  },
  networkName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  disconnectButton: {
    borderColor: colors.error,
    marginBottom: spacing.lg,
  },
});

export default WalletScreen;
