import { z } from 'zod';

// Common schema parts
const coordinatesSchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })
  .nullable()
  .optional();

const boundariesSchema = z.array(z.any()).nullable().optional();

const uiAttributeSchema = {
  icon: z.string().nullable().optional(),
  image: z.any().nullable().optional(),
  color: z.string().nullable().optional(),
};

// ============= ROLE SCHEMAS =============
export const roleCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  ...uiAttributeSchema,
});

export const roleUpdateSchema = roleCreateSchema.partial();

export type RoleFormData = z.infer<typeof roleCreateSchema>;

// ============= USER SCHEMAS =============
export const userCreateSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50, 'Username must be less than 50 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  roles: z.array(z.string()).optional(),
});

export const userUpdateSchema = userCreateSchema.omit({ password: true }).partial();

export type UserCreateFormData = z.infer<typeof userCreateSchema>;
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;

// ============= COUNTRY SCHEMAS =============
export const countryCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  code: z.string().min(3, 'Please provide a correct ISO-3 code').max(3, 'Please provide a correct ISO-3 code'),
  currency: z
    .string()
    .min(3, 'Please provide a valid 3 letter currency')
    .max(3, 'Currency must be at most 3 characters')
    .nullable()
    .optional(),
  phone_code: z.string().max(5, 'Phone code must be at most 5 characters').nullable().optional(),
  coordinates: coordinatesSchema,
  boundaries: boundariesSchema,
});

export const countryUpdateSchema = countryCreateSchema.partial();

export type CountryFormData = z.infer<typeof countryCreateSchema>;

// ============= CITY SCHEMAS =============
export const cityCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  country_id: z.string().uuid('Please select a country'),
  timezone: z.string().nullable().optional(),
  coordinates: coordinatesSchema,
  boundaries: boundariesSchema,
});

export const cityUpdateSchema = cityCreateSchema.partial();

export type CityFormData = z.infer<typeof cityCreateSchema>;

// ============= DISTRICT SCHEMAS =============
export const districtCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  city_id: z.string().uuid('Please select a city'),
  coordinates: coordinatesSchema,
  boundaries: boundariesSchema,
});

export const districtUpdateSchema = districtCreateSchema.partial();

export type DistrictFormData = z.infer<typeof districtCreateSchema>;

// ============= AREA SCHEMAS =============
export const areaCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  coordinates: coordinatesSchema,
  boundaries: boundariesSchema,
});

export const areaUpdateSchema = areaCreateSchema.partial();

export type AreaFormData = z.infer<typeof areaCreateSchema>;

// ============= CATEGORY SCHEMAS =============
export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export type CategoryFormData = z.infer<typeof categoryCreateSchema>;

// ============= AMENITY SCHEMAS =============
export const amenityCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().nullable().optional(),
  ...uiAttributeSchema,
});

export const amenityUpdateSchema = amenityCreateSchema.partial();

export type AmenityFormData = z.infer<typeof amenityCreateSchema>;

// ============= ATTRACTION SCHEMAS =============
export const attractionCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().nullable().optional(),
  ...uiAttributeSchema,
  coordinates: coordinatesSchema,
  boundaries: boundariesSchema,
});

export const attractionUpdateSchema = attractionCreateSchema.partial();

export type AttractionFormData = z.infer<typeof attractionCreateSchema>;

// ============= TRANSPORT SCHEMAS =============
export const transportCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  ...uiAttributeSchema,
});

export const transportUpdateSchema = transportCreateSchema.partial();

export type TransportFormData = z.infer<typeof transportCreateSchema>;

// ============= FEATURE TYPE SCHEMAS =============
export const featureTypeCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  ...uiAttributeSchema,
});

export const featureTypeUpdateSchema = featureTypeCreateSchema.partial();

export type FeatureTypeFormData = z.infer<typeof featureTypeCreateSchema>;

// ============= STRUCTURE TYPE SCHEMAS =============
export const structureTypeCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  ...uiAttributeSchema,
});

export const structureTypeUpdateSchema = structureTypeCreateSchema.partial();

export type StructureTypeFormData = z.infer<typeof structureTypeCreateSchema>;
