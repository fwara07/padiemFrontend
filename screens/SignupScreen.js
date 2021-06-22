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

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [renderMsg, setRenderMsg] = useState({
    msg: "",
    type: "",
  });
  const [loading, setLoading] = useState(false);

  const validateData = (email, password, confirmPassword) => {
    const reEmail = /\S+@\S+\.\S+/;
    const rePassword = /(?=.*\d)(?=.*[a-z]).{6,}/;
    console.log(email);
    if (reEmail.test(email)) {
      if (rePassword.test(password)) {
        if (password == confirmPassword) {
          return true;
        } else {
          setPassword("");
          setRenderMsg({
            msg: "Passwords do not match.",
            type: "cPassword",
          });
          return false;
        }
      } else {
        setPassword("");
        setConfirmPassword("");
        setRenderMsg({
          msg: "Password must contain at least one number, one letter and six characters.",
          type: "password",
        });
        return false;
      }
    } else {
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRenderMsg({
        msg: "Please provide a valid email.",
        type: "email",
      });
      return false;
    }
  };

  const finalStep = () => {
    setLoading(false);
    navigation.navigate("Login");
  };
  const handleSubmit = async () => {
    setLoading(true);
    if (validateData(email, password, confirmPassword)) {
      fetch("https://pardiembackend.herokuapp.com/accounts/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })
        .then((res) => res.json())
        .then(async (json) => {
          console.log(json);
          if (json.hasOwnProperty("msg")) {
            setRenderMsg({
              msg: json.msg,
              type: "email",
            });
            setLoading(false);
          } else {
            await SecureStore.setItemAsync("token", JSON.stringify(json.token));
            finalStep();
          }
        })
        .catch((error) => console.error(error));
    } else {
      setLoading(false);
    }
  };
  const handleEmailChange = (email) => {
    setEmail(email);
    setRenderMsg({
      msg: "",
      type: "",
    });
  };
  const handlePasswordChange = (password) => {
    setPassword(password);
    setRenderMsg({
      msg: "",
      type: "",
    });
  };
  const handleConfirmPasswordChange = (cPassword) => {
    setConfirmPassword(cPassword);
    setRenderMsg({
      msg: "",
      type: "",
    });
  };
  return (
    <KeyboardAvoidingView style={styles.containerView} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.screenContainer}>
          <View style={styles.formView}>
            <Text style={styles.logoText}>Sign Up</Text>
            <Input
              textContentType="emailAddress"
              keyboardType="email-address"
              autoCompleteType="email"
              placeholder="Email"
              placeholderColor="#c4c3cb"
              style={styles.formTextInput}
              value={email}
              onChangeText={handleEmailChange}
              errorMessage={renderMsg.type === "email" && renderMsg.msg}
              errorStyle={{ color: "red" }}
            />
            <Input
              placeholder="Password"
              placeholderColor="#c4c3cb"
              style={styles.formTextInput}
              secureTextEntry={true}
              value={password}
              onChangeText={handlePasswordChange}
              errorMessage={renderMsg.type === "password" && renderMsg.msg}
              errorStyle={{ color: "red" }}
            />
            <Input
              placeholder="Confirm Password"
              placeholderColor="#c4c3cb"
              style={styles.formTextInput}
              secureTextEntry={true}
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              errorMessage={renderMsg.type === "cPassword" && renderMsg.msg}
              errorStyle={{ color: "red" }}
            />
            <ActivityIndicator size="small" color="blue" animating={loading} />
            <Button
              buttonStyle={styles.btn}
              onPress={handleSubmit}
              title="Sign Up"
            />
            <Button
              title="Already have an account? Login"
              type="clear"
              onPress={() => navigation.navigate("Login")}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;
