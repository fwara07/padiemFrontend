import React, { useReducer, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import HomeScreen from "./screens/HomeScreen";
import * as SecureStore from "expo-secure-store";
import SplashScreen from "./screens/SplashScreen";
import Settings from "./screens/Settings";
import Receipts from "./screens/Receipts";

const Stack = createStackNavigator();

const App = () => {
  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {
        case "RESTORE_TOKEN":
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case "SIGN_IN":
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          };
        case "SIGN_OUT":
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
        case "GO_AUTH_SCREENS":
          return {
            ...prevState,
            isSignout: false,
            isLoading: false,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    }
  );

  // const getToken = async () => {
  //   const result =
  //   return result;
  // };

  useEffect(() => {
    const verifyToken = async () => {
      const token = await SecureStore.getItemAsync("token");
      console.log(token);
      if (token != null) {
        fetch("https://pardiembackend.herokuapp.com/accounts/test-auth", {
          method: "GET",
          headers: {
            Authorization: `JWT ${JSON.parse(token)}`,
          },
        }).then((res) => {
          if (res.ok) {
            dispatch({ type: "RESTORE_TOKEN", token: token });
          } else {
            deleteToken();
            dispatch({ type: "GO_AUTH_SCREENS" });
          }
        });
      } else {
        dispatch({ type: "GO_AUTH_SCREENS" });
      }
    };

    verifyToken();
  }, []);

  const loginSuccess = (token) => {
    dispatch({ type: "SIGN_IN", token: token });
  };

  const deleteToken = async () => {
    await SecureStore.deleteItemAsync("token");
  };

  const logoutSuccess = () => {
    deleteToken();
    dispatch({ type: "GO_AUTH_SCREENS" });
  };

  return (
    // <NavigationContainer>
    //   <Stack.Navigator initialRouteName={"Login"}>
    //     <Stack.Screen name="Login" component={LoginScreen} />
    //     <Stack.Screen name="Signup" component={SignupScreen} />
    //     <Stack.Screen name="Home" component={HomeScreen} />
    //     <Stack.Screen name="WaitingScreen" component={HomeScreen} />
    //   </Stack.Navigator>
    // </NavigationContainer>
    <NavigationContainer>
      <Stack.Navigator>
        {state.isLoading ? (
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
        ) : state.userToken == null ? (
          <>
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen loginSuccess={loginSuccess} {...props} />
              )}
            </Stack.Screen>
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Settings">
              {(props) => <Settings logoutSuccess={logoutSuccess} {...props} />}
            </Stack.Screen>
            <Stack.Screen name="Receipts" component={Receipts} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
