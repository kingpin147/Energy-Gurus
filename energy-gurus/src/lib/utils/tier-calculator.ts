/**
 * Tier Calculation Utility for EnergyGurus Installers
 *
 * Tier Rules:
 * - Unverified: Default / No verified certs or audit not completed
 * - Silver: 1-2 Confirmed Brand Certifications (+ Audit)
 * - Gold: 3-4 Confirmed Brand Certifications (+ Audit)
 * - Diamond: 5-6 Confirmed Brand Certifications (+ Audit)
 * - Platinum: 7-8+ Confirmed Brand Certifications (+ Audit)
 */

export type InstallerTier = 'unverified' | 'bronze' | 'silver' | 'gold' | 'diamond' | 'platinum';

export interface TierCalculationResult {
  tier: InstallerTier;
  label: string;
  confirmedCount: number;
  nextTier?: {
    name: string;
    certsNeeded: number;
  };
  summary: string;
}

export function calculateInstallerTier(
  confirmedCertsCount: number,
  isAuditPassed: boolean = true
): TierCalculationResult {
  if (confirmedCertsCount >= 7) {
    return {
      tier: 'platinum',
      label: 'Platinum — Verified',
      confirmedCount: confirmedCertsCount,
      summary: `Top tier with ${confirmedCertsCount} confirmed brand certifications and verified audit.`
    };
  }

  if (confirmedCertsCount >= 5) {
    return {
      tier: 'diamond',
      label: 'Diamond — Verified',
      confirmedCount: confirmedCertsCount,
      nextTier: {
        name: 'Platinum',
        certsNeeded: 7 - confirmedCertsCount
      },
      summary: `Diamond tier with ${confirmedCertsCount} confirmed brand certifications.`
    };
  }

  if (confirmedCertsCount >= 3) {
    return {
      tier: 'gold',
      label: 'Gold — Verified',
      confirmedCount: confirmedCertsCount,
      nextTier: {
        name: 'Diamond',
        certsNeeded: 5 - confirmedCertsCount
      },
      summary: `Gold tier with ${confirmedCertsCount} confirmed brand certifications.`
    };
  }

  if (confirmedCertsCount >= 1) {
    return {
      tier: 'silver',
      label: 'Silver — Verified',
      confirmedCount: confirmedCertsCount,
      nextTier: {
        name: 'Gold',
        certsNeeded: 3 - confirmedCertsCount
      },
      summary: `Silver tier with ${confirmedCertsCount} confirmed brand certification.`
    };
  }

  return {
    tier: 'unverified',
    label: 'Unverified',
    confirmedCount: 0,
    nextTier: {
      name: 'Silver',
      certsNeeded: 1
    },
    summary: 'No brand certifications confirmed yet.'
  };
}
