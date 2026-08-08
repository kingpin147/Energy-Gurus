"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { sendInquiry } from "@/lib/actions/inquiry";
import { toast } from "sonner";

interface InstallerQuoteFormProps {
  receiverId: string;
  receiverName: string;
}

export function InstallerQuoteForm({ receiverId, receiverName }: InstallerQuoteFormProps) {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      
      const name = formData.get("guestName") as string;
      const systemType = formData.get("systemType") as string;
      const address = formData.get("address") as string;
      const area = formData.get("area") as string;
      const city = formData.get("city") as string;
      const country = formData.get("country") as string;
      const phone = formData.get("guestPhone") as string;
      const email = formData.get("guestEmail") as string;

      formData.append("metadata", JSON.stringify({
        systemType,
        address,
        area,
        city,
        country,
      }));

      formData.set(
        "message",
        `Quote Request for ${systemType || "Solar Installation"} System.\nAddress: ${address}, ${area}, ${city}, ${country}.\nContact: ${phone} (${email})`
      );

      const res = await sendInquiry(formData);
      if (res.success) {
        setIsSubmitted(true);
        toast.success("Quote Request Sent!", {
          description: `Thanks — ${receiverName} will reach out to you shortly.`,
        });
      } else {
        toast.error(res.message || "Failed to send request.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-paper border border-line rounded-[6px] p-6 sm:p-10 max-w-[640px] mx-auto mt-8">
      <input type="hidden" name="receiverId" value={receiverId} />
      <input type="hidden" name="inquiryType" value="client" />

      {isSubmitted ? (
        <div className="text-center py-6 animate-in fade-in duration-300">
          <h3 className="font-space-grotesk font-semibold text-teal text-[1.2rem] mb-2">Request sent</h3>
          <p className="text-slate-custom text-[0.92rem] mb-6">
            Thanks — {receiverName} will reach out to you shortly.
          </p>
          <button
            type="button"
            onClick={() => setIsSubmitted(false)}
            className="text-[0.85rem] font-semibold text-ink border border-line rounded-[3px] px-4 py-2 hover:border-ink transition-colors"
          >
            Send Another Request
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label htmlFor="qName" className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">
                Name
              </label>
              <input
                type="text"
                id="qName"
                name="guestName"
                defaultValue={isLoaded && user ? user.fullName ?? "" : ""}
                required
                className="w-full px-3.5 py-3 border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-white focus:outline-none focus:border-amber transition-colors"
              />
            </div>

            <div>
              <label htmlFor="qSystemType" className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">
                System Type
              </label>
              <select
                id="qSystemType"
                name="systemType"
                required
                defaultValue=""
                className="w-full px-3.5 py-3 border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-white focus:outline-none focus:border-amber transition-colors"
              >
                <option value="" disabled>Select...</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Agriculture">Agriculture</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="qAddress" className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">
                Address
              </label>
              <input
                type="text"
                id="qAddress"
                name="address"
                required
                className="w-full px-3.5 py-3 border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-white focus:outline-none focus:border-amber transition-colors"
              />
            </div>

            <div>
              <label htmlFor="qArea" className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">
                Area/Society
              </label>
              <input
                type="text"
                id="qArea"
                name="area"
                required
                className="w-full px-3.5 py-3 border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-white focus:outline-none focus:border-amber transition-colors"
              />
            </div>

            <div>
              <label htmlFor="qCity" className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">
                City
              </label>
              <input
                type="text"
                id="qCity"
                name="city"
                required
                className="w-full px-3.5 py-3 border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-white focus:outline-none focus:border-amber transition-colors"
              />
            </div>

            <div>
              <label htmlFor="qCountry" className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">
                Country
              </label>
              <input
                type="text"
                id="qCountry"
                name="country"
                defaultValue="Pakistan"
                required
                className="w-full px-3.5 py-3 border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-white focus:outline-none focus:border-amber transition-colors"
              />
            </div>

            <div>
              <label htmlFor="qContact" className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">
                Contact No.
              </label>
              <input
                type="tel"
                id="qContact"
                name="guestPhone"
                required
                className="w-full px-3.5 py-3 border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-white focus:outline-none focus:border-amber transition-colors"
              />
            </div>

            <div>
              <label htmlFor="qEmail" className="block font-ibm-plex-mono text-[0.72rem] tracking-[0.06em] uppercase text-slate-custom mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="qEmail"
                name="guestEmail"
                defaultValue={isLoaded && user ? user.primaryEmailAddress?.emailAddress ?? "" : ""}
                required
                className="w-full px-3.5 py-3 border border-line rounded-[3px] font-sans text-[0.92rem] text-graphite bg-white focus:outline-none focus:border-amber transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 bg-amber text-ink rounded-[3px] font-semibold text-[0.95rem] hover:bg-[#f2b458] transition-colors disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
          <p className="text-[0.8rem] text-slate-custom mt-3.5 text-center">
            {receiverName} will contact you to discuss your quote.
          </p>
        </>
      )}
    </form>
  );
}
