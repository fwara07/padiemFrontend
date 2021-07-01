import moment from "moment";
import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Input, Icon, Button } from "react-native-elements";
import DateRangePicker from "rnv-date-range-picker";
import * as SecureStore from "expo-secure-store";
// import DropDownPicker from "react-native-dropdown-picker";

const CreateMission = ({ navigation }) => {
  const [selectedRange, setRange] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [open, setOpen] = useState(false);
  // const [value, setValue] = useState(null);
  // const [items, setItems] = useState([
  //   { label: "Hotel", value: "hotel" },
  //   { label: "Transport", value: "transport" },
  //   { label: "Catering", value: "catering" },
  //   { label: "Other", value: "other" },
  // ]);
  const [name, setName] = useState("");
  const [errorDate, setErrorDate] = useState(false);
  const [errorNameMsg, setErrorNameMsg] = useState("");
  const validate = () => {
    if (name === "") {
      setErrorNameMsg("Mission name connot be empty.");
      return false;
    } else if (Object.keys(selectedRange).length === 0) {
      setErrorDate(true);
      return false;
    } else {
      return true;
    }
  };

  const submit = async () => {
    setLoading(true);
    if (validate()) {
      console.log(selectedRange);
      console.log(
        JSON.stringify({
          name: name,
          start_date: moment(selectedRange.firstDate, "LL").format(
            "YYYY-MM-DDThh:mm"
          ),
          end_date: moment(selectedRange.secondDate, "LL").format(
            "YYYYY-MM-DDThh:mm"
          ),
        })
      );
      let token = await SecureStore.getItemAsync("token");
      fetch("https://pardiembackend.herokuapp.com/api/create-mission", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `JWT ${JSON.parse(token)}`,
        },
        body: JSON.stringify({
          name: name,
          start_date: moment(selectedRange.firstDate, "LL").format(
            "YYYY-MM-DDThh:mm"
          ),
          end_date: moment(selectedRange.secondDate, "LL").format(
            "YYYY-MM-DDThh:mm"
          ),
        }),
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.hasOwnProperty("msg")) {
            Alert.alert(json.msg);
          }
          console.log(json);
          setLoading(false);
          navigation.navigate("Missions", {
            refresh: true,
          });
        })
        .catch((erorr) => console.error(erorr));
    }
  };

  return (
    // <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
    <SafeAreaView
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <>
          <Text style={{ fontSize: 30, marginBottom: 40 }}>
            Create a mission
          </Text>
          <Input
            placeholder="Name of the Mission"
            containerStyle={{
              paddingLeft: 10,
              paddingRight: 10,
              width: "80%",
            }}
            value={name}
            onChangeText={(name) => setName(name)}
            errorMessage={errorNameMsg}
            errorStyle={{ color: "red" }}
          />
          <View style={{ flexDirection: "row" }}>
            <Text
              style={{
                fontSize: 15,
                marginTop: 25,
                marginRight: 10,
                color: errorDate ? "red" : "black",
              }}
            >
              Select Date Range&nbsp; -&gt;&gt;
            </Text>
            <Modal
              animationType="slide"
              transparent={false}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}
            >
              <View style={{ margin: 10 }}>
                <DateRangePicker
                  onSelectDateRange={(range) => {
                    setRange(range);
                  }}
                  responseFormat="LL"
                  minDate={moment()}
                />
                {Object.keys(selectedRange).length === 0 ? (
                  <View
                    style={{ alignItems: "center", justifyContent: "center" }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        marginTop: 25,
                        marginBottom: 25,
                        fontWeight: "bold",
                      }}
                    >
                      No Selected Dates
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{ alignItems: "center", justifyContent: "center" }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        marginTop: 25,
                        marginBottom: 25,
                        fontWeight: "bold",
                      }}
                    >{`${selectedRange.firstDate} to ${selectedRange.secondDate}`}</Text>
                  </View>
                )}
                <Button
                  containerStyle={{ marginTop: 20 }}
                  title="Save"
                  type="outline"
                  color="blue"
                  onPress={() => setModalVisible(!modalVisible)}
                />
                <Button
                  containerStyle={{ marginTop: 20 }}
                  title="Exit"
                  color="blue"
                  onPress={() => {
                    setRange({});
                    setModalVisible(!modalVisible);
                  }}
                />
              </View>
            </Modal>
            <Icon
              reverse
              type="font-awesome"
              reverseColor="#3897f1"
              color="white"
              name="calendar"
              onPress={() => setModalVisible(true)}
              size={30}
            />
          </View>
          {/* <View style={{ alignItems: "center", justifyContent: "center" }}>
        <DropDownPicker
          open={open}
          style={{
            backgroundColor: "transparent",
            borderColor: "#3897f1",
            width: "80%",
            marginTop: 10,
          }}
          placeholder="Select a category"
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
      </View> */}
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Button
              title="Submit"
              color="blue"
              containerStyle={{ width: 300, borderRadius: 10, marginTop: 10 }}
              onPress={submit}
            />
          </View>
        </>
      )}
    </SafeAreaView>
    // </View>
  );
};

export default CreateMission;
