import React, { useState, useEffect } from "react";
import {
  Button,
  Alert,
  Text,
  Image,
  View,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import { Icon } from "react-native-elements";

const HomeScreen = ({ navigation }) => {
  // const [image, setImage] = useState(null);
  // const [uri, setUri] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, []);

  // const choseImg = async () => {
  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.All,
  //     quality: 1,
  //   });

  //   console.log(result);

  //   if (!result.cancelled) {
  //     setUri(result.uri);
  //     setImage(result.uri);
  //   }
  // };

  // const takePicture = async () => {
  //   let result = await ImagePicker.launchCameraAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.All,
  //     quality: 1,
  //   });

  //   console.log(result);

  //   if (!result.cancelled) {
  //     setUri(result.uri);
  //     setImage(result.uri);
  //   }
  // };

  // const SendImg = async () => {
  //   setLoading(true);
  //   let token = await SecureStore.getItemAsync("token");
  //   console.log(`JWT ${JSON.parse(token)}`);
  //   console.log(uri);
  //   let filename = uri.split("/").pop();

  //   // Infer the type of the image
  //   let match = /\.(\w+)$/.exec(filename);
  //   let type = match ? `image/${match[1]}` : `image`;

  //   // Upload the image using the fetch and FormData APIs
  //   let formData = new FormData();
  //   formData.append("image", { uri: uri, name: filename, type });
  //   return await fetch("https://pardiembackend.herokuapp.com/api/obtain-img", {
  //     method: "POST",
  //     headers: {
  //       "content-type": "multipart/form-data",
  //       Authorization: `JWT ${JSON.parse(token)}`,
  //     },
  //     body: formData,
  //   })
  //     .then((res) => res.json())
  //     .then((json) => {
  //       if (json.hasOwnProperty("msg")) {
  //         Alert.alert(json.msg);
  //         setImage(null);
  //         setLoading(false);
  //       } else {
  //         Alert.alert(json.success);
  //         console.log(json);
  //         setLoading(false);
  //       }
  //     })
  //     .catch((error) => console.error(error));
  // };

  // const scanImg = () => {
  //   Alert.alert("Select Source", "", [
  //     {
  //       text: "From Gallery",
  //       onPress: () => choseImg(),
  //     },
  //     {
  //       text: "From Camera",
  //       onPress: () => takePicture(),
  //     },
  //   ]);
  // };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {loading ? (
        <ActivityIndicator size="large" color="#3897f1" />
      ) : (
        <>
          <Text style={{ fontSize: 22, marginBottom: 10 }}>My Missions</Text>
          <Icon
            containerStyle={{ marginBottom: 50 }}
            name="book-online"
            onPress={() =>
              navigation.navigate("Missions", {
                refresh: false,
              })
            }
            reverse
            color="#3897f1"
            size={30}
          />
          <Text>------------------------------------------</Text>
          <Icon
            containerStyle={{ marginTop: 50 }}
            reverse
            reverseColor="#3897f1"
            color="white"
            name="file-download"
            size={30}
            onPress={() => navigation.navigate("Export")}
          />
          <Text style={{ fontSize: 20, marginTop: 10 }}>Export Report</Text>
          {/* {image && (
            <View>
              <Image
                source={{ uri: image }}
                style={{ width: 200, height: 200 }}
              />
              {Alert.alert("Would you like to save this receipt?", "", [
                {
                  text: "Cancel",
                  onPress: setImage(null),
                  style: "cancel",
                },
                { text: "Yes", onPress: () => SendImg() },
              ])}
            </View>
          )} */}
        </>
      )}
    </View>
  );
};

export default HomeScreen;
