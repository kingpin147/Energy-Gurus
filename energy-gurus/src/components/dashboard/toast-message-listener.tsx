"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export function ToastMessageListener() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const msg = searchParams.get("msg");
        if (msg === "profile_updated") {
            toast.success("Profile updated successfully!");
            
            // Cleanup the query parameters from the URL
            const params = new URLSearchParams(searchParams.toString());
            params.delete("msg");
            params.delete("t");
            const newQuery = params.toString() ? `?${params.toString()}` : "";
            router.replace(window.location.pathname + newQuery);
        }
    }, [searchParams, router]);

    return null;
}
