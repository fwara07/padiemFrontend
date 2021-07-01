import React, { useState } from "react";
import * as SecureStore from "expo-secure-store";
import styles from "./authStyles";
import {
  Keyboard,
  Text,
  View,
  TextInput,
  TouchableWithoutFeedback,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Button, Input } from "react-native-elements";

const LoginScreen = ({ navigation, loginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [renderMsg, setRenderMsg] = useState({
    msg: "",
  });
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (email) => {
    setEmail(email);
    setRenderMsg({
      msg: "",
    });
  };
  const handlePasswordChange = (password) => {
    setPassword(password);
    setRenderMsg({
      msg: "",
    });
  };

  const finalStep = () => {
    setLoading(false);
    navigation.navigate("Home");
  };

  const handleSubmit = () => {
    fetch("https://pardiembackend.herokuapp.com/accounts/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    })
      .then((res) => res.json())
      .then(async (json) => {
        console.log(json);
        if (json.hasOwnProperty("non_field_errors")) {
          setEmail("");
          setPassword("");
          setRenderMsg({ msg: json["non_field_errors"][0] });
          setLoading(false);
        } else {
          loginSuccess(json.token);
          await SecureStore.setItemAsync("token", JSON.stringify(json.token));
          finalStep();
        }
      })
      .catch((error) => console.error(error));
  };
  return (
    <>
    {loading ? <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator size="large" color="blue"/></View> :
    <KeyboardAvoidingView style={styles.containerView} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.screenContainer}>
          <View style={styles.formView}>
            <Text style={styles.logoText}>Login</Text>
            <Input
              textContentType="emailAddress"
              keyboardType="email-address"
              autoCompleteType="email"
              placeholder="Email"
              placeholderColor="#c4c3cb"
              onChangeText={handleEmailChange}
              value={email}
              style={styles.formTextInput}
            />
            <Input
              placeholder="Password"
              placeholderColor="#c4c3cb"
              style={styles.formTextInput}
              onChangeText={handlePasswordChange}
              errorMessage={renderMsg.msg}
              errorStyle={{ color: "red" }}
              value={password}
              secureTextEntry={true}
            />
            <Button
              buttonStyle={styles.btn}
              onPress={handleSubmit}
              title="Login"
            />
            <Button
              title="Don't have an account? Sign Up"
              type="clear"
              onPress={() => navigation.navigate("Signup")}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
    }
    </>
  );
};

export default LoginScreen;
