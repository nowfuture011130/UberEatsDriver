import { useRef } from "react";
import { View, Text } from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import orders from "../../../assets/data/orders.json";
import OrderItem from "../../components/OrderItme";

const OrderScreen = () => {
  const bottomSheetRef = useRef(null);

  return (
    <View style={{ flex: 1, backgroundColor: "lightblue" }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheet ref={bottomSheetRef} snapPoints={["13%", "95%"]}>
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
