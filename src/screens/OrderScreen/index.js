import { useMemo, useRef } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  PermissionsAndroid,
  Button,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import OrderItem from "../../components/OrderItme";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import { DataStore } from "@aws-amplify/datastore";
import { Order, Restaurant, User2 } from "../../models";
import { useOrderContext } from "../../contexts/OrderContext";
import uuid from "react-native-uuid";
import CustomMarker from "../../components/CustomMarker";

const OrderScreen = () => {
  const { refresh, setRefresh } = useOrderContext();
  const [orders, setOrders] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);
  const bottomSheetRef = useRef(null);
  const mapRef = useRef(null);
  const { width, height } = useWindowDimensions();
  const snapPoints = useMemo(() => ["13%", "95%"], []);

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
  }, []);

  useEffect(() => {
    DataStore.query(Order, (o) => o.status.eq("READY_FOR_PICKUP")).then(
      async (orders) => {
        const neworders = await Promise.all(
          orders.map(async (order) => {
            const restaurant = await DataStore.query(
              Restaurant,
              order.orderRestaurantId
            );
            const user = await DataStore.query(User2, order.user2ID);
            const newOrder = { ...order, Restaurant: restaurant, User: user };
            return newOrder;
          })
        );
        setOrders(neworders);
      }
    );
  }, [refresh]);

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

  if (!driverLocation) {
    return <ActivityIndicator size={"large"} />;
  }

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
          initialRegion={{
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
            latitudeDelta: 0.07,
            longitudeDelta: 0.07,
          }}
        >
          {orders.map((order) => (
            <CustomMarker data={order.Restaurant} type="shop" key={uuid.v4()} />
          ))}
        </MapView>
        <View
          style={{
            position: "absolute", //use absolute position to show button on top of the map
            top: "6%", //for center align
            alignSelf: "flex-start", //for align to right
          }}
        >
          <Button
            title="refresh"
            onPress={() => {
              setRefresh(!refresh);
            }}
          />
        </View>
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
            key={uuid.v4()}
          />
        </BottomSheet>
      </GestureHandlerRootView>
    </View>
  );
};

export default OrderScreen;
