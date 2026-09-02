import { pgTable, text, timestamp, uuid, jsonb, integer, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ... (existing code) ...


export const userRoleEnum = ['super-admin', 'admin', 'epc', 'brand'] as const;
export type UserRole = (typeof userRoleEnum)[number];

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: text('role').$type<UserRole>().default('epc').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
    }, (table) => ({
  isActiveIdx: index('users_is_active_idx').on(table.isActive),
  createdAtIdx: index('users_created_at_idx').on(table.createdAt)
    }));

export const epcInstallers = pgTable('epc_installers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  companyName: text('company_name').notNull(),
  ceoName: text('ceo_name'),
  designation: text('designation'),
  businessType: text('business_type'),
  sectors: jsonb('sectors').$type<string[]>().default([]),
  certifications: jsonb('certifications').$type<string[]>().default([]),
  logoUrl: text('logo_url'),
  photos: jsonb('photos').$type<string[]>().default([]),
  about: text('about'),
  portfolio: jsonb('portfolio').$type<string[]>().default([]),
  socialLinks: jsonb('social_links').$type<{ platform: string; url: string }[]>().default([]),
  reviewVideos: jsonb('review_videos').$type<string[]>().default([]),
  website: text('website'),
  isVerified: boolean('is_verified').default(false),
  yearsInBusiness: integer('years_in_business'),
  address: text('address'),
  area: text('area'),
  city: text('city'),
  country: text('country').default('Pakistan'),
  coordinates: text('coordinates'),
  contactNo: text('contact_no'),
  whatsapp: text('whatsapp'),
  email: text('email'),
  brandsCertified: jsonb('brands_certified').$type<string[]>().default([]),
  solarBrands: jsonb('solar_brands').$type<string[]>().default([]),
  inverterBrands: jsonb('inverter_brands').$type<string[]>().default([]),
  batteryBrands: jsonb('battery_brands').$type<string[]>().default([]),
  solarCertDocuments: jsonb('solar_cert_documents').$type<string[]>().default([]),
  inverterCertDocuments: jsonb('inverter_cert_documents').$type<string[]>().default([]),
  batteryCertDocuments: jsonb('battery_cert_documents').$type<string[]>().default([]),
  team: jsonb('team').$type<{ name: string; designation: string; linkedIn: string; imageUrl: string }[]>().default([]),
  regNumber: text('reg_number'),
  licenceDocuments: jsonb('licence_documents').$type<string[]>().default([]),
  tier: text('tier').$type<'bronze' | 'silver' | 'gold'>().default('bronze'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
    }, (table) => ({
  userIdIdx: index('epc_installers_user_id_idx').on(table.userId),
  createdAtIdx: index('epc_installers_created_at_idx').on(table.createdAt)
    }));

export const epcOffices = pgTable('epc_offices', {
  id: uuid('id').defaultRandom().primaryKey(),
  epcId: uuid('epc_id').references(() => epcInstallers.id, { onDelete: 'cascade' }).notNull(),
  officeNumber: text('office_number'),
  address: text('address'),
  block: text('block'),
  area: text('area'),
  city: text('city').notNull(),
  country: text('country').default('Pakistan'),
  coordinates: text('coordinates'),
  createdAt: timestamp('created_at').defaultNow().notNull()
    }, (table) => ({
  epcIdIdx: index('epc_offices_epc_id_idx').on(table.epcId)
    }));

export const epcProjects = pgTable('epc_projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  epcId: uuid('epc_id').references(() => epcInstallers.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  entryType: text('entry_type').$type<'project' | 'testimonial'>().default('project'),
  customerName: text('customer_name'),
  companyName: text('company_name'),
  installationDate: text('installation_date'),
  country: text('country'),
  description: text('description'),
  city: text('city'),
  segmentType: jsonb('segment_type').$type<string[]>().default([]), // Residential, Commercial, etc. (Multi-select)
  systemSize: text('system_size'), // e.g. "10kW"
  systemType: text('system_type'), // Hybrid, Grid Tied, etc.
  inverterModel: text('inverter_model'),
  batteryModel: text('battery_model'),
  solarPanelModel: text('solar_panel_model'),
  images: jsonb('images').$type<string[]>().default([]),
  videos: jsonb('videos').$type<string[]>().default([]),
  youtubeUrl: text('youtube_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
    }, (table) => ({
  epcIdIdx: index('epc_projects_epc_id_idx').on(table.epcId)
    }));

