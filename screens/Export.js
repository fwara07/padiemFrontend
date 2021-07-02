import React, { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { View, Text, ActivityIndicator, TextInput, Alert } from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Button, Input } from "react-native-elements";
import DropDownPicker from "react-native-dropdown-picker";

const Export = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    const getReceiptsData = async () => {
      setLoading(true);
      let token = await SecureStore.getItemAsync("token");
      fetch("https://pardiembackend.herokuapp.com/api/get-missions", {
        method: "GET",
        headers: {
          Authorization: `JWT ${JSON.parse(token)}`,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          console.log(json);
          const items = [];
          json.map((mission) => {
            items.push({ label: mission.name, value: mission.name });
          });
          setItems(items);
          setLoading(false);
        })
        .catch((error) => console.error(error));
    };

    getReceiptsData();
  }, []);

  const validate = () => {
    if (value !== null) {
      return true;
    } else {
      Alert.alert("You must select a mission.");
      return false;
    }
  };

  const exportReport = async () => {
    if (validate()) {
      setLoading(true);
      let token = await SecureStore.getItemAsync("token");
      return await fetch("https://pardiembackend.herokuapp.com/api/export", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `JWT ${JSON.parse(token)}`,
        },
        body: JSON.stringify({ note: note, mission: value }),
      })
        .then((res) => res.json())
        .then(async (json) => {
          if (json.hasOwnProperty("msg")) {
            Alert.alert(json.msg);
          } else {
            setLoading(false);
            console.log(json);
            const reportUrl = "data:application/pdf;base64," + String(json.pdf);
            console.log(reportUrl);
            const base64Code = reportUrl.split(
              "data:application/pdf;base64,"
            )[1];
            const filename = FileSystem.documentDirectory + "report.pdf";
            console.log(base64Code);
            await FileSystem.writeAsStringAsync(filename, base64Code, {
              encoding: FileSystem.EncodingType.Base64,
            });
            const _mediaResult = await MediaLibrary.saveToLibraryAsync(
              filename
            );
            await Sharing.shareAsync(filename);
          }
        })
        .catch((error) => console.error(error));
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginTop: 90,
            }}
          >
            <DropDownPicker
              open={open}
              style={{
                backgroundColor: "transparent",
                borderColor: "#3897f1",
                width: "80%",
                marginBottom: 10,
              }}
              placeholder="Select a Mission"
              dropDownContainerStyle={{
                borderColor: "#3897f1",
              }}
              labelStyle={{ borderColor: "#3897f1" }}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
            />
          </View>
          <Input
            placeholder="Notes (optional)"
            multiline
            value={note}
            onChangeText={(note) => setNote(note)}
            containerStyle={{
              width: "80%",
              borderColor: "black",
              borderWidth: 2,
              borderColor: "lightgrey",
              borderRadius: 10,
              marginTop: 20,
            }}
            inputContainerStyle={{
              paddingBottom: 80,
              paddingTop: 10,
              borderBottomWidth: 0,
            }}
          />
          <Text style={{ marginBottom: 40 }}>
            *Any unexpected events or complications
          </Text>
          <Button
            type="outline"
            title="Export detailed report"
            onPress={exportReport}
          />
        </>
      )}
    </View>
  );
};
export default Export;
