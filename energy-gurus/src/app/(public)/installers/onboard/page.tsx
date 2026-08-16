import { EpcOnboardingForm } from "@/components/forms/epc-onboarding-form";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Installer Onboarding — Get Listed | EnergyGurus",
  description: "Reach homeowners and businesses actively searching for solar & storage installers. Fill out your profile to join the EnergyGurus certified installer network.",
};

export default function PublicInstallerOnboardingPage() {
  return (
    <div className="font-sans text-graphite bg-paper leading-relaxed min-h-screen">
      {/* Header Section matching HTML */}
      <header className="bg-ink text-white pt-[56px] pb-[40px]">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8">
          <Link
            href="/epcs"
            className="inline-flex items-center gap-2 text-paper/70 hover:text-amber text-xs font-ibm-plex-mono uppercase tracking-wider mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Link>

          <p className="font-ibm-plex-mono text-[0.76rem] tracking-[0.14em] uppercase text-amber flex items-center gap-2.5 mb-[14px]">
            <span className="w-5 h-[1px] bg-amber" />
            Join the Network
          </p>
          <h1 className="font-space-grotesk font-semibold text-[clamp(1.8rem,4vw,2.4rem)] tracking-[-0.01em]">
            Get listed as a certified installer.
          </h1>
          <p className="text-paper/70 max-w-[600px] mt-[14px] text-[1rem]">
            Reach homeowners and businesses actively searching for solar &amp; storage installers. Fill out your profile below — our team reviews every application before it goes live.
          </p>
        </div>
      </header>

      {/* Main Form Section */}
      <section className="py-12">
        <div className="max-w-[840px] mx-auto px-5 md:px-8">
          <EpcOnboardingForm isPublic={true} />
        </div>
      </section>
    </div>
  );
}
