import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  dueDate: z.union([z.coerce.date(), z.null()]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  assigneeUserId: z.union([z.string().cuid(), z.null()]).optional(),
});

export const updateTaskSchema = createTaskSchema.partial();
