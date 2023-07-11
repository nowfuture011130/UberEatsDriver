import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Auth } from "aws-amplify";
import "@azure/core-asynciterator-polyfill";
import { DataStore } from "@aws-amplify/datastore";
import { Driver, TransportationModes } from "../../models";
import { useAuthContext } from "../../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const Profile = () => {
  const { sub, setDbDriver, dbDriver } = useAuthContext();

  const [name, setName] = useState(dbDriver ? dbDriver.name : "");
  const [transportationMode, setTransportationMode] = useState(
    TransportationModes.DRIVING
  );
  const navigation = useNavigation();

  useEffect(() => {
    const update = DataStore.observeQuery(Driver, (c) =>
      c.sub.eq(sub)
    ).subscribe(({ items }) => {
      setDbDriver(items[0]);
    });

    return () => {
      update.unsubscribe();
    };
  }, []);

  const onSave = async () => {
    if (dbDriver) {
      await updateDriver();
    } else {
      await createDriver();
    }
    //navigation.goBack();
  };
  const updateDriver = async () => {
    const driver = await DataStore.save(
      Driver.copyOf(dbDriver, (updated) => {
        updated.name = name;
        updated.transportationMode = transportationMode;
      })
    );
  };
  const createDriver = async () => {
    try {
      const driver = await DataStore.save(
        new Driver({
          name: name,
          lat: 0,
          lng: 0,
          sub: sub,
          transportationMode: transportationMode,
        })
      );
      setDbDriver(driver);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const signoutPress = async () => {
    Auth.signOut();
  };

  return (
    <SafeAreaView>
      <Text style={styles.title}>Profile</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name"
        style={styles.input}
      />
      <View style={{ flexDirection: "row" }}>
        <Pressable
          style={{
            ...styles.transportationIcon,
            backgroundColor:
              transportationMode === TransportationModes.BICYCLING
                ? "#3fc060"
                : "white",
          }}
          onPress={() => setTransportationMode(TransportationModes.BICYCLING)}
        >
          <MaterialIcons name="pedal-bike" size={40} color="black" />
        </Pressable>
        <Pressable
          style={{
            ...styles.transportationIcon,
            backgroundColor:
              transportationMode === TransportationModes.DRIVING
                ? "#3fc060"
                : "white",
          }}
          onPress={() => setTransportationMode(TransportationModes.DRIVING)}
        >
          <FontAwesome5 name="car" size={40} color="black" />
        </Pressable>
      </View>
      <Pressable
        onPress={onSave}
        style={({ pressed }) => [
          { backgroundColor: pressed ? "blue" : "cornflowerblue", margin: 20 },
        ]}
      >
        <Text
          style={{
            textAlign: "center",
            color: "white",
            margin: 10,
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          Save
        </Text>
      </Pressable>
      <Pressable
        onPress={signoutPress}
        style={{ backgroundColor: "lightgray", margin: 20 }}
      >
        <Text
          style={{
            textAlign: "center",
            color: "red",
            margin: 10,
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          Sign Out
        </Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    margin: 10,
  },
  input: {
    margin: 10,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 5,
  },
  transportationIcon: {
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
  },
});

export default Profile;
