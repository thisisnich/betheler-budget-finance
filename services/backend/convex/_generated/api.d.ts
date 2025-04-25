/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as appinfo from "../appinfo.js";
import type * as auth from "../auth.js";
import type * as budgets from "../budgets.js";
import type * as migration from "../migration.js";
import type * as presentations from "../presentations.js";
import type * as sharing from "../sharing.js";
import type * as transactions from "../transactions.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  appinfo: typeof appinfo;
  auth: typeof auth;
  budgets: typeof budgets;
  migration: typeof migration;
  presentations: typeof presentations;
  sharing: typeof sharing;
  transactions: typeof transactions;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
