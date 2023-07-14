import { Marker } from "react-native-maps";
import { View } from "react-native";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import uuid from "react-native-uuid";
const CustomMarker = ({ data, type }) => {
  return (
    <Marker
      coordinate={{
        latitude: data.lat,
        longitude: data.lng,
      }}
      title={data.name}
      description={data.address}
    >
      <View
        style={{
          backgroundColor: "dodgerblue",
          padding: 5,
          borderRadius: 30,
        }}
      >
        {type === "shop" ? (
          <Entypo name={type} size={25} color="white" />
        ) : (
          <MaterialIcons name={type} size={25} color="white" />
        )}
      </View>
    </Marker>
  );
};

export default CustomMarker;
