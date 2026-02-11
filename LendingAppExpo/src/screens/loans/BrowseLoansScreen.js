import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons as Icon } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { spacing, borderRadius } from "../../theme/spacing";
import Card from "../../components/common/Card";
import Header from "../../components/common/Header";
import Loading from "../../components/common/Loading";
import { fetchActiveLoanRequests } from "../../redux/slices/loanSlice";

const BrowseLoansScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { activeLoanRequests, isLoading } = useSelector((state) => state.loan);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // all, low, medium, high

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      await dispatch(fetchActiveLoanRequests());
    } catch (error) {
      console.error("Error loading loans:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLoans();
    setRefreshing(false);
  };

  const getFilteredLoans = () => {
    if (!activeLoanRequests) return [];

    switch (filter) {
      case "low":
        return activeLoanRequests.filter((loan) => loan.interestRate <= 5);
      case "medium":
        return activeLoanRequests.filter(
          (loan) => loan.interestRate > 5 && loan.interestRate <= 10,
        );
      case "high":
        return activeLoanRequests.filter((loan) => loan.interestRate > 10);
      default:
        return activeLoanRequests;
    }
  };

  const renderLoanItem = ({ item }) => (
    <Card
      style={styles.loanCard}
      onPress={() =>
        navigation.navigate("LoanDetails", { requestId: item.requestId })
      }
    >
      <View style={styles.loanHeader}>
        <View style={styles.loanInfo}>
          <Text style={styles.loanAmount}>{item.requestedAmount} ETH</Text>
          <Text style={styles.borrowerName}>
            {item.borrowerName || "Anonymous Borrower"}
          </Text>
        </View>
        <View
          style={[
            styles.interestBadge,
            {
              backgroundColor:
                item.interestRate <= 5
                  ? colors.success
                  : item.interestRate <= 10
                    ? colors.warning
                    : colors.error,
            },
          ]}
        >
          <Text style={styles.interestText}>{item.interestRate}%</Text>
        </View>
      </View>

      <View style={styles.loanDetails}>
        <LoanDetail
          icon="time-outline"
          label="Duration"
          value={`${item.duration} days`}
        />
        <LoanDetail
          icon="shield-checkmark-outline"
          label="Collateral"
          value={`${item.collateralAmount} ETH`}
        />
      </View>

      <View style={styles.loanFooter}>
        <Text style={styles.viewDetailsText}>View Details</Text>
        <Icon name="chevron-forward" size={20} color={colors.primary} />
      </View>
    </Card>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name="document-text-outline"
        size={64}
        color={colors.textSecondary}
      />
      <Text style={styles.emptyText}>No loan requests available</Text>
      <Text style={styles.emptySubtext}>Check back later for new requests</Text>
    </View>
  );

  if (isLoading && !activeLoanRequests) {
    return <Loading fullScreen />;
  }

  const filteredLoans = getFilteredLoans();

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Browse Loans"
        subtitle={`${filteredLoans.length} requests`}
      />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FilterTab
          title="All"
          active={filter === "all"}
          onPress={() => setFilter("all")}
        />
        <FilterTab
          title="Low (≤5%)"
          active={filter === "low"}
          onPress={() => setFilter("low")}
        />
        <FilterTab
          title="Medium"
          active={filter === "medium"}
          onPress={() => setFilter("medium")}
        />
        <FilterTab
          title="High (>10%)"
          active={filter === "high"}
          onPress={() => setFilter("high")}
        />
      </View>

      <FlatList
        data={filteredLoans}
        renderItem={renderLoanItem}
        keyExtractor={(item) => item.requestId.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyComponent}
      />
    </SafeAreaView>
  );
};

// Filter Tab Component
const FilterTab = ({ title, active, onPress }) => (
  <TouchableOpacity
    style={[styles.filterTab, active && styles.filterTabActive]}
    onPress={onPress}
  >
    <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
      {title}
    </Text>
  </TouchableOpacity>
);

// Loan Detail Component
const LoanDetail = ({ icon, label, value }) => (
  <View style={styles.detailItem}>
    <Icon name={icon} size={16} color={colors.textSecondary} />
    <View style={styles.detailText}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  filterTabTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.md,
  },
  loanCard: {
    marginBottom: spacing.md,
  },
  loanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  loanInfo: {
    flex: 1,
  },
  loanAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  borrowerName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  interestBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  interestText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.white,
  },
  loanDetails: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.lg,
  },
  detailText: {
    marginLeft: spacing.sm,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.xs,
  },
  loanFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});

export default BrowseLoansScreen;
