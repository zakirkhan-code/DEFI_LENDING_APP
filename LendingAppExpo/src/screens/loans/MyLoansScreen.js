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
import { fetchMyLoans } from "../../redux/slices/loanSlice";

const MyLoansScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { myLoans, isLoading } = useSelector((state) => state.loan);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // all, active, repaid, defaulted

  useEffect(() => {
    loadMyLoans();
  }, []);

  const loadMyLoans = async () => {
    try {
      await dispatch(fetchMyLoans());
    } catch (error) {
      console.error("Error loading loans:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyLoans();
    setRefreshing(false);
  };

  const getFilteredLoans = () => {
    if (!myLoans) return [];

    switch (filter) {
      case "active":
        return myLoans.filter((loan) => loan.isActive);
      case "repaid":
        return myLoans.filter((loan) => loan.isRepaid);
      case "defaulted":
        return myLoans.filter((loan) => loan.isDefaulted);
      default:
        return myLoans;
    }
  };

  const renderLoanItem = ({ item }) => (
    <Card
      style={styles.loanCard}
      onPress={() =>
        navigation.navigate("LoanDetails", { loanId: item.loanId })
      }
    >
      <View style={styles.loanHeader}>
        <View style={styles.loanInfo}>
          <Text style={styles.loanAmount}>{item.loanAmount} ETH</Text>
          <Text style={styles.lenderName}>
            Lender: {item.lenderName || "Anonymous"}
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
        <LoanDetail
          icon="calendar-outline"
          label="End Date"
          value={new Date(item.endTime * 1000).toLocaleDateString()}
        />
        <LoanDetail
          icon="trending-up"
          label="Interest"
          value={`${item.interestRate}%`}
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
      <Text style={styles.emptyText}>No loans yet</Text>
      <Text style={styles.emptySubtext}>
        Create a loan request to get started
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate("CreateLoan")}
      >
        <Text style={styles.emptyButtonText}>Create Loan Request</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !myLoans) {
    return <Loading fullScreen />;
  }

  const filteredLoans = getFilteredLoans();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="My Loans" subtitle={`${filteredLoans.length} loans`} />

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
        renderItem={renderLoanItem}
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
  lenderName: {
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

export default MyLoansScreen;
