import { createContext } from "react";
import type { Context } from "./store";

// Keep context identity stable while screens and the provider refresh in development.
export const EcoContext = createContext<Context | null>(null);
