import { ClerkProvider, useUser, SignedIn, SignedOut, SignIn } from "@clerk/clerk-react";
import { Role } from "./roles";

export const clerkPubKey = "YOUR_CLERK_PUBLISHABLE_KEY";

export function useCurrentRole(): Role {
  const { user } = useUser();
  return (user?.publicMetadata?.role as Role) || "Suspended Account";
}

export { ClerkProvider, SignedIn, SignedOut, SignIn };
