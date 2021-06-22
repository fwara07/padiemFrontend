import React, { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { View, Text, ActivityIndicator } from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Button } from "react-native-elements";

const Receipts = ({ navigation }) => {
  const [loading, setLoding] = useState(true);
  const [result, setResult] = useState({});
  const [reportUrl, setReportUrl] = useState("");
  useEffect(() => {
    const getReceiptsData = async () => {
      let token = await SecureStore.getItemAsync("token");
      fetch("https://pardiembackend.herokuapp.com/api/receipts", {
        method: "GET",
        headers: {
          Authorization: `JWT ${JSON.parse(token)}`,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          processReceipts(json);
          setLoding(false);
        })
        .catch((error) => console.error(error));
    };

    getReceiptsData();
  }, []);

  const processReceipts = (receipts) => {
    const dubps = [];
    const resultObj = {};
    receipts.map((item) => {
      if (dubps.includes(item.merchant_name)) {
        resultObj[item.merchant_name] =
          resultObj[item.merchant_name] + parseFloat(item.total);
      } else {
        resultObj[item.merchant_name] = parseFloat(item.total);
        dubps.push(item.merchant_name);
      }
    });
    setResult(resultObj);
    return null;
  };

  const exportReport = async () => {
    let token = await SecureStore.getItemAsync("token");
    fetch("https://pardiembackend.herokuapp.com/api/export", {
      method: "GET",
      headers: {
        Authorization: `JWT ${JSON.parse(token)}`,
      },
    })
      .then((res) => res.json())
      .then(async (json) => {
        setReportUrl("data:application/pdf;base64," + json.pdf);
        const base64Code = reportUrl.split("data:application/pdf;base64,")[1];
        const filename = FileSystem.documentDirectory + "report.pdf";
        console.log(base64Code);
        await FileSystem.writeAsStringAsync(filename, base64Code, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const mediaResult = await MediaLibrary.saveToLibraryAsync(filename);
        await Sharing.shareAsync(filename);
      })
      .catch((error) => console.error(error));
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <>
          <Text style={{ fontSize: 30, fontWeight: "bold", paddingBottom: 50 }}>
            Summary:
          </Text>
          {Object.keys(result).map((key, index) => {
            return (
              <View>
                <Text
                  key={key}
                  style={{
                    fontSize: 15,
                    fontWeight: "normal",
                    paddingBottom: 50,
                  }}
                >
                  {`You have spent $${result[key].toString()} at ${key}`}
                </Text>
              </View>
            );
          })}
          <Button
            type="outline"
            title="Export detailed report"
            onPress={exportReport}
          />
          <Text style={{ fontSize: 10, marginTop: 10 }}>
            *The detailed report shall be sent by email.
          </Text>
        </>
      )}
    </View>
  );
};
export default Receipts;