export const brands = pgTable('brands', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  brandName: text('brand_name').notNull(),
  categories: jsonb('categories').$type<string[]>().default([]),
  countryHead: text('country_head'),
  customerCareHead: text('customer_care_head'),
  logoUrl: text('logo_url'),
  about: text('about'),
  photos: jsonb('photos').$type<string[]>().default([]),
  reps: jsonb('reps').$type<{ name: string; designation: string }[]>().default([]),
  customerCare: text('customer_care'),
  headOffice: text('head_office'),
  website: text('website'),
  warrantyUrl: text('warranty_url'),
  socialLinks: jsonb('social_links').$type<{ platform: string; url: string }[]>().default([]),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
    }, (table) => ({
  userIdIdx: index('brands_user_id_idx').on(table.userId),
  createdAtIdx: index('brands_created_at_idx').on(table.createdAt)
    }));

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  brandId: uuid('brand_id').references(() => brands.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  category: text('category'), // Solar Panels, Inverters, Batteries
  description: text('description'),
  datasheetUrl: text('datasheet_url'),
  serialNumber: text('serial_number'),
  warrantyLink: text('warranty_link'),
  imageUrl: text('image_url'),
  series: text('series'), // e.g. "Hi-MO 6", "N-Type"
  specifications: jsonb('specifications').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
    }, (table) => ({
  brandIdIdx: index('products_brand_id_idx').on(table.brandId)
    }));

export const podcasts = pgTable('podcasts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  youtubeUrl: text('youtube_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  guestName: text('guest_name'),
  guestDesignation: text('guest_designation'),
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow().notNull()
    }, (table) => ({
  createdAtIdx: index('podcasts_created_at_idx').on(table.createdAt)
    }));

export const liveQA = pgTable('live_qa', {
  id: uuid('id').defaultRandom().primaryKey(),
  topic: text('topic').notNull(),
  description: text('description'),
  youtubeUrl: text('youtube_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  expertName: text('expert_name'),
  expertTitle: text('expert_title'),
  expertPhotoUrl: text('expert_photo_url'),
  status: text('status').$type<'upcoming' | 'live' | 'archived'>().default('upcoming').notNull(),
  sessionDate: timestamp('session_date'),
  createdAt: timestamp('created_at').defaultNow().notNull()
    }, (table) => ({
  createdAtIdx: index('live_qa_created_at_idx').on(table.createdAt)
    }));

export const inquiries = pgTable('inquiries', {
  id: uuid('id').defaultRandom().primaryKey(),
  senderId: uuid('sender_id').references(() => users.id, { onDelete: 'cascade' }),
  receiverId: uuid('receiver_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  guestName: text('guest_name'),
  guestEmail: text('guest_email'),
  guestPhone: text('guest_phone'),
  message: text('message').notNull(),
  subject: text('subject'),
  reply: text('reply'),
  status: text('status').default('new').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  inquiryType: text('inquiry_type').$type<'client' | 'support' | 'public'>().default('client').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
    }, (table) => ({
  receiverIdIdx: index('inquiries_receiver_id_idx').on(table.receiverId),
  senderIdIdx: index('inquiries_sender_id_idx').on(table.senderId),
  createdAtIdx: index('inquiries_created_at_idx').on(table.createdAt),
  receiverReadIdx: index('inquiries_receiver_read_idx').on(table.receiverId, table.isRead)
    }));

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  targetId: uuid('target_id').notNull(),
  targetType: text('target_type').$type<'epc' | 'brand'>().notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  reply: text('reply'),
  createdAt: timestamp('created_at').defaultNow().notNull()
    }, (table) => ({
  targetIdx: index('reviews_target_idx').on(table.targetId, table.targetType),
  authorIdIdx: index('reviews_author_id_idx').on(table.authorId)
    }));

export const productSerials = pgTable('product_serials', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  serialNumber: text('serial_number').notNull().unique(),
  status: text('status').$type<'genuine' | 'stolen' | 'expired'>().default('genuine').notNull(),
  warrantyExpiry: timestamp('warranty_expiry'),
  createdAt: timestamp('created_at').defaultNow().notNull()
    }, (table) => ({
  productIdIdx: index('product_serials_product_id_idx').on(table.productId)
    }));

