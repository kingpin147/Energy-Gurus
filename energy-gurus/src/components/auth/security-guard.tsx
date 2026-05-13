import { getCurrentUser } from "@/lib/user";
import { isUserAllowed } from "@/lib/actions/invitations";
import { redirect } from "next/navigation";

export async function SecurityGuard({ locale }: { locale: string }) {
    const user = await getCurrentUser();
    
    if (user) {
        const email = user.emailAddresses[0].emailAddress;
        try {
            const allowed = await isUserAllowed(email, user.id, user.fullName || user.firstName || "");
            if (!allowed) {
                redirect(`/${locale}/reject-access?error=not_invited`);
            }
        } catch (error) {
            console.error("Security Guard Check Failed:", error);
            // In case of DB failure, we let them through to prevent 500 error on homepage
            // Or we could redirect to a safe "Service Temporarily Unavailable" page
        }
    }
    
    return null;
}
