// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const TransportationModes = {
  "DRIVING": "DRIVING",
  "BICYCLING": "BICYCLING"
};

const OrderStatus = {
  "NEW": "NEW",
  "COOKING": "COOKING",
  "READY_FOR_PICKUP": "READY_FOR_PICKUP",
  "ACCEPTED": "ACCEPTED",
  "PICKED_UP": "PICKED_UP",
  "COMPLETED": "COMPLETED"
};

const { Driver, User2, OrderDish, Order, BasketDish, Basket, Dish, Restaurant } = initSchema(schema);

export {
  Driver,
  User2,
  OrderDish,
  Order,
  BasketDish,
  Basket,
  Dish,
  Restaurant,
  TransportationModes,
  OrderStatus
};