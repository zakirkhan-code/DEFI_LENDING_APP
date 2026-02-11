import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons as Icon } from "@expo/vector-icons";
import { colors } from "../theme/colors";

// Screens
import HomeScreen from "../screens/home/HomeScreen";
import BrowseLoansScreen from "../screens/loans/BrowseLoansScreen";
import CreateLoanScreen from "../screens/loans/CreateLoanScreen";
import MyLoansScreen from "../screens/loans/MyLoansScreen";
import MyLendingScreen from "../screens/loans/MyLendingScreen";
import LoanDetailsScreen from "../screens/loans/LoanDetailsScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import CreditScoreScreen from "../screens/profile/CreditScoreScreen";
import WalletScreen from "../screens/wallet/WalletScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home Stack
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="LoanDetails" component={LoanDetailsScreen} />
    <Stack.Screen name="CreateLoan" component={CreateLoanScreen} />
  </Stack.Navigator>
);

// Loans Stack
const LoansStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BrowseLoans" component={BrowseLoansScreen} />
    <Stack.Screen name="LoanDetails" component={LoanDetailsScreen} />
  </Stack.Navigator>
);

// My Activity Stack
const ActivityStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MyLoans" component={MyLoansScreen} />
    <Stack.Screen name="MyLending" component={MyLendingScreen} />
    <Stack.Screen name="LoanDetails" component={LoanDetailsScreen} />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="CreditScore" component={CreditScoreScreen} />
    <Stack.Screen name="Wallet" component={WalletScreen} />
  </Stack.Navigator>
);

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Loans") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Activity") {
            iconName = focused ? "time" : "time-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Loans" component={LoansStack} />
      <Tab.Screen name="Activity" component={ActivityStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
