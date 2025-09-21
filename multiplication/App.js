import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TitleScreen from './screens/TitleScreen';
import CodeScreen from './screens/CodeScreen';
import SelectCharacter from './screens/SelectCharacter';
import NameScreen from './screens/NameScreen';
import PasswordScreen from './screens/PasswordScreen';
import QuizScreen from './screens/QuizScreen';
import RankingScreen from './screens/RankingScreen';
import WaitScreen from './screens/WaitScreen';
import ResultScreen from './screens/ResultScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="TitleScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="TitleScreen" component={TitleScreen} />
        <Stack.Screen name="CodeScreen" component={CodeScreen} />
        <Stack.Screen name="SelectCharacter" component={SelectCharacter} />
        <Stack.Screen name="NameScreen" component={NameScreen} />
        <Stack.Screen name="PasswordScreen" component={PasswordScreen} />
        <Stack.Screen name="WaitScreen" component={WaitScreen} />
        <Stack.Screen name="QuizScreen" component={QuizScreen} />
        <Stack.Screen name="RankingScreen" component={RankingScreen} />
        <Stack.Screen name="ResultScreen" component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
