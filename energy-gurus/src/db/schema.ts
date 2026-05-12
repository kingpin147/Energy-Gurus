import { pgTable, text, timestamp, uuid, jsonb, integer, boolean } from 'drizzle-orm/pg-core';

export const userRoleEnum = ['super-admin', 'admin', 'epc', 'brand', 'user'] as const;
export type UserRole = (typeof userRoleEnum)[number];

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: text('role').$type<UserRole>().default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const epcInstallers = pgTable('epc_installers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  companyName: text('company_name').notNull(),
  logoUrl: text('logo_url'),
  about: text('about'),
  portfolio: jsonb('portfolio').$type<string[]>().default([]),
  socialLinks: jsonb('social_links').$type<{ platform: string; url: string }[]>().default([]),
  website: text('website'),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const brands = pgTable('brands', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  brandName: text('brand_name').notNull(),
  logoUrl: text('logo_url'),
  about: text('about'),
  photos: jsonb('photos').$type<string[]>().default([]),
  reps: jsonb('reps').$type<{ name: string; designation: string }[]>().default([]),
  customerCare: text('customer_care'),
  website: text('website'),
  socialLinks: jsonb('social_links').$type<{ platform: string; url: string }[]>().default([]),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  brandId: uuid('brand_id').references(() => brands.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  datasheetUrl: text('datasheet_url'),
  serialNumber: text('serial_number'),
  qrCode: text('qr_code'),
  warrantyLink: text('warranty_link'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const podcasts = pgTable('podcasts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  youtubeUrl: text('youtube_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  guestName: text('guest_name'),
  guestDesignation: text('guest_designation'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const liveQA = pgTable('live_qa', {
  id: uuid('id').defaultRandom().primaryKey(),
  topic: text('topic').notNull(),
  youtubeUrl: text('youtube_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  expertName: text('expert_name'),
  sessionDate: timestamp('session_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const inquiries = pgTable('inquiries', {
  id: uuid('id').defaultRandom().primaryKey(),
  senderId: uuid('sender_id').references(() => users.id),
  receiverId: uuid('receiver_id').references(() => users.id).notNull(),
  message: text('message').notNull(),
  status: text('status').default('new').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  targetId: uuid('target_id').notNull(),
  targetType: text('target_type').$type<'epc' | 'brand'>().notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  reply: text('reply'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const productSerials = pgTable('product_serials', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  serialNumber: text('serial_number').notNull().unique(),
  status: text('status').$type<'genuine' | 'stolen' | 'expired'>().default('genuine').notNull(),
  warrantyExpiry: timestamp('warranty_expiry'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const invitations = pgTable('invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  role: text('role').$type<UserRole>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const liveQaQuestions = pgTable('live_qa_questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').references(() => liveQA.id, { onDelete: 'cascade' }).notNull(),
  userName: text('user_name').notNull(),
  question: text('question').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});



