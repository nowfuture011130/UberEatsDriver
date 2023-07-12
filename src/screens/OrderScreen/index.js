import { useMemo, useRef } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  PermissionsAndroid,
  Button,
} from "react-native";
import { useEffect, useState } from "react";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import OrderItem from "../../components/OrderItme";
import MapView, { Marker } from "react-native-maps";
import { Entypo } from "@expo/vector-icons";
import { DataStore } from "@aws-amplify/datastore";
import { Order, Restaurant, User2 } from "../../models";
import { useOrderContext } from "../../contexts/OrderContext";

const OrderScreen = () => {
  const { refresh, setRefresh } = useOrderContext();
  const [orders, setOrders] = useState([]);
  const bottomSheetRef = useRef(null);
  const mapRef = useRef(null);
  const { width, height } = useWindowDimensions();
  const snapPoints = useMemo(() => ["13%", "95%"], []);
  let onDrag = false;
  const animateToRegion = (pos) => {
    if (!onDrag) {
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
          />
        </BottomSheet>
      </GestureHandlerRootView>
    </View>
  );
};

export default OrderScreen;
