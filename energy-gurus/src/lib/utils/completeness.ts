export interface FieldCheck {
  label: string;
  isComplete: boolean;
}

export function getEpcCompleteness(epc: any, officesCount: number, projectsCount: number) {
  const checks: FieldCheck[] = [
    { label: "Company Name", isComplete: !!epc.companyName && epc.companyName !== "My Company" },
    { label: "CEO Name", isComplete: !!epc.ceoName && epc.ceoName.trim() !== "" },
    { label: "Sectors Selected", isComplete: Array.isArray(epc.sectors) && epc.sectors.length > 0 },
    { label: "Company Logo", isComplete: !!epc.logoUrl && epc.logoUrl.trim() !== "" },
    { label: "About Vision", isComplete: !!epc.about && epc.about.trim() !== "" },
    { label: "Official Website", isComplete: !!epc.website && epc.website.trim() !== "" },
    { label: "Social Media Links", isComplete: Array.isArray(epc.socialLinks) && epc.socialLinks.length > 0 },
    { label: "Showcase Projects or Offices Added", isComplete: officesCount > 0 || projectsCount > 0 }
  ];

  const completeCount = checks.filter(c => c.isComplete).length;
  const score = Math.round((completeCount / checks.length) * 100);
  const missing = checks.filter(c => !c.isComplete).map(c => c.label);

  return { score, checks, missing };
}

export function getBrandCompleteness(brand: any, productsCount: number) {
  const checks: FieldCheck[] = [
    { label: "Brand Name", isComplete: !!brand.brandName && brand.brandName !== "My Brand" },
    { label: "Country Head", isComplete: !!brand.countryHead && brand.countryHead.trim() !== "" },
    { label: "Customer Care Lead", isComplete: !!brand.customerCareHead && brand.customerCareHead.trim() !== "" },
    { label: "Brand Logo", isComplete: !!brand.logoUrl && brand.logoUrl.trim() !== "" },
    { label: "Brand Philosophy", isComplete: !!brand.about && brand.about.trim() !== "" },
    { label: "Head Office Location", isComplete: !!brand.headOffice && brand.headOffice.trim() !== "" },
    { label: "Official Website", isComplete: !!brand.website && brand.website.trim() !== "" },
    { label: "Social Links", isComplete: Array.isArray(brand.socialLinks) && brand.socialLinks.length > 0 },
    { label: "Warranty Spec URL", isComplete: !!brand.warrantyUrl && brand.warrantyUrl.trim() !== "" },
    { label: "Product Listing Added", isComplete: productsCount > 0 }
  ];

  const completeCount = checks.filter(c => c.isComplete).length;
  const score = Math.round((completeCount / checks.length) * 100);
  const missing = checks.filter(c => !c.isComplete).map(c => c.label);

  return { score, checks, missing };
}
