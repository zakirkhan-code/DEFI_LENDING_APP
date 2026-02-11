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
import { fetchMyLending } from "../../redux/slices/loanSlice";

const MyLendingScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { myLending, isLoading } = useSelector((state) => state.loan);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // all, active, repaid, defaulted

  useEffect(() => {
    loadMyLending();
  }, []);

  const loadMyLending = async () => {
    try {
      await dispatch(fetchMyLending());
    } catch (error) {
      console.error("Error loading lending history:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyLending();
    setRefreshing(false);
  };

  const getFilteredLoans = () => {
    if (!myLending) return [];

    switch (filter) {
      case "active":
        return myLending.filter((loan) => loan.isActive);
      case "repaid":
        return myLending.filter((loan) => loan.isRepaid);
      case "defaulted":
        return myLending.filter((loan) => loan.isDefaulted);
      default:
        return myLending;
    }
  };

  const calculateTotalEarnings = () => {
    if (!myLending) return "0.00";

    const total = myLending
      .filter((loan) => loan.isRepaid)
      .reduce((sum, loan) => {
        const interest =
          (parseFloat(loan.loanAmount) * loan.interestRate) / 10000;
        return sum + interest;
      }, 0);

    return total.toFixed(4);
  };

  const renderLendingItem = ({ item }) => (
    <Card
      style={styles.loanCard}
      onPress={() =>
        navigation.navigate("LoanDetails", { loanId: item.loanId })
      }
    >
      <View style={styles.loanHeader}>
        <View style={styles.loanInfo}>
          <Text style={styles.loanAmount}>{item.loanAmount} ETH</Text>
          <Text style={styles.borrowerName}>
            Borrower: {item.borrowerName || "Anonymous"}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: item.isActive
                ? colors.success
                : item.isRepaid
                  ? colors.primary
                  : colors.error,
            },
          ]}
        >
          <Text style={styles.statusText}>
            {item.isActive ? "Active" : item.isRepaid ? "Repaid" : "Defaulted"}
          </Text>
        </View>
      </View>

      <View style={styles.loanDetails}>
        <LendingDetail
          icon="calendar-outline"
          label="End Date"
          value={new Date(item.endTime * 1000).toLocaleDateString()}
        />
        <LendingDetail
          icon="trending-up"
          label="Interest"
          value={`${item.interestRate}%`}
        />
        <LendingDetail
          icon="cash-outline"
          label="Earnings"
          value={`${((parseFloat(item.loanAmount) * item.interestRate) / 10000).toFixed(4)} ETH`}
          highlight={item.isRepaid}
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
      <Icon name="cash-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyText}>No lending history</Text>
      <Text style={styles.emptySubtext}>Start lending to earn interest</Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate("Loans")}
      >
        <Text style={styles.emptyButtonText}>Browse Loan Requests</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !myLending) {
    return <Loading fullScreen />;
  }

  const filteredLoans = getFilteredLoans();

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="My Lending"
        subtitle={`${filteredLoans.length} loans funded`}
      />

      {/* Earnings Summary */}
      {myLending && myLending.length > 0 && (
        <Card style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Total Earnings</Text>
          <Text style={styles.earningsValue}>
            {calculateTotalEarnings()} ETH
          </Text>
          <Text style={styles.earningsSubtext}>
            From {myLending.filter((l) => l.isRepaid).length} repaid loans
          </Text>
        </Card>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FilterTab
          title="All"
          active={filter === "all"}
          onPress={() => setFilter("all")}
        />
        <FilterTab
          title="Active"
          active={filter === "active"}
          onPress={() => setFilter("active")}
        />
        <FilterTab
          title="Repaid"
          active={filter === "repaid"}
          onPress={() => setFilter("repaid")}
        />
        <FilterTab
          title="Defaulted"
          active={filter === "defaulted"}
          onPress={() => setFilter("defaulted")}
        />
      </View>

      <FlatList
        data={filteredLoans}
        renderItem={renderLendingItem}
        keyExtractor={(item) => item.loanId.toString()}
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

// Lending Detail Component
const LendingDetail = ({ icon, label, value, highlight }) => (
  <View style={styles.detailItem}>
    <Icon
      name={icon}
      size={16}
      color={highlight ? colors.success : colors.textSecondary}
    />
    <View style={styles.detailText}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[styles.detailValue, highlight && styles.detailValueHighlight]}
      >
        {value}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  earningsCard: {
    backgroundColor: colors.success,
    alignItems: "center",
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  earningsLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: spacing.xs,
  },
  earningsValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: spacing.xs,
  },
  earningsSubtext: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
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
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.white,
  },
  loanDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.lg,
    marginBottom: spacing.sm,
    width: "45%",
  },
  detailText: {
    marginLeft: spacing.sm,
    flex: 1,
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
  detailValueHighlight: {
    color: colors.success,
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
    textAlign: "center",
  },
  emptyButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
});

export default MyLendingScreen;
