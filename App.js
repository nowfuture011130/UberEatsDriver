import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import Navigation from "./src/navigation";
import { Amplify } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react-native";
import awsExports from "./src/aws-exports";
import AuthContext from "./src/contexts/AuthContext";

Amplify.configure({ ...awsExports, Analytics: { disabled: true } });

function App() {
  return (
    <NavigationContainer>
      <AuthContext>
        <Navigation />
      </AuthContext>

      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default withAuthenticator(App);
