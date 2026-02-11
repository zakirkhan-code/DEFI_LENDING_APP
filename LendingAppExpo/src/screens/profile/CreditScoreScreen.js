import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons as Icon } from "@expo/vector-icons";
import Card from "../../components/common/Card";
import Header from "../../components/common/Header";
import Loading from "../../components/common/Loading";
import { colors } from "../../theme/colors";
import { spacing, borderRadius } from "../../theme/spacing";
import { fetchCreditScore } from "../../redux/slices/userSlice";

const CreditScoreScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { creditScore, creditDetails, isLoading } = useSelector(
    (state) => state.user,
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCreditScore();
  }, []);

  const loadCreditScore = async () => {
    try {
      await dispatch(fetchCreditScore());
    } catch (error) {
      console.error("Error loading credit score:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCreditScore();
    setRefreshing(false);
  };

  const getCreditRating = (score) => {
    if (score >= 800) return { label: "Excellent", color: colors.success };
    if (score >= 600) return { label: "Good", color: colors.primary };
    if (score >= 400) return { label: "Fair", color: colors.warning };
    return { label: "Poor", color: colors.error };
  };

  if (isLoading && !creditDetails) {
    return <Loading fullScreen />;
  }

  const rating = getCreditRating(creditScore || 0);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Credit Score"
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
        {/* Score Card */}
        <Card style={styles.scoreCard}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{creditScore || 0}</Text>
            <Text style={styles.scoreMax}>/ 1000</Text>
          </View>

          <View style={[styles.ratingBadge, { backgroundColor: rating.color }]}>
            <Text style={styles.ratingText}>{rating.label}</Text>
          </View>

          <View style={styles.scoreBar}>
            <View
              style={[
                styles.scoreBarFill,
                {
                  width: `${((creditScore || 0) / 1000) * 100}%`,
                  backgroundColor: rating.color,
                },
              ]}
            />
          </View>
        </Card>

        {/* What affects your score */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Icon name="information-circle" size={24} color={colors.primary} />
            <Text style={styles.infoTitle}>What affects your score?</Text>
          </View>

          <InfoItem
            icon="checkmark-circle"
            title="On-time Repayments"
            description="Paying back loans before deadline increases your score"
            impact="positive"
          />

          <InfoItem
            icon="time"
            title="Late Payments"
            description="Missing deadlines decreases your score"
            impact="negative"
          />

          <InfoItem
            icon="close-circle"
            title="Defaults"
            description="Defaulted loans significantly hurt your score"
            impact="negative"
          />

          <InfoItem
            icon="trending-up"
            title="Repayment History"
            description="Higher repayment rate improves your score"
            impact="positive"
          />
        </Card>

        {/* Credit Details */}
        {creditDetails && (
          <Card style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Your Credit History</Text>

            <DetailRow
              label="Total Borrowed"
              value={`${parseFloat(creditDetails.totalBorrowed || 0).toFixed(4)} ETH`}
            />
            <DetailRow
              label="Total Repaid"
              value={`${parseFloat(creditDetails.totalRepaid || 0).toFixed(4)} ETH`}
            />
            <DetailRow
              label="Active Loans"
              value={creditDetails.activeLoans || 0}
            />
            <DetailRow
              label="Defaulted Loans"
              value={creditDetails.defaultedLoans || 0}
              highlight={creditDetails.defaultedLoans > 0}
            />

            <View style={styles.divider} />

            <DetailRow
              label="Repayment Rate"
              value={
                creditDetails.totalBorrowed > 0
                  ? `${(
                      (parseFloat(creditDetails.totalRepaid) /
                        parseFloat(creditDetails.totalBorrowed)) *
                      100
                    ).toFixed(1)}%`
                  : "N/A"
              }
              isTotal
            />
          </Card>
        )}

        {/* Score Range Guide */}
        <Card style={styles.guideCard}>
          <Text style={styles.cardTitle}>Score Range Guide</Text>

          <ScoreRange
            range="800 - 1000"
            label="Excellent"
            color={colors.success}
            description="Best rates & instant approval"
          />
          <ScoreRange
            range="600 - 799"
            label="Good"
            color={colors.primary}
            description="Good rates & fast approval"
          />
          <ScoreRange
            range="400 - 599"
            label="Fair"
            color={colors.warning}
            description="Average rates & standard approval"
          />
          <ScoreRange
            range="0 - 399"
            label="Poor"
            color={colors.error}
            description="Higher rates & slower approval"
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

// Info Item Component
const InfoItem = ({ icon, title, description, impact }) => (
  <View style={styles.infoItem}>
    <Icon
      name={icon}
      size={24}
      color={impact === "positive" ? colors.success : colors.error}
    />
    <View style={styles.infoItemText}>
      <Text style={styles.infoItemTitle}>{title}</Text>
      <Text style={styles.infoItemDescription}>{description}</Text>
    </View>
  </View>
);

// Detail Row Component
const DetailRow = ({ label, value, highlight, isTotal }) => (
  <View style={styles.detailRow}>
    <Text
      style={[
        styles.detailLabel,
        isTotal && styles.detailLabelTotal,
        highlight && styles.detailLabelHighlight,
      ]}
    >
      {label}
    </Text>
    <Text
      style={[
        styles.detailValue,
        isTotal && styles.detailValueTotal,
        highlight && styles.detailValueHighlight,
      ]}
    >
      {value}
    </Text>
  </View>
);

// Score Range Component
const ScoreRange = ({ range, label, color, description }) => (
  <View style={styles.scoreRangeItem}>
    <View style={[styles.scoreRangeColor, { backgroundColor: color }]} />
    <View style={styles.scoreRangeText}>
      <View style={styles.scoreRangeHeader}>
        <Text style={styles.scoreRangeLabel}>{label}</Text>
        <Text style={styles.scoreRangeValue}>{range}</Text>
      </View>
      <Text style={styles.scoreRangeDescription}>{description}</Text>
    </View>
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
  scoreCard: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  scoreCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 8,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: "bold",
    color: colors.text,
  },
  scoreMax: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  ratingBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },
  scoreBar: {
    width: "100%",
    height: 12,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: borderRadius.sm,
  },
  infoCard: {
    marginBottom: spacing.md,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginLeft: spacing.sm,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  infoItemText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  infoItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  infoItemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  detailsCard: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
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
  detailLabelHighlight: {
    color: colors.error,
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
  detailValueHighlight: {
    color: colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  guideCard: {
    marginBottom: spacing.md,
  },
  scoreRangeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  scoreRangeColor: {
    width: 4,
    height: "100%",
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  scoreRangeText: {
    flex: 1,
  },
  scoreRangeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  scoreRangeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  scoreRangeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  scoreRangeDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default CreditScoreScreen;
