import { getCurrentUser } from "@/lib/user";
import { isUserAllowed } from "@/lib/actions/invitations";
import { redirect } from "next/navigation";

export async function SecurityGuard() {
    const user = await getCurrentUser();
    
    if (user) {
        const email = user.emailAddresses?.[0]?.emailAddress;
        if (!email) {
            redirect(`/access-denied`);
        }

        let allowed = false;
        try {
            allowed = await isUserAllowed(email, user.id, user.fullName || user.firstName || "");
        } catch (error) {
            console.error("Security Guard Check Failed:", error);
            // In case of error, allowed remains false
        }

        if (!allowed) {
            redirect(`/access-denied`);
        }
    }
    
    return null;
}

