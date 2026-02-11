import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons as Icon } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { spacing, borderRadius } from "../../theme/spacing";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import {
  fetchPlatformStats,
  fetchActiveLoanRequests,
} from "../../redux/slices/loanSlice";
import { fetchUserStats, fetchCreditScore } from "../../redux/slices/userSlice";

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { platformStats, activeLoanRequests, isLoading } = useSelector(
    (state) => state.loan,
  );
  const { userStats, creditScore } = useSelector((state) => state.user);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchPlatformStats()),
        dispatch(fetchActiveLoanRequests()),
        dispatch(fetchUserStats()),
        dispatch(fetchCreditScore()),
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (isLoading && !platformStats) {
    return <Loading fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")}
            style={styles.profileButton}
          >
            <Icon
              name="person-circle-outline"
              size={40}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Credit Score Card */}
        <Card style={styles.creditCard}>
          <View style={styles.creditCardHeader}>
            <Text style={styles.creditCardTitle}>Your Credit Score</Text>
            <Icon name="star" size={20} color={colors.warning} />
          </View>
          <Text style={styles.creditScore}>{creditScore || 0}</Text>
          <View style={styles.creditScoreBar}>
            <View
              style={[
                styles.creditScoreFill,
                { width: `${((creditScore || 0) / 1000) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.creditCardSubtitle}>Out of 1000</Text>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="wallet-outline"
            title="Borrowed"
            value={`${userStats?.borrowed?.total || 0}`}
            color={colors.primary}
          />
          <StatCard
            icon="cash-outline"
            title="Lent"
            value={`${userStats?.lent?.total || 0}`}
            color={colors.success}
          />
          <StatCard
            icon="time-outline"
            title="Active"
            value={`${(userStats?.borrowed?.active || 0) + (userStats?.lent?.active || 0)}`}
            color={colors.warning}
          />
        </View>

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
              icon="list-outline"
              title="Browse Loans"
              onPress={() => navigation.navigate("Loans")}
            />
            <ActionButton
              icon="stats-chart-outline"
              title="My Activity"
              onPress={() => navigation.navigate("Activity")}
            />
            <ActionButton
              icon="wallet-outline"
              title="Wallet"
              onPress={() => navigation.navigate("Wallet")}
            />
          </View>
        </Card>

        {/* Platform Stats */}
        {platformStats && (
          <Card style={styles.platformCard}>
            <Text style={styles.sectionTitle}>Platform Statistics</Text>
            <View style={styles.platformStats}>
              <PlatformStat
                label="Total Loans"
                value={platformStats.totalLoans}
              />
              <PlatformStat
                label="Active Requests"
                value={platformStats.totalRequests}
              />
              <PlatformStat
                label="Platform Fee"
                value={`${platformStats.platformFee}%`}
              />
              <PlatformStat
                label="Token Supply"
                value={`${parseFloat(platformStats.loanTokenSupply).toFixed(0)}M`}
              />
            </View>
          </Card>
        )}

        {/* Recent Loan Requests */}
        {activeLoanRequests && activeLoanRequests.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Loan Requests</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Loans")}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {activeLoanRequests.slice(0, 3).map((request) => (
              <LoanRequestItem
                key={request.requestId}
                request={request}
                onPress={() =>
                  navigation.navigate("LoanDetails", {
                    requestId: request.requestId,
                  })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, color }) => (
  <Card style={styles.statCard}>
    <Icon name={icon} size={24} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </Card>
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

// Platform Stat Component
const PlatformStat = ({ label, value }) => (
  <View style={styles.platformStatItem}>
    <Text style={styles.platformStatValue}>{value}</Text>
    <Text style={styles.platformStatLabel}>{label}</Text>
  </View>
);

// Loan Request Item Component
const LoanRequestItem = ({ request, onPress }) => (
  <Card style={styles.loanRequestItem} onPress={onPress}>
    <View style={styles.loanRequestHeader}>
      <View>
        <Text style={styles.loanRequestAmount}>
          {request.requestedAmount} ETH
        </Text>
        <Text style={styles.loanRequestBorrower}>
          {request.borrowerName || "Anonymous"}
        </Text>
      </View>
      <View style={styles.loanRequestBadge}>
        <Text style={styles.loanRequestBadgeText}>{request.interestRate}%</Text>
      </View>
    </View>
    <View style={styles.loanRequestFooter}>
      <Text style={styles.loanRequestDetail}>
        Duration: {request.duration} days
      </Text>
      <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
    </View>
  </Card>
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
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginTop: spacing.xs,
  },
  profileButton: {
    padding: spacing.xs,
  },
  creditCard: {
    backgroundColor: colors.primary,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  creditCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  creditCardTitle: {
    fontSize: 16,
    color: colors.white,
    fontWeight: "600",
  },
  creditScore: {
    fontSize: 48,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: spacing.sm,
  },
  creditScoreBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  creditScoreFill: {
    height: "100%",
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
  },
  creditCardSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
    alignItems: "center",
    padding: spacing.md,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginVertical: spacing.xs,
  },
  statTitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionsCard: {
    marginBottom: spacing.lg,
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
  platformCard: {
    marginBottom: spacing.lg,
  },
  platformStats: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  platformStatItem: {
    width: "50%",
    marginBottom: spacing.md,
  },
  platformStatValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  platformStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  recentSection: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  loanRequestItem: {
    marginBottom: spacing.sm,
  },
  loanRequestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  loanRequestAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  loanRequestBorrower: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  loanRequestBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  loanRequestBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
  loanRequestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  loanRequestDetail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default HomeScreen;
