import { z } from "zod";

/**
 * Review Validation Schema
 */
export const reviewSubmissionSchema = z.object({
  targetId: z.string().uuid("Invalid target ID"),
  targetType: z.enum(["epc", "brand"], { message: "Target must be 'epc' or 'brand'" }),
  rating: z.coerce.number().int().min(1).max(5, "Rating must be between 1 and 5 stars"),
  comment: z.string().min(5, "Review comment must be at least 5 characters"),
  reviewerName: z.string().min(2, "Name must be at least 2 characters").optional().or(z.literal("")),
  authorEmail: z.string().email("Please provide a valid email address").optional().or(z.literal("")),
  city: z.string().optional().nullable(),
  productUsed: z.string().optional().nullable(),
  proofUrl: z.string().url("Proof must be a valid URL").optional().nullable().or(z.literal("")),
});

export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;

/**
 * Certification Submission & Moderation Schema
 */
export const certificationSubmissionSchema = z.object({
  installerId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional().nullable(),
  brandName: z.string().min(2, "Brand name is required"),
  certifiedSince: z.string().optional().nullable(),
  proofUrl: z.string().url("Proof document must be a valid R2 URL").optional().nullable().or(z.literal("")),
  brandNotes: z.string().optional().nullable(),
  adminNotes: z.string().optional().nullable(),
  brandRating: z.string().optional().nullable(),
});

export type CertificationSubmissionInput = z.infer<typeof certificationSubmissionSchema>;

/**
 * Brand Profile Validation Schema
 */
export const brandProfileSchema = z.object({
  brandName: z.string().min(2, "Brand name is required"),
  tagline: z.string().optional().nullable(),
  categories: z.array(z.string()).default([]),
  countryHead: z.string().optional().nullable(),
  customerCareHead: z.string().optional().nullable(),
  logoUrl: z.string().url("Logo must be a valid URL").optional().nullable().or(z.literal("")),
  about: z.string().optional().nullable(),
  founded: z.string().optional().nullable(),
  headquarters: z.string().optional().nullable(),
  countryOfOrigin: z.string().optional().nullable(),
  website: z.string().url("Website must be a valid URL").optional().nullable().or(z.literal("")),
  warrantyUrl: z.string().url("Warranty URL must be valid").optional().nullable().or(z.literal("")),
  annualCapacity: z.object({
    panels: z.string().optional(),
    inverters: z.string().optional(),
    batteries: z.string().optional(),
    bess: z.string().optional(),
    breakers: z.string().optional(),
  }).optional().default({}),
  worldwideProjects: z.array(
    z.object({
      title: z.string(),
      location: z.string(),
      description: z.string(),
      imageUrl: z.string().optional(),
    })
  ).default([]),
  manufacturingFacilities: z.array(
    z.object({
      name: z.string(),
      location: z.string(),
      description: z.string(),
      imageUrl: z.string().optional(),
    })
  ).default([]),
  offices: z.array(
    z.object({
      type: z.string(),
      name: z.string(),
      city: z.string(),
      address: z.string(),
      phone: z.string().optional(),
      email: z.string().optional(),
      whatsapp: z.string().optional(),
      mapUrl: z.string().optional(),
      coordinates: z.string().optional(),
    })
  ).default([]),
  localTeam: z.array(
    z.object({
      name: z.string(),
      designation: z.string(),
      department: z.enum(["sales", "technical", "afterSales"]),
      linkedIn: z.string().optional(),
      avatarUrl: z.string().optional(),
    })
  ).default([]),
  distributors: z.array(
    z.object({
      name: z.string(),
      city: z.string(),
      territory: z.string(),
      contactPerson: z.string(),
      phone: z.string(),
      email: z.string(),
      address: z.string(),
      mapUrl: z.string().optional(),
      since: z.string().optional(),
      status: z.string().optional(),
    })
  ).default([]),
  retailers: z.array(
    z.object({
      name: z.string(),
      city: z.string(),
      address: z.string(),
      phone: z.string(),
      whatsapp: z.string(),
      mapUrl: z.string(),
      type: z.string().optional(),
      since: z.string().optional(),
      status: z.string().optional(),
    })
  ).default([]),
  serviceCentres: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      city: z.string(),
      address: z.string(),
      phone: z.string(),
      hotline: z.string(),
      hours: z.string(),
      services: z.array(z.string()),
      mapUrl: z.string().optional(),
    })
  ).default([]),
  socialLinks: z.array(
    z.object({
      platform: z.string(),
      url: z.string().url(),
    })
  ).default([]),
});

