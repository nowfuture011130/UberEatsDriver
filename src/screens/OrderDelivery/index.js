import { useRef, useMemo, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  Pressable,
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  FontAwesome5,
  Fontisto,
  Entypo,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import MapViewDirections from "react-native-maps-directions";
import { useNavigation } from "@react-navigation/native";
import orders from "../../../assets/data/orders.json";

const order = orders[0];

const ORDER_STATUSES = {
  READY_FOR_PICK_UP: "READY_FOR_PICK_UP",
  ACCEPTED: "ACCEPTED",
  PICKED_UP: "PICKED_UP",
};
let restaurantLocation = {
  latitude: order.Restaurant.lat,
  longitude: order.Restaurant.lng,
};
let orderLocation = {
  latitude: order.User.lat,
  longitude: order.User.lng,
};

const OrderDelivery = () => {
  const bottomSheetRef = useRef(null);
  const mapRef = useRef(null);
  const { width, height } = useWindowDimensions();
  const snapPoints = useMemo(() => ["13%", "95%"], []);
  let onDrag = false;
  const [driverLocation, setDriverLocation] = useState(null);
  const [totalMin, setTotalMin] = useState(0);
  const [totalKm, setTotalKm] = useState(0);
  const [deliveryStatus, setDeliveryStatus] = useState(
    ORDER_STATUSES.READY_FOR_PICK_UP
  );
  const [isDriverClose, setIsDriverClose] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("unallowed");
        return;
      } else {
        let location = await Location.getCurrentPositionAsync();
        setDriverLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    })();

    async function foregroundSubscription() {
      let location = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 50,
        },
        (updated) => {
          setDriverLocation({
            latitude: updated.coords.latitude,
            longitude: updated.coords.longitude,
          });
        }
      );
    }
    foregroundSubscription();
  }, []);

  // const animateToRegion = (pos) => {
  //   if (!onDrag) {
  //     const region = {
  //       latitude: pos.latitude, // target latitude
  //       longitude: pos.longitude, // target longitude
  //       latitudeDelta: 0.0922,
  //       longitudeDelta: 0.0421,
  //     };
  //     mapRef.current.animateToRegion(region, 1000);
  //     onDrag = true;
  //   }
  // };

  if (!driverLocation) {
    return <ActivityIndicator size={"large"} />;
  }

  const onButtonPress = () => {
    if (deliveryStatus === ORDER_STATUSES.READY_FOR_PICK_UP) {
      bottomSheetRef.current.collapse();
      mapRef.current.animateToRegion({
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setDeliveryStatus(ORDER_STATUSES.ACCEPTED);
    }
    if (deliveryStatus == ORDER_STATUSES.ACCEPTED) {
      bottomSheetRef.current.collapse();
      setDeliveryStatus(ORDER_STATUSES.PICKED_UP);
    }
    if (deliveryStatus == ORDER_STATUSES.PICKED_UP) {
      bottomSheetRef.current.collapse();
      navigation.goBack();
      console.log("complete");
    }
  };

  const renderButtonTitle = () => {
    if (deliveryStatus === ORDER_STATUSES.READY_FOR_PICK_UP) {
      return "Accept Order";
    }
    if (deliveryStatus === ORDER_STATUSES.ACCEPTED) {
      return "Pick Up Order";
    }
    if (deliveryStatus === ORDER_STATUSES.PICKED_UP) {
      return "Complete Delivery";
    }
  };

  const isButtonDisable = () => {
    if (deliveryStatus == ORDER_STATUSES.READY_FOR_PICK_UP) {
      return false;
    }
    if (deliveryStatus == ORDER_STATUSES.ACCEPTED && isDriverClose) {
      return false;
    }
    if (deliveryStatus == ORDER_STATUSES.PICKED_UP && isDriverClose) {
      return false;
    }
    return true;
  };

  return (
    <View style={{ backgroundColor: "lightblue", flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MapView
          style={{
            height,
            width,
          }}
          ref={mapRef}
          showsUserLocation
          followsUserLocation
          initialRegion={{
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
            latitudeDelta: 0.07,
            longitudeDelta: 0.07,
          }}
          // onUserLocationChange={(event) =>
          //   animateToRegion(event.nativeEvent.coordinate)
          // }
        >
          <MapViewDirections
            origin={driverLocation}
            destination={
              deliveryStatus === ORDER_STATUSES.ACCEPTED
                ? restaurantLocation
                : orderLocation
            }
            waypoints={
              deliveryStatus === ORDER_STATUSES.READY_FOR_PICK_UP
                ? [restaurantLocation]
                : []
            }
            strokeWidth={3}
            strokeColor="black"
            apikey={"AIzaSyD0g5cZwzDSDdWGZ7qdU1pxooPTgUriE3M"}
            onReady={(result) => {
              if (result.distance < 99999) {
                setIsDriverClose(true);
              } else {
                setIsDriverClose(false);
              }
              setTotalMin(result.duration);
              setTotalKm(result.distance);
            }}
          />
          <Marker
            coordinate={{
              latitude: order.Restaurant.lat,
              longitude: order.Restaurant.lng,
            }}
            title={order.Restaurant.name}
            description={order.Restaurant.address}
          >
            <View style={styles.shopContainer}>
              <Entypo name="shop" size={25} color="white" />
            </View>
          </Marker>
          <Marker
            coordinate={{
              latitude: order.User.lat,
              longitude: order.User.lng,
            }}
            title={order.User.name}
            description={order.User.address}
          >
            <View style={styles.UserLocationContainer}>
              <MaterialIcons name="restaurant" size={25} color="white" />
            </View>
          </Marker>
        </MapView>
        {deliveryStatus === ORDER_STATUSES.READY_FOR_PICK_UP && (
          <Ionicons
            onPress={() => navigation.goBack()}
            name="arrow-back-circle"
            size={45}
            color="black"
            style={styles.goback}
          />
        )}

        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          handleIndicatorStyle={{ backgroundColor: "gray", width: 100 }}
        >
          <View style={styles.container}>
            <Text style={{ fontSize: 25, letterSpacing: 1 }}>
              {totalMin.toFixed(0)} min
            </Text>
            <FontAwesome5
              name="shopping-bag"
              size={30}
              color="#3fc060"
              style={{ marginHorizontal: 10 }}
            />
            <Text style={{ fontSize: 25, letterSpacing: 1 }}>
              {totalKm.toFixed(2)} km
            </Text>
          </View>
          <View
            style={{
              borderTopWidth: 2,
              borderColor: "gray",
            }}
          />
          <View style={{ paddingHorizontal: 20 }}>
            <Text
              style={{ fontSize: 25, letterSpacing: 1, paddingVertical: 20 }}
            >
              {order.Restaurant.name}
            </Text>
            <View style={styles.addressContainer}>
              <Fontisto name="shopping-store" size={22} color="gray" />
              <Text style={styles.address}>{order.Restaurant.address}</Text>
            </View>
            <View style={styles.addressContainer}>
              <FontAwesome5 name="map-marker-alt" size={30} color="gray" />
              <Text style={styles.address}>{order.User.address}</Text>
            </View>
            <View
              style={{
                borderTopWidth: 1,
                borderColor: "lightgray",
                paddingTop: 20,
              }}
            >
              <Text style={styles.item}>Onion Rings x1</Text>
              <Text style={styles.item}>Big Mac x3</Text>
              <Text style={styles.item}>Coca-Cola x1</Text>
            </View>
          </View>
          <Pressable
            style={{
              ...styles.button,
              backgroundColor: isButtonDisable() ? "gray" : "#3fc060",
            }}
            onPress={onButtonPress}
            disabled={isButtonDisable()}
          >
            <Text style={styles.buttonText}>{renderButtonTitle()}</Text>
          </Pressable>
        </BottomSheet>
      </GestureHandlerRootView>
    </View>
  );
};

export default OrderDelivery;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  address: {
    fontSize: 20,
    color: "gray",
    fontWeight: "500",
    letterSpacing: 0.5,
    marginLeft: 15,
  },
  addressContainer: {
    flexDirection: "row",
    marginBottom: 20,
    textAlign: "center",
  },
  item: {
    fontSize: 18,
    color: "gray",
    fontWeight: "500",
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  button: {
    marginTop: "auto",
    marginHorizontal: 10,
    marginVertical: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    paddingVertical: 15,
    fontSize: 25,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  shopContainer: {
    backgroundColor: "dodgerblue",
    padding: 5,
    borderRadius: 30,
  },
  UserLocationContainer: {
    backgroundColor: "green",
    padding: 5,
    borderRadius: 30,
  },
  goback: {
    top: 40,
    left: 15,
    position: "absolute",
  },
});
