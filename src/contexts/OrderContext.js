import { View, Text, Alert } from "react-native";
import { createContext, useState, useEffect, useContext } from "react";
import { Auth } from "aws-amplify";
import { DataStore } from "@aws-amplify/datastore";
import "@azure/core-asynciterator-polyfill";
import { Driver, Order, Dish, OrderDish } from "../models";
import { useAuthContext } from "./AuthContext";

const OrderContext = createContext({});

const OrderContextProvider = ({ children }) => {
  const { dbDriver } = useAuthContext();
  const [order, setOrder] = useState(null);
  const [refresh, setRefresh] = useState(false);

  // useEffect(() => {
  //   if (!order) {
  //     return;
  //   }
  //   DataStore.observe(Order, order.id).subscribe(
  //     async ({ opType, element }) => {
  //       if (opType === "UPDATE") {
  //         await completeOrder();
  //       }
  //     }
  //   );
  // }, [order]);

  const completeOrder = async () => {
    const oldOrder = await DataStore.query(Order, order.id);
    const updated = await DataStore.save(
      Order.copyOf(oldOrder, (updated) => {
        updated.status = "COMPLETED";
      })
    );
    const neworder = { ...order, status: "COMPLETED" };
    setOrder(neworder);
  };

  const pickUpOrder = async () => {
    const oldOrder = await DataStore.query(Order, order.id);
    DataStore.save(
      Order.copyOf(oldOrder, (updated) => {
        updated.status = "PICKED_UP";
      })
    );
    const neworder = { ...order, status: "PICKED_UP" };
    setOrder(neworder);
  };

  const fetchOrder = async (order) => {
    if (!order) {
      setOrder(null);
      return;
    }
    DataStore.query(OrderDish, (od) => od.orderID.eq(order.id)).then(
      async (orderdishes) => {
        const neworders = await Promise.all(
          orderdishes.map(async (orderdish) => {
            const dish = await DataStore.query(Dish, orderdish.orderDishDishId);
            return { ...dish, quantity: orderdish.quantity };
          })
        );
        order = { ...order, dishes: neworders };
        setOrder(order);
      }
    );
  };

  const acceptOrder = async () => {
    const oldOrder = await DataStore.query(Order, order.id);
    DataStore.save(
      Order.copyOf(oldOrder, (updated) => {
        updated.status = "ACCEPTED";
        updated.driverID = dbDriver.id;
      })
    );
    const neworder = { ...order, status: "ACCEPTED", driverID: dbDriver.id };
    setOrder(neworder);
  };

  return (
    <OrderContext.Provider
      value={{
        acceptOrder,
        fetchOrder,
        order,
        pickUpOrder,
        completeOrder,
        refresh,
        setRefresh,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContextProvider;

export const useOrderContext = () => useContext(OrderContext);
