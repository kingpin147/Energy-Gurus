"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteUser } from "@/lib/actions/users";

interface DeleteUserButtonProps {
  userId: string;
  userName: string;
  userEmail: string;
}

export function DeleteUserButton({ userId, userName, userEmail }: DeleteUserButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteUser(userId);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !loading && setOpen(false)}
          />
          {/* Dialog */}
          <div className="relative bg-white rounded-2xl border border-border/60 shadow-2xl p-6 w-full max-w-sm mx-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-black text-base text-foreground">Delete User</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This will permanently delete <strong>{userName || userEmail}</strong> and all their data — profile, projects, offices, reviews, and files. This cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white gap-2"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 className="w-4 h-4" /> Delete</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
