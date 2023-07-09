import { useRef, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FontAwesome5, Fontisto } from "@expo/vector-icons";
import orders from "../../../assets/data/orders.json";

const order = orders[0];

const OrderDelivery = () => {
  const bottomSheetRef = useRef(null);

  const snapPoints = useMemo(() => ["13%", "95%"], []);

  return (
    <View style={{ backgroundColor: "lightblue", flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          handleIndicatorStyle={{ backgroundColor: "gray", width: 100 }}
        >
          <View style={styles.container}>
            <Text style={{ fontSize: 25, letterSpacing: 1 }}>14 min</Text>
            <FontAwesome5
              name="shopping-bag"
              size={30}
              color="#3fc060"
              style={{ marginHorizontal: 10 }}
            />
            <Text style={{ fontSize: 25, letterSpacing: 1 }}>5 km</Text>
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
          <View style={styles.button}>
            <Text style={styles.buttonText}>Accept Order</Text>
          </View>
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
    backgroundColor: "#3fc060",
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
});