export type BrandProfileInput = z.infer<typeof brandProfileSchema>;

/**
 * Installer Profile Validation Schema
 */
export const installerProfileSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  ceoName: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  businessType: z.string().optional().nullable(),
  sectors: z.array(z.string()).default([]),
  about: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable().or(z.literal("")),
  website: z.string().url().optional().nullable().or(z.literal("")),
  contactNo: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  regNumber: z.string().optional().nullable(),
  tier: z.enum(["unverified", "bronze", "silver", "gold", "diamond", "platinum"]).default("unverified"),
  memberships: z.array(
    z.object({
      name: z.string(),
      certUrl: z.string().optional(),
    })
  ).default([]),
  team: z.array(
    z.object({
      name: z.string(),
      designation: z.string(),
      linkedIn: z.string(),
      imageUrl: z.string(),
    })
  ).default([]),
  socialLinks: z.array(
    z.object({
      platform: z.string(),
      url: z.string(),
    })
  ).default([]),
});

export type InstallerProfileInput = z.infer<typeof installerProfileSchema>;

/**
 * Inquiry Submission Schema
 */
export const inquirySubmissionSchema = z.object({
  receiverId: z.string().uuid("Invalid recipient ID"),
  message: z.string().min(2, "Message must be at least 2 characters").max(5000, "Message cannot exceed 5000 characters"),
  guestName: z.string().max(100).optional().nullable().or(z.literal("")),
  guestEmail: z.string().email("Invalid email address").optional().nullable().or(z.literal("")),
  guestPhone: z.string().max(50).optional().nullable().or(z.literal("")),
  inquiryType: z.enum(["client", "support"]).default("client"),
});

export type InquirySubmissionInput = z.infer<typeof inquirySubmissionSchema>;

/**
 * Support Message Schema
 */
export const supportMessageSchema = z.object({
  senderEmail: z.string().email("Invalid email address"),
  senderName: z.string().min(1, "Name is required").max(100),
  senderPhone: z.string().max(50).optional().nullable().or(z.literal("")),
  subject: z.string().min(2, "Subject must be at least 2 characters").max(200, "Subject cannot exceed 200 characters"),
  message: z.string().min(5, "Message must be at least 5 characters").max(5000, "Message cannot exceed 5000 characters"),
  category: z.string().max(50).optional().nullable().or(z.literal("")),
});

export type SupportMessageInput = z.infer<typeof supportMessageSchema>;

/**
 * Live QA Question Schema
 */
export const liveQuestionSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  userName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  question: z.string().min(5, "Question must be at least 5 characters").max(1000, "Question cannot exceed 1000 characters"),
});

export type LiveQuestionInput = z.infer<typeof liveQuestionSchema>;

/**
 * Ad Banner Schema
 */
export const adBannerSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(150),
  targetUrl: z.string().url("Target URL must be a valid web URL"),
  placement: z.enum([
    "leaderboard_top",
    "leaderboard_bottom",
    "skyscraper_left",
    "skyscraper_right",
    "in_list",
    "custom",
  ]),
  targetPage: z.enum([
    "home",
    "brands",
    "epcs",
    "news",
    "monitoring",
    "podcast",
    "global",
  ]).default("global"),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type AdBannerInput = z.infer<typeof adBannerSchema>;
