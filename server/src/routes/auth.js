import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errors.js";
import {
  loginSchema,
  registerSchema,
} from "../validators/schemas.js";

export const authRouter = Router();

async function validateBody(schema, req) {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    const err = new Error("Validation failed");
    err.status = 400;
    err.details = parsed.error.flatten().fieldErrors;
    throw err;
  }
  return parsed.data;
}

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const body = await validateBody(registerSchema, req);
    const exists = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });
    if (exists) {
      const err = new Error("Email already registered");
      err.status = 409;
      throw err;
    }
    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email.toLowerCase(),
        passwordHash,
      },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    const token = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(201).json({ user, token });
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const body = await validateBody(loginSchema, req);
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });
    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      const err = new Error("Invalid email or password");
      err.status = 401;
      throw err;
    }
    const token = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  })
);

authRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    res.json(user);
  })
);
