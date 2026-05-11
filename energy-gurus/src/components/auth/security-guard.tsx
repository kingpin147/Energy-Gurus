import { currentUser } from "@clerk/nextjs/server";
import { isUserAllowed } from "@/lib/actions/invitations";
import { redirect } from "next/navigation";

export async function SecurityGuard({ locale }: { locale: string }) {
    const user = await currentUser();
    
    if (user) {
        const email = user.emailAddresses[0].emailAddress;
        try {
            const allowed = await isUserAllowed(email);
            if (!allowed) {
                redirect(`/${locale}/access-denied`);
            }
        } catch (error) {
            console.error("Security Guard Check Failed:", error);
            // In case of DB failure, we let them through to prevent 500 error on homepage
            // Or we could redirect to a safe "Service Temporarily Unavailable" page
        }
    }
    
    return null;
}
