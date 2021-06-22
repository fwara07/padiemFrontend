import React from "react";
import { View, Alert } from "react-native";
import { Button } from "react-native-elements";

const Settings = ({ navigation, logoutSuccess }) => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Button
        title="Logout"
        type="outline"
        onPress={() => {
          logoutSuccess();
        }}
        buttonStyle={{
          borderRadius: 5,
          height: 45,
          margin: 35,
          padding: 35,
        }}
      />
    </View>
  );
};

export default Settings;
