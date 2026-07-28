"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bulkInvite } from "@/lib/actions/invitations";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function BulkInvite() {
  const [isPending, startTransition] = useTransition();
  const [dragActive, setDragActive] = useState(false);
  const [parsedInvites, setParsedInvites] = useState<{ email: string; role: "epc" | "brand" | "admin" }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const parseCSVContent = (text: string) => {
    setError(null);
    setSuccess(null);
    try {
      const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length === 0) {
        throw new Error("The CSV file is empty");
      }

      const invites: { email: string; role: "epc" | "brand" | "admin" }[] = [];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      // Determine if first row is a header
      const firstRow = lines[0].split(",").map(cell => cell.trim().toLowerCase());
      const hasHeader = firstRow.includes("email") || firstRow.includes("role");
      
      let emailIndex = 0;
      let roleIndex = 1;

      if (hasHeader) {
        emailIndex = firstRow.indexOf("email");
        roleIndex = firstRow.indexOf("role");
        if (emailIndex === -1) {
          throw new Error("CSV Header missing 'email' column.");
        }
      }

      const startIdx = hasHeader ? 1 : 0;

      for (let i = startIdx; i < lines.length; i++) {
        const cells = lines[i].split(",").map(cell => cell.trim());
        const email = cells[emailIndex]?.toLowerCase();
        
        // Parse role, default to epc
        let rawRole = (cells[roleIndex] || "epc").toLowerCase() as any;
        if (!["epc", "brand", "admin"].includes(rawRole)) {
          rawRole = "epc";
        }

        if (email && emailRegex.test(email)) {
          invites.push({ email, role: rawRole });
        }
      }

      if (invites.length === 0) {
        throw new Error("No valid email addresses found in the CSV file.");
      }

      setParsedInvites(invites);
      setSuccess(`Parsed ${invites.length} invitation(s) successfully! Click Invite below to finalize.`);
    } catch (e: any) {
      setError(e.message || "Failed to parse CSV file");
      setParsedInvites([]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".csv")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          parseCSVContent(text);
        };
        reader.readAsText(file);
      } else {
        setError("Only .csv files are supported");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith(".csv")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          parseCSVContent(text);
        };
        reader.readAsText(file);
      } else {
        setError("Only .csv files are supported");
      }
    }
  };

  const handleSubmitInvites = () => {
    if (parsedInvites.length === 0) return;
    
    startTransition(async () => {
      try {
        await bulkInvite(parsedInvites);
        setSuccess(`Successfully sent ${parsedInvites.length} invitation(s)!`);
        setParsedInvites([]);
        router.refresh();
      } catch (e: any) {
        setError(e.message || "Failed to submit bulk invitations");
      }
    });
  };

  return (
    <Card className="border-none shadow-sm rounded-3xl mt-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber" />
          Bulk CSV Invitation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-slate-custom">
          Upload a CSV with column headers <code className="bg-paper/40 px-1 py-0.5 rounded font-bold">email</code> and optional <code className="bg-paper/40 px-1 py-0.5 rounded font-bold">role</code> (epc, brand, or admin).
        </p>

        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-colors relative ${
            dragActive ? "border-amber bg-amber/5 text-ink" : "border-line/60 hover:bg-paper/10"
          }`}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="w-12 h-12 bg-amber/10 text-ink rounded-full flex items-center justify-center mb-3">
            <Upload className="w-6 h-6 text-amber" />
          </div>
          <span className="text-sm font-bold text-graphite">Drag & Drop CSV file here</span>
          <span className="text-xs text-slate-custom mt-1">or click to browse local files</span>
        </div>

        {error && (
          <div className="p-3 bg-red-100/50 border border-red-200 text-red-600 rounded-xl text-xs flex items-start gap-2 animate-pulse">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100/50 border border-green-200 text-green-600 rounded-xl text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {parsedInvites.length > 0 && (
          <div className="space-y-3">
            <div className="max-h-32 overflow-y-auto border rounded-xl divide-y text-[11px] bg-paper/5">
              {parsedInvites.map((inv, idx) => (
                <div key={idx} className="p-2 flex justify-between items-center">
                  <span className="font-medium text-graphite">{inv.email}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber/10 text-ink text-amber border border-amber/20">
                    {inv.role}
                  </span>
                </div>
              ))}
            </div>

            <Button
              onClick={handleSubmitInvites}
              disabled={isPending}
              className="w-full rounded-xl font-bold h-12 gap-2 shadow-lg shadow-primary/20"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Finalize & Send {parsedInvites.length} Invites
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
