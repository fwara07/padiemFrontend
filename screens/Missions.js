import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Icon } from "react-native-elements";
import { Button } from "react-native-elements";
import DropDownPicker from "react-native-dropdown-picker";
import SwitchSelector from "react-native-switch-selector";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { useIsFocused } from "@react-navigation/native";

const Missions = ({ route, navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("Transport");
  const [uri, setUri] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState([]);
  const [renderMissionError, setError] = useState(false);
  const [modalLoad, setModalLoad] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    const getReceiptsData = async () => {
      setError(false);
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
          setMissions(json);
          json.map((mission) => {
            items.push({ label: mission.name, value: mission.name });
          });
          setItems(items);
          setLoading(false);
        })
        .catch((error) => console.error(error));
    };

    getReceiptsData();
  }, [isFocused]);

  const validate = () => {
    if (value !== null) {
      if (uri !== "") {
        return true;
      } else {
        Alert.alert("You must have an image of a receipt.");
        return false;
      }
    } else {
      Alert.alert("You must select a mission.");
      return false;
    }
  };

  const sendReceipt = async (type, filename) => {
    let token = await SecureStore.getItemAsync("token");
    console.log(`JWT ${JSON.parse(token)}`);
    console.log(uri);
    let formData = new FormData();
    formData.append("image", { uri: uri, name: filename, type: type });
    formData.append("category", category), formData.append("mission", value);
    console.log(formData);
    return await fetch("https://pardiembackend.herokuapp.com/api/obtain-img", {
      method: "POST",
      headers: {
        "content-type": "multipart/form-data",
        Authorization: `JWT ${JSON.parse(token)}`,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.hasOwnProperty("msg")) {
          setModalLoad(false);
          Alert.alert(json.msg);
          setImage(null);
          setLoading(false);
        } else {
          setModalLoad(false);
          Alert.alert(json.succes);
          console.log(json);
          setLoading(false);
        }
      })
      .catch((error) => console.error(error));
  };

  const uploadImg = async () => {
    if (validate()) {
      setModalLoad(true);
      let token = await SecureStore.getItemAsync("token");
      fetch("https://pardiembackend.herokuapp.com/api/get-s3-info", {
        method: "GET",
        headers: {
          Authorization: `JWT ${JSON.parse(token)}`,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          let filename = uri.split("/").pop();
          let match = /\.(\w+)$/.exec(filename);
          let type = match ? `image/${match[1]}` : `image`;
          var AWS = require("aws-sdk");
          var s3 = new AWS.S3({
            accessKeyId: json.acess_key,
            secretAccessKey: json.secret_acess_key,
            region: json.region,
          });
          console.log(s3);

          var params = {
            Bucket: "pardiem-assets",
            Key: filename,
            ContentType: type,
          };
          s3.getSignedUrl(
            "putObject",
            params,
            (err, url) => {
              const xhr = new XMLHttpRequest();
              xhr.open("PUT", url);
              xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                  if (xhr.status === 200) {
                    sendReceipt(type, filename);
                  } else {
                    console.log("Error while sending the image to S3");
                  }
                }
              };
              xhr.setRequestHeader("Content-Type", type);
              xhr.send({ uri: uri, type: type, name: filename });
            },
            (error) => console.log(error)
          );
        });
      // let token = await SecureStore.getItemAsync("token");
      // let filename = uri.split("/").pop();
      // let match = /\.(\w+)$/.exec(filename);
      // let type = match ? `image/${match[1]}` : `image`;
      // var xhr = new XMLHttpRequest();
      // xhr.open(
      //   "GET",
      //   "https://pardiembackend.herokuapp.com/api/sign_s3?file_name=" +
      //     filename +
      //     "&file_type=" +
      //     type
      // );
      // xhr.setRequestHeader("Authorization", `JWT ${JSON.parse(token)}`);
      // xhr.setRequestHeader("content-type", type);
      // xhr.onreadystatechange = function () {
      //   if (xhr.readyState === 4) {
      //     if (xhr.status === 200) {
      //       var response = JSON.parse(xhr.responseText);
      //       uploadFile(
      //         { uri: uri, name: filename, type: type },
      //         response.data,
      //         response.url
      //       );
      //     } else {
      //       alert("Could not get signed URL.");
      //     }
      //   }
      // };
      // xhr.send();
    } else {
      setLoading(false);
    }
  };

  // const uploadFile = (file, s3Data, url) => {
  //   var xhr = new XMLHttpRequest();
  //   xhr.open("POST", s3Data.url);
  //   xhr.setRequestHeader("x-amz-acl", "public-read");
  //   console.log(s3Data);
  //   var postData = new FormData();
  //   for (let key in s3Data.fields) {
  //     postData.append(key, s3Data.fields[key]);
  //   }
  //   postData.append("file", file);
  //   console.log(postData);
  //   xhr.onreadystatechange = function () {
  //     if (xhr.readyState === 4) {
  //       if (xhr.status === 200 || xhr.status === 204) {
  //       } else {
  //         console.log(xhr.responseText);
  //         alert("Could not upload file.");
  //       }
  //     }
  //   };
  //   xhr.send(postData);
  // };

  const camera = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setUri(result.uri);
      setImage(true);
    }
  };

  const file = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setUri(result.uri);
      console.log(uri);
      setImage(true);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <>
          <Text style={{ fontSize: 22, marginBottom: 10 }}>Create Mission</Text>
          <Icon
            containerStyle={{ marginBottom: 50 }}
            name="add"
            onPress={() => navigation.navigate("Create Mission")}
            reverse
            reverseColor="#3897f1"
            color="white"
            size={30}
          />
          <Text>------------------------------------------</Text>
          <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}
          >
            <SafeAreaView style={{ flex: 1, alignItems: "center" }}>
              {modalLoad ? (
                <View
                  style={{
                    justifyContent: "center",
                    height: "80%",
                  }}
                >
                  <ActivityIndicator size="large" color="blue" />
                </View>
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
                  <SwitchSelector
                    initial={0}
                    onPress={(value) => setCategory(value)}
                    style={{
                      marginTop: 10,
                      marginBottom: 5,
                      marginHorizontal: 30,
                    }}
                    height={50}
                    valuePadding={-3}
                    // hasPadding
                    options={[
                      { label: "Transport", value: "Transport" },
                      { label: "Hotel", value: "Hotel" },
                      { label: "Catering", value: "Catering" },
                      { label: "Other", value: "Other" },
                    ]}
                    bold
                    buttonColor="#3897f1"
                  />
                  <Text style={{ marginBottom: 30 }}>
                    *Select category of receipt
                  </Text>
                  {image ? (
                    <>
                      <Image
                        source={{ uri: uri }}
                        style={{ width: 300, height: 300 }}
                      />
                    </>
                  ) : (
                    <View
                      style={{
                        backgroundColor: "#d9d9d9",
                        width: 300,
                        height: 350,
                        borderRadius: 50,
                        marginBottom: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon
                        containerStyle={{ marginBottom: 50, marginRight: 30 }}
                        name="photo-camera"
                        onPress={() => camera()}
                        reverse
                        reverseColor="#3897f1"
                        color="white"
                        size={30}
                      />
                      <Icon
                        containerStyle={{ marginBottom: 50 }}
                        name="attach-file"
                        onPress={() => file()}
                        reverse
                        reverseColor="#3897f1"
                        color="white"
                        size={30}
                      />
                    </View>
                  )}
                  <Button
                    title="Submit"
                    type="clear"
                    containerStyle={{
                      width: 300,
                      borderRadius: 30,
                      marginBottom: 10,
                    }}
                    raised
                    onPress={() => uploadImg()}
                  />
                  <Button
                    title="Exit"
                    containerStyle={{ width: 300, borderRadius: 30 }}
                    onPress={() => {
                      setImage(null);
                      setModalVisible(!modalVisible);
                    }}
                  />
                </>
              )}
            </SafeAreaView>
          </Modal>
          <Icon
            containerStyle={{ marginTop: 50 }}
            reverse
            color="#3897f1"
            name="file-upload"
            size={30}
            onPress={() => {
              if (missions.length === 0) {
                setError(true);
              } else {
                setModalVisible(true);
              }
            }}
          />
          <Text style={{ fontSize: 20, marginTop: 10 }}>Scan Receipts</Text>
          {renderMissionError && (
            <Text style={{ color: "red", fontSize: 10, textAlign: "center" }}>
              *You must have at least one mission to scan a receipt.
            </Text>
          )}
        </>
      )}
    </View>
  );
};

export default Missions;
