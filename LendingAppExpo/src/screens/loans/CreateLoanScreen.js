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
import { useSelector } from "react-redux";
import { Ionicons as Icon } from "@expo/vector-icons";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Header from "../../components/common/Header";
import { colors } from "../../theme/colors";
import { spacing, borderRadius } from "../../theme/spacing";
import {
  INTEREST_RATES,
  LOAN_DURATIONS,
  COLLATERAL_RATIO,
} from "../../utils/constants";

const CreateLoanScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);

  const [loanAmount, setLoanAmount] = useState("");
  const [selectedInterest, setSelectedInterest] = useState(INTEREST_RATES[0]);
  const [selectedDuration, setSelectedDuration] = useState(LOAN_DURATIONS[2]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate collateral
  const calculateCollateral = () => {
    const amount = parseFloat(loanAmount);
    if (isNaN(amount) || amount <= 0) return "0.00";
    return (amount * COLLATERAL_RATIO).toFixed(4);
  };

  // Calculate total repayment
  const calculateRepayment = () => {
    const amount = parseFloat(loanAmount);
    if (isNaN(amount) || amount <= 0) return "0.00";
    const interest = (amount * selectedInterest.value) / 10000;
    return (amount + interest).toFixed(4);
  };

  const handleCreateLoanRequest = async () => {
    // Validation
    if (!loanAmount || parseFloat(loanAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid loan amount");
      return;
    }

    if (!user?.walletAddress) {
      Alert.alert(
        "Wallet Not Connected",
        "Please connect your wallet to create a loan request",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Connect Wallet",
            onPress: () => navigation.navigate("Profile"),
          },
        ],
      );
      return;
    }

    Alert.alert(
      "Create Loan Request",
      `You are about to create a loan request for ${loanAmount} ETH with ${selectedInterest.label} interest for ${selectedDuration.label}.\n\nCollateral Required: ${calculateCollateral()} ETH\n\nTotal Repayment: ${calculateRepayment()} ETH\n\nProceed to wallet to complete transaction.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Proceed",
          onPress: handleWalletTransaction,
        },
      ],
    );
  };

  const handleWalletTransaction = () => {
    // TODO: Implement blockchain transaction
    Alert.alert(
      "Coming Soon",
      "Blockchain transaction integration will be completed in the next phase. For now, this creates the request in the backend.",
    );

    // Navigate back
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Create Loan Request"
        leftIcon={<Icon name="close" size={24} color={colors.text} />}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Icon name="information-circle" size={24} color={colors.primary} />
            <Text style={styles.infoTitle}>How it works</Text>
          </View>
          <Text style={styles.infoText}>
            1. Enter loan amount and terms{"\n"}
            2. Deposit {COLLATERAL_RATIO * 100}% collateral{"\n"}
            3. Wait for a lender to fund{"\n"}
            4. Repay before deadline to get collateral back
          </Text>
        </Card>

        {/* Loan Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loan Amount (ETH)</Text>
          <Input
            placeholder="0.00"
            value={loanAmount}
            onChangeText={setLoanAmount}
            keyboardType="decimal-pad"
            leftIcon={
              <Icon name="wallet-outline" size={20} color={colors.primary} />
            }
            style={styles.amountInput}
          />

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmountContainer}>
            {["0.5", "1.0", "2.0", "5.0"].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={styles.quickAmountButton}
                onPress={() => setLoanAmount(amount)}
              >
                <Text style={styles.quickAmountText}>{amount} ETH</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Interest Rate */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interest Rate</Text>
          <View style={styles.optionsGrid}>
            {INTEREST_RATES.map((rate) => (
              <TouchableOpacity
                key={rate.value}
                style={[
                  styles.optionButton,
                  selectedInterest.value === rate.value &&
                    styles.optionButtonActive,
                ]}
                onPress={() => setSelectedInterest(rate)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedInterest.value === rate.value &&
                      styles.optionTextActive,
                  ]}
                >
                  {rate.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loan Duration</Text>
          <View style={styles.optionsGrid}>
            {LOAN_DURATIONS.map((duration) => (
              <TouchableOpacity
                key={duration.value}
                style={[
                  styles.optionButton,
                  selectedDuration.value === duration.value &&
                    styles.optionButtonActive,
                ]}
                onPress={() => setSelectedDuration(duration)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedDuration.value === duration.value &&
                      styles.optionTextActive,
                  ]}
                >
                  {duration.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Loan Summary</Text>

          <SummaryRow
            label="Loan Amount"
            value={`${loanAmount || "0.00"} ETH`}
          />
          <SummaryRow
            label="Interest Rate"
            value={selectedInterest.label}
            highlight
          />
          <SummaryRow label="Duration" value={selectedDuration.label} />
          <SummaryRow
            label="Collateral Required"
            value={`${calculateCollateral()} ETH`}
            highlight
          />

          <View style={styles.summaryDivider} />

          <SummaryRow
            label="Total Repayment"
            value={`${calculateRepayment()} ETH`}
            isTotal
          />
        </Card>

        {/* Create Button */}
        <Button
          title="Create Loan Request"
          onPress={handleCreateLoanRequest}
          loading={isSubmitting}
          disabled={!loanAmount || parseFloat(loanAmount) <= 0}
          fullWidth
          style={styles.createButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// Summary Row Component
const SummaryRow = ({ label, value, highlight, isTotal }) => (
  <View style={styles.summaryRow}>
    <Text
      style={[
        styles.summaryLabel,
        isTotal && styles.summaryLabelTotal,
        highlight && styles.summaryLabelHighlight,
      ]}
    >
      {label}
    </Text>
    <Text
      style={[
        styles.summaryValue,
        isTotal && styles.summaryValueTotal,
        highlight && styles.summaryValueHighlight,
      ]}
    >
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
  infoCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginLeft: spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  amountInput: {
    marginBottom: spacing.md,
  },
  quickAmountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAmountButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing.xs,
  },
  optionButton: {
    width: "31.33%",
    marginHorizontal: spacing.xs,
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  optionTextActive: {
    color: colors.white,
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryLabelHighlight: {
    color: colors.primary,
    fontWeight: "600",
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  summaryValueHighlight: {
    color: colors.primary,
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  createButton: {
    marginBottom: spacing.lg,
  },
});

export default CreateLoanScreen;
