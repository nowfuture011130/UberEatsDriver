import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const OrderItem = ({ order }) => {
  const navigation = useNavigation();
  return (
    <Pressable
      style={styles.greenBorder}
      onPress={() => navigation.navigate("OrderDelivery", { order: order })}
    >
      <Image source={{ uri: order.Restaurant.image }} style={styles.image} />
      <View style={{ marginLeft: 10, flex: 1, paddingVertical: 5 }}>
        <Text style={{ fontSize: 18, fontWeight: "500" }}>
          {order.Restaurant.name}
        </Text>
        <Text style={{ color: "gray" }}>{order.Restaurant.address}</Text>
        <Text style={{ marginTop: 10, fontSize: 16 }}>Delivery Details:</Text>
        <Text style={{ color: "gray" }}>{order.User.name}</Text>
        <Text style={{ color: "gray" }}>{order.User.address}</Text>
      </View>
      <View style={styles.checkContainer}>
        <Entypo
          name="check"
          size={30}
          color="white"
          style={{ marginLeft: "auto" }}
        />
      </View>
    </Pressable>
  );
};

export default OrderItem;

const styles = StyleSheet.create({
  greenBorder: {
    flexDirection: "row",
    borderColor: "#3fc060",
    borderWidth: 2,
    borderRadius: 12,
    margin: 10,
  },
  checkContainer: {
    backgroundColor: "#3fc060",
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
  image: {
    width: "25%",
    height: "100%",
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
  },
});
