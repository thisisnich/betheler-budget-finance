import { SessionIdArg } from "convex-helpers/server/sessions";
import { mutation } from "./_generated/server";
import { getAuthUser } from "../modules/auth/getAuthUser";
export const create = mutation({
  args: {
    ...SessionIdArg,
    // TODO: fill in args here for transaction creation
  },
  handler: async (ctx, args) => {
    //ensure user is authenticated
    const user = await getAuthUser(ctx, args); 

    //TODO: implement logic
  }
})