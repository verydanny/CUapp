import { z } from "zod";


export const ProfilesSchemaBase = z.object({
  $id: z.string().optional(),
  $createdAt: z.string().optional(),
  $updatedAt: z.string().optional(),
  username: z.string().max(40, "Maximum length of 40 characters exceeded").nullish(),
  userId: z.string().max(40, "Maximum length of 40 characters exceeded"),
  bio: z.string().max(1500, "Maximum length of 1500 characters exceeded").nullish(),
  profileImage: z.string().max(32, "Maximum length of 32 characters exceeded").nullish(),
});

export type ProfilesBase = z.infer<typeof ProfilesSchemaBase>;

export const ProfilesSchema: z.ZodType<ProfilesBase> = ProfilesSchemaBase;
export type Profiles = z.infer<typeof ProfilesSchema>;

