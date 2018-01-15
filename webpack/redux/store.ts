import { createStore } from "redux";
import { Store } from "./interfaces";
import { rootReducer } from "./root_reducer";
import { registerSubscribers } from "./subscribers";
import { getMiddleware } from "./middlewares";
import {
  subscribeAndRefreshBot
} from "../connectivity/subscribe_and_refresh_bot";
import { set } from "lodash";

const ENV = process.env.NODE_ENV || "development";

function dev(): Store {
  store = createStore(rootReducer,
    maybeFetchOldState(),
    getMiddleware("development"));
  return store;
}

function prod(): Store {
  return createStore(rootReducer, ({} as any), getMiddleware("production"));
}

export function configureStore(options = {}) {
  const store2: Store = (ENV === "production" ? prod() : dev());
  // Make store global in case I need to probe it.
  set(window, "store", store2);
  registerSubscribers(store2);
  subscribeAndRefreshBot(store2);
  return store2;
}

export let store = configureStore();

/** Tries to fetch previous state from `sessionStorage`.
 * Returns {} if nothing is found. Used mostly for hot reloading. */
function maybeFetchOldState() {
  try {
    return JSON.parse(sessionStorage["lastState"] || "{}");
  } catch (e) {
    return {};
  }
}
