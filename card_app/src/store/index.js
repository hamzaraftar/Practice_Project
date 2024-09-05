import { configureStore } from "@reduxjs/toolkit";
import cartRaducer from "../store/card_Slice";

export const store = configureStore({
  reducer: {
    cart: cartRaducer,
  },
});
export default store;
