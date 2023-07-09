import { useMemo, useRef } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  PermissionsAndroid,
} from "react-native";
import { useEffect, useState } from "react";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import orders from "../../../assets/data/orders.json";
import OrderItem from "../../components/OrderItme";
import MapView, { Marker } from "react-native-maps";
import { Entypo } from "@expo/vector-icons";

const OrderScreen = () => {
  const bottomSheetRef = useRef(null);
  const mapRef = useRef(null);
  const { width, height } = useWindowDimensions();
  const snapPoints = useMemo(() => ["13%", "95%"], []);
  let onDrag = false;
  const animateToRegion = (pos) => {
    if (!onDrag) {
      console.log(pos);
      const region = {
        latitude: pos.latitude, // target latitude
        longitude: pos.longitude, // target longitude
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      mapRef.current.animateToRegion(region, 1000);
      onDrag = true;
    }
  };

  useEffect(() => {
    const getPermissions = async () => {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (status !== "granted") {
        console.log("permission denied");
        return;
      } else {
      }
    };
    getPermissions();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "lightblue" }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MapView
          style={{
            height,
            width,
          }}
          ref={mapRef}
          showsUserLocation
          followsUserLocation
          onUserLocationChange={(event) =>
            animateToRegion(event.nativeEvent.coordinate)
          }
        >
          {orders.map((order) => (
            <Marker
              key={order.id}
              title={order.Restaurant.name}
              description={order.Restaurant.address}
              coordinate={{
                latitude: order.Restaurant.lat,
                longitude: order.Restaurant.lng,
              }}
            >
              <View
                style={{
                  backgroundColor: "dodgerblue",
                  padding: 5,
                  borderRadius: 20,
                }}
              >
                <Entypo name="shop" size={25} color="white" />
              </View>
            </Marker>
          ))}
        </MapView>
        <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints}>
          <View style={{ alignItems: "center", marginBottom: 30 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                letterSpacing: 0.5,
                paddingBottom: 5,
              }}
            >
              You're Online
            </Text>
            <Text style={{ letterSpacing: 0.5, color: "gray" }}>
              Avaliable Orders: {orders.length}
            </Text>
          </View>
          <BottomSheetFlatList
            data={orders}
            renderItem={({ item }) => <OrderItem order={item} />}
          />
        </BottomSheet>
      </GestureHandlerRootView>
    </View>
  );
};

export default OrderScreen;
