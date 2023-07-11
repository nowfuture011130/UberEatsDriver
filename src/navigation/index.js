import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OrderScreen from "../screens/OrderScreen";
import OrderDelivery from "../screens/OrderDelivery";
import ProfileScreen from "../screens/ProfileScreen";
import { useAuthContext } from "../contexts/AuthContext";

const Stack = createNativeStackNavigator();

const navigation = () => {
  const { dbDriver } = useAuthContext();
  if (dbDriver) {
    console.log(dbDriver);
  }
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {dbDriver ? (
        <>
          <Stack.Screen name="OrderScreen" component={OrderScreen} />
          <Stack.Screen name="OrderDelivery" component={OrderDelivery} />
        </>
      ) : (
        <Stack.Screen name="Profile" component={ProfileScreen} />
      )}
    </Stack.Navigator>
  );
};

export default navigation;
