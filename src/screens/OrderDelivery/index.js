import { useRef, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import MapViewDirections from "react-native-maps-directions";
import { useNavigation, useRoute } from "@react-navigation/native";
import uuid from "react-native-uuid";
import { useOrderContext } from "../../contexts/OrderContext";
import BottomSheetDetails from "./bottomSheetDetails";
import CustomMarker from "../../components/CustomMarker";
import { DataStore } from "@aws-amplify/datastore";
import { Driver } from "../../models";
import { useAuthContext } from "../../contexts/AuthContext";
const OrderDelivery = () => {
  const { fetchOrder, order } = useOrderContext();
  const { dbDriver } = useAuthContext();
  const mapRef = useRef(null);
  const { width, height } = useWindowDimensions();
  const [driverLocation, setDriverLocation] = useState(null);
  const [totalMin, setTotalMin] = useState(0);
  const [totalKm, setTotalKm] = useState(0);
  const navigation = useNavigation();
  const route = useRoute();
  const orders = route.params.order;

  useEffect(() => {
    fetchOrder(orders);
  }, [orders]);

  useEffect(() => {
    if (driverLocation) {
      DataStore.save(
        Driver.copyOf(dbDriver, (updated) => {
          updated.lat = driverLocation.latitude;
          updated.lng = driverLocation.longitude;
        })
      );
    }
  }, [driverLocation]);

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

  let restaurantLocation = {
    latitude: order?.Restaurant?.lat,
    longitude: order?.Restaurant?.lng,
  };
  let orderLocation = {
    latitude: order?.User?.lat,
    longitude: order?.User?.lng,
  };

  if (!driverLocation || !order) {
    return <ActivityIndicator size={"large"} />;
  }

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
        >
          <MapViewDirections
            origin={driverLocation}
            destination={
              order.status === "ACCEPTED" ? restaurantLocation : orderLocation
            }
            waypoints={
              order.status === "READY_FOR_PICKUP" ? [restaurantLocation] : []
            }
            strokeWidth={3}
            strokeColor="black"
            apikey={"AIzaSyD0g5cZwzDSDdWGZ7qdU1pxooPTgUriE3M"}
            onReady={(result) => {
              setTotalMin(result.duration);
              setTotalKm(result.distance);
            }}
          />
          <CustomMarker data={order.Restaurant} type="shop" key={uuid.v4()} />
          <CustomMarker data={order.User} type="restaurant" key={uuid.v4()} />
        </MapView>
        <BottomSheetDetails
          totalKm={totalKm}
          totalMin={totalMin}
          mapRef={mapRef}
          driverLocation={driverLocation}
        />
        {order.status === "READY_FOR_PICKUP" && (
          <Ionicons
            onPress={() => navigation.goBack()}
            name="arrow-back-circle"
            size={45}
            color="black"
            style={styles.goback}
          />
        )}
      </GestureHandlerRootView>
    </View>
  );
};

export default OrderDelivery;

const styles = StyleSheet.create({
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
