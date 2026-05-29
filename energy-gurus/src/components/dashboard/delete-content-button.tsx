"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteButtonProps {
    id: string;
    action: (id: string) => Promise<{ success: boolean; message: string }>;
    confirmMessage?: string;
}

export function DeleteContentButton({ id, action, confirmMessage }: DeleteButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (confirmMessage && !confirm(confirmMessage)) return;

        setIsDeleting(true);
        try {
            const res = await action(id);
            if (res.success) {
                toast.success(res.message);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete item");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Button
            variant="destructive"
            size="sm"
            className="h-8 w-8 p-0 rounded-lg shadow-lg"
            onClick={handleDelete}
            disabled={isDeleting}
        >
            {isDeleting ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
                <Trash2 className="w-4 h-4" />
            )}
        </Button>
    );
}