export const invitations = pgTable('invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  role: text('role').$type<UserRole>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
    });

export const liveQaQuestions = pgTable('live_qa_questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').references(() => liveQA.id, { onDelete: 'cascade' }).notNull(),
  userName: text('user_name').notNull(),
  question: text('question').notNull(),
  isAnswered: boolean('is_answered').default(false).notNull(),
  isHighlighted: boolean('is_highlighted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
    }, (table) => ({
  sessionIdIdx: index('live_qa_questions_session_id_idx').on(table.sessionId),
  sessionAnsweredIdx: index('live_qa_questions_session_answered_idx').on(table.sessionId, table.isAnswered)
    }));

export const monitoringStats = pgTable('monitoring_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  totalPowerFlow: text('total_power_flow').notNull(), // kW as string for precision or just use numeric
  gridExport: text('grid_export').notNull(),
  selfConsumption: integer('self_consumption').notNull(), // percentage
  inverterHealth: jsonb('inverter_health').$type<{
    status: 'optimal' | 'warning' | 'error';
    temp: number;
    efficiency: number;
  }[]>().default([]).notNull(),
  alerts: jsonb('alerts').$type<{
    type: 'critical' | 'warning' | 'info';
    message: string;
    timestamp: string;
  }[]>().default([]).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
    });

export const brandCertifications = pgTable('brand_certifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  brandId: uuid('brand_id').references(() => brands.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  issuingBody: text('issuing_body'),
  expiryDate: timestamp('expiry_date'),
  createdAt: timestamp('created_at').defaultNow().notNull()
    }, (table) => ({
  brandIdIdx: index('brand_certifications_brand_id_idx').on(table.brandId)
    }));

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').$type<'inquiry' | 'reply' | 'system'>().default('inquiry').notNull(),
  link: text('link'),
  senderLogoUrl: text('sender_logo_url'),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
    }, (table) => ({
  userIdIdx: index('notifications_user_id_idx').on(table.userId),
  userReadIdx: index('notifications_user_read_idx').on(table.userId, table.isRead)
    }));

export const usersRelations = relations(users, ({ one, many }) => ({
  epcInstaller: one(epcInstallers, {
    fields: [users.id],
    references: [epcInstallers.userId]
    }),
  brand: one(brands, {
    fields: [users.id],
    references: [brands.userId]
    }),
  notifications: many(notifications)
    }));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
    })
    }));

export const epcInstallersRelations = relations(epcInstallers, ({ one }) => ({
  user: one(users, {
    fields: [epcInstallers.userId],
    references: [users.id]
    })
    }));

export const brandsRelations = relations(brands, ({ one }) => ({
  user: one(users, {
    fields: [brands.userId],
    references: [users.id]
    })
    }));

export const monitoringRequests = pgTable('monitoring_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerName: text('customer_name').notNull(),
  address: text('address').notNull(),
  contactNo: text('contact_no').notNull(),
  email: text('email').notNull(),
  cnic: text('cnic').notNull(),
  customerType: text('customer_type').notNull(),
  systemSize: text('system_size').notNull(),
  package: text('package').notNull(),
  monitoringHours: text('monitoring_hours').notNull(),
  paymentPlan: text('payment_plan').notNull(),
  amountPayable: text('amount_payable'),
  status: text('status').$type<'pending' | 'contacted' | 'active'>().default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
    });

export const news = pgTable('news', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(),
  imageUrl: text('image_url'),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  authorName: text('author_name'),
  authorPictureUrl: text('author_picture_url'),
  authorDesignation: text('author_designation'),
  authorOrganization: text('author_organization'),
  authorLinkedIn: text('author_linkedin'),
  authorEmail: text('author_email'),
  isPublished: boolean('is_published').default(false).notNull(),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  authorIdIdx: index('news_author_id_idx').on(table.authorId),
  slugIdx: index('news_slug_idx').on(table.slug),
  createdAtIdx: index('news_created_at_idx').on(table.createdAt)
}));

export const newsRelations = relations(news, ({ one }) => ({
  author: one(users, {
    fields: [news.authorId],
    references: [users.id]
  })
}));

export const ads = pgTable('ads', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  imageUrl: text('image_url').notNull(),
  mobileImageUrl: text('mobile_image_url'),
  linkUrl: text('link_url'),
  placement: text('placement').notNull(),
  targetPage: text('target_page').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});
