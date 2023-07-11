import { View, Text, Alert } from "react-native";
import { createContext, useState, useEffect, useContext } from "react";
import { Auth } from "aws-amplify";
import { DataStore } from "@aws-amplify/datastore";
import "@azure/core-asynciterator-polyfill";
import { Driver, Order } from "../models";
import { useAuthContext } from "./AuthContext";

const OrderContext = createContext({});

const OrderContextProvider = ({ children }) => {
  const { dbDriver } = useAuthContext();
  const [activeOrder, setActiveOrder] = useState(null);
  const acceptOrder = async (order) => {
    const oldOrder = await DataStore.query(Order, order.id);
    DataStore.save(
      Order.copyOf(oldOrder, (updated) => {
        updated.status = "ACCEPTED";
        updated.driverID = dbDriver.id;
      })
    ).then(setActiveOrder);
  };

  return (
    <OrderContext.Provider value={{ acceptOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContextProvider;

export const useOrderContext = () => useContext(OrderContext);
