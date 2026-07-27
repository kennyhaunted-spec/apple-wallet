import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/screens/HomeScreen';
import CardDetailScreen from '@/screens/CardDetailScreen';
import AddCardScreen from '@/screens/AddCardScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import SendMoneyScreen from '@/screens/SendMoneyScreen';
import ManageTransactionsScreen from '@/screens/ManageTransactionsScreen';

export type RootStackParamList = {
  Home: undefined;
  CardDetail: { cardId: string };
  AddCard: undefined;
  Settings: undefined;
  SendMoney: { cardId: string };
  ManageTransactions: { cardId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen 
          name="CardDetail" 
          component={CardDetailScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="AddCard" component={AddCardScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="SendMoney" component={SendMoneyScreen} />
        <Stack.Screen name="ManageTransactions" component={ManageTransactionsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
