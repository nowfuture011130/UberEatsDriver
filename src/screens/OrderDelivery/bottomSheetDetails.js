import { useRef, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { FontAwesome5, Fontisto } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useOrderContext } from "../../contexts/OrderContext";

const STATUS_TO_TITLE = {
  READY_FOR_PICKUP: "Accept Order",
  ACCEPTED: "Pick Up Order",
  PICKED_UP: "Complete Delivery",
};

const BottomSheetDetails = (props) => {
  const { totalKm, totalMin, mapRef, driverLocation } = props;
  const isDriverClose = totalKm < 99999;
  const snapPoints = useMemo(() => ["13%", "95%"], []);
  const bottomSheetRef = useRef(null);
  const navigation = useNavigation();
  const {
    acceptOrder,
    order,
    pickUpOrder,
    completeOrder,
    setRefresh,
    refresh,
  } = useOrderContext();

  const onButtonPress = async () => {
    if (order.status === "READY_FOR_PICKUP") {
      bottomSheetRef.current.collapse();
      mapRef.current.animateToRegion({
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      await acceptOrder();
    }
    if (order.status == "ACCEPTED") {
      bottomSheetRef.current.collapse();
      await pickUpOrder();
    }
    if (order.status == "PICKED_UP") {
      await completeOrder();
      setRefresh(!refresh);
      bottomSheetRef.current.collapse();
      navigation.goBack();
    }
  };

  const isButtonDisable = () => {
    if (order.status === "READY_FOR_PICKUP") {
      return false;
    }
    if (
      (order.status === "ACCEPTED" || order.status === "PICKED_UP") &&
      isDriverClose
    ) {
      return false;
    }
    return true;
  };

  return (
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
        <Text style={{ fontSize: 25, letterSpacing: 1, paddingVertical: 20 }}>
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
          {order?.dishes.map((item) => (
            <Text style={styles.item} key={item.id}>
              {item.name} x{item.quantity}
            </Text>
          ))}
          {/* <BottomSheetFlatList
                data={order.dishes}
                renderItem={({ item }) => (
                  <Text style={styles.item}>
                    {item.name} x{item.quantity}
                  </Text>
                )}
              /> */}
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
        {isButtonDisable() ? (
          <Text style={styles.buttonTooFarText}>
            Too far from the destination
          </Text>
        ) : (
          <></>
        )}
        <Text
          style={{
            ...styles.buttonText,
            paddingTop: isButtonDisable() ? 0 : 15,
          }}
        >
          {STATUS_TO_TITLE[order.status]}
        </Text>
      </Pressable>
    </BottomSheet>
  );
};

export default BottomSheetDetails;

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
  buttonTooFarText: {
    color: "white",
    paddingTop: 15,
    fontSize: 17,
    fontWeight: "300",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  buttonText: {
    color: "white",
    paddingBottom: 15,
    fontSize: 25,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
