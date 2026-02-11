import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons as Icon } from "@expo/vector-icons";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Header from "../../components/common/Header";
import Loading from "../../components/common/Loading";
import { colors } from "../../theme/colors";
import { spacing, borderRadius } from "../../theme/spacing";
import { fetchLoanDetails } from "../../redux/slices/loanSlice";

const LoanDetailsScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { requestId, loanId } = route.params;
  const { currentLoan, isLoading } = useSelector((state) => state.loan);
  const { user } = useSelector((state) => state.auth);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLoanDetails();
  }, []);

  const loadLoanDetails = async () => {
    try {
      if (loanId) {
        await dispatch(fetchLoanDetails(loanId));
      }
      // If only requestId, fetch from requests
    } catch (error) {
      console.error("Error loading loan details:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLoanDetails();
    setRefreshing(false);
  };

  const handleFundLoan = () => {
    Alert.alert("Fund Loan", "Do you want to fund this loan request?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Fund",
        onPress: handleWalletTransaction,
      },
    ]);
  };

  const handleRepayLoan = () => {
    Alert.alert(
      "Repay Loan",
      `Total repayment amount: ${currentLoan?.repayment?.total} ETH\n\nProceed to wallet?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Repay",
          onPress: handleWalletTransaction,
        },
      ],
    );
  };

  const handleWalletTransaction = () => {
    Alert.alert(
      "Coming Soon",
      "Blockchain transaction integration will be completed in the next phase.",
    );
  };

  if (isLoading && !currentLoan) {
    return <Loading fullScreen />;
  }

  if (!currentLoan) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="Loan Details"
          leftIcon={<Icon name="arrow-back" size={24} color={colors.text} />}
          onLeftPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>Loan not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isBorrower =
    user?.walletAddress?.toLowerCase() === currentLoan.borrower?.toLowerCase();
  const isLender =
    user?.walletAddress?.toLowerCase() === currentLoan.lender?.toLowerCase();

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Loan Details"
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
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: currentLoan.isActive
                  ? colors.success
                  : currentLoan.isRepaid
                    ? colors.primary
                    : colors.error,
              },
            ]}
          >
            <Text style={styles.statusText}>
              {currentLoan.isActive
                ? "Active"
                : currentLoan.isRepaid
                  ? "Repaid"
                  : currentLoan.isDefaulted
                    ? "Defaulted"
                    : "Pending"}
            </Text>
          </View>
        </View>

        {/* Loan Amount Card */}
        <Card style={styles.amountCard}>
          <Text style={styles.amountLabel}>Loan Amount</Text>
          <Text style={styles.amountValue}>{currentLoan.loanAmount} ETH</Text>
          <View style={styles.amountDetails}>
            <AmountDetail
              icon="trending-up"
              label="Interest"
              value={`${currentLoan.interestRate}%`}
            />
            <AmountDetail
              icon="shield-checkmark"
              label="Collateral"
              value={`${currentLoan.collateralAmount} ETH`}
            />
          </View>
        </Card>

        {/* Parties Info */}
        <Card style={styles.partiesCard}>
          <Text style={styles.cardTitle}>Participants</Text>

          <PartyInfo
            icon="person-outline"
            label="Borrower"
            name={currentLoan.borrowerName || "Anonymous"}
            address={currentLoan.borrower}
            isYou={isBorrower}
          />

          {currentLoan.lender && (
            <PartyInfo
              icon="cash-outline"
              label="Lender"
              name={currentLoan.lenderName || "Anonymous"}
              address={currentLoan.lender}
              isYou={isLender}
            />
          )}
        </Card>

        {/* Loan Details */}
        <Card style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Loan Details</Text>

          <DetailRow label="Duration" value={`${currentLoan.duration} days`} />
          <DetailRow
            label="Start Date"
            value={
              currentLoan.startTime
                ? new Date(currentLoan.startTime * 1000).toLocaleDateString()
                : "N/A"
            }
          />
          <DetailRow
            label="End Date"
            value={
              currentLoan.endTime
                ? new Date(currentLoan.endTime * 1000).toLocaleDateString()
                : "N/A"
            }
          />
          <DetailRow
            label="Interest Rate"
            value={`${currentLoan.interestRate}%`}
          />
          <DetailRow
            label="Collateral"
            value={`${currentLoan.collateralAmount} ETH`}
          />
        </Card>

        {/* Repayment Details (if loan is active) */}
        {currentLoan.repayment && currentLoan.isActive && (
          <Card style={styles.repaymentCard}>
            <Text style={styles.cardTitle}>Repayment Details</Text>

            <DetailRow
              label="Principal"
              value={`${currentLoan.repayment.principal} ETH`}
            />
            <DetailRow
              label="Interest"
              value={`${currentLoan.repayment.interest} ETH`}
            />
            <DetailRow
              label="Platform Fee"
              value={`${currentLoan.repayment.platformFee} ETH`}
            />

            <View style={styles.repaymentDivider} />

            <DetailRow
              label="Total Repayment"
              value={`${currentLoan.repayment.total} ETH`}
              isTotal
            />
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {!currentLoan.lender && !isBorrower && (
            <Button
              title="Fund This Loan"
              onPress={handleFundLoan}
              fullWidth
              icon={<Icon name="cash-outline" size={20} color={colors.white} />}
            />
          )}

          {currentLoan.isActive && isBorrower && (
            <Button
              title="Repay Loan"
              onPress={handleRepayLoan}
              fullWidth
              icon={
                <Icon
                  name="checkmark-circle-outline"
                  size={20}
                  color={colors.white}
                />
              }
            />
          )}

          {currentLoan.isDefaulted && isLender && (
            <Button
              title="Collateral Claimed"
              disabled
              fullWidth
              variant="outline"
            />
          )}

          {currentLoan.isRepaid && (
            <View style={styles.successContainer}>
              <Icon name="checkmark-circle" size={48} color={colors.success} />
              <Text style={styles.successText}>
                {isBorrower
                  ? "Loan repaid successfully!"
                  : "Loan has been repaid"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Amount Detail Component
const AmountDetail = ({ icon, label, value }) => (
  <View style={styles.amountDetailItem}>
    <Icon name={icon} size={16} color={colors.textSecondary} />
    <View style={styles.amountDetailText}>
      <Text style={styles.amountDetailLabel}>{label}</Text>
      <Text style={styles.amountDetailValue}>{value}</Text>
    </View>
  </View>
);

// Party Info Component
const PartyInfo = ({ icon, label, name, address, isYou }) => (
  <View style={styles.partyInfo}>
    <Icon name={icon} size={24} color={colors.primary} />
    <View style={styles.partyDetails}>
      <Text style={styles.partyLabel}>{label}</Text>
      <Text style={styles.partyName}>
        {name} {isYou && <Text style={styles.youBadge}>(You)</Text>}
      </Text>
      <Text style={styles.partyAddress} numberOfLines={1}>
        {address}
      </Text>
    </View>
  </View>
);

// Detail Row Component
const DetailRow = ({ label, value, isTotal }) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, isTotal && styles.detailLabelTotal]}>
      {label}
    </Text>
    <Text style={[styles.detailValue, isTotal && styles.detailValueTotal]}>
      {value}
    </Text>
  </View>
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
  statusContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  statusBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.white,
  },
  amountCard: {
    alignItems: "center",
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  amountLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.md,
  },
  amountDetails: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  amountDetailItem: {
    alignItems: "center",
  },
  amountDetailText: {
    alignItems: "center",
    marginTop: spacing.sm,
  },
  amountDetailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  amountDetailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.xs,
  },
  partiesCard: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  partyInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  partyDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  partyLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  partyName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  youBadge: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "bold",
  },
  partyAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: "monospace",
  },
  detailsCard: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailLabelTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  detailValueTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  repaymentCard: {
    marginBottom: spacing.md,
  },
  repaymentDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  actionsContainer: {
    marginTop: spacing.md,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  successText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.success,
    marginTop: spacing.md,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.md,
  },
});

export default LoanDetailsScreen;
