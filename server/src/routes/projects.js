import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errors.js";
import {
  createProjectSchema,
  createTaskSchema,
  updateTaskSchema,
} from "../validators/schemas.js";
import { z } from "zod";

export const projectsRouter = Router();
projectsRouter.use(authenticate);

async function parseBody(schema, req) {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    const err = new Error("Validation failed");
    err.status = 400;
    err.details = parsed.error.flatten();
    throw err;
  }
  return parsed.data;
}

async function getMembership(projectId, userId) {
  return prisma.projectMember.findFirst({
    where: { projectId, userId },
  });
}

function requireRole(membership, roles) {
  if (!membership || !roles.includes(membership.role)) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
}

projectsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = await parseBody(createProjectSchema, req);
    const project = await prisma.$transaction(async (tx) => {
      const p = await tx.project.create({
        data: { name: body.name, description: body.description ?? null },
      });
      await tx.projectMember.create({
        data: {
          projectId: p.id,
          userId: req.userId,
          role: "ADMIN",
        },
      });
      return p;
    });
    res.status(201).json(project);
  })
);

projectsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const memberships = await prisma.projectMember.findMany({
      where: { userId: req.userId },
      include: {
        project: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
            _count: { select: { tasks: true } },
          },
        },
      },
    });
    const list = memberships.map((m) => ({
      ...m.project,
      myRole: m.role,
      memberCount: m.project.members.length,
      taskCount: m.project._count.tasks,
    }));
    res.json(list);
  })
);

projectsRouter.get(
  "/:projectId",
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const membership = await getMembership(projectId, req.userId);
    if (!membership) {
      const err = new Error("Project not found");
      err.status = 404;
      throw err;
    }
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
    res.json({
      ...project,
      myRole: membership.role,
    });
  })
);

const addMemberSchema = z.object({ email: z.string().email() });

projectsRouter.post(
  "/:projectId/members",
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const membership = await getMembership(projectId, req.userId);
    requireRole(membership, ["ADMIN"]);

    const body = await parseBody(addMemberSchema, req);
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });
    if (!user) {
      const err = new Error("No user with that email");
      err.status = 404;
      throw err;
    }
    try {
      const added = await prisma.projectMember.create({
        data: { projectId, userId: user.id, role: "MEMBER" },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      res.status(201).json(added);
    } catch (e) {
      if (e.code === "P2002") {
        const err = new Error("User already in project");
        err.status = 409;
        throw err;
      }
      throw e;
    }
  })
);

projectsRouter.delete(
  "/:projectId/members/:userId",
  asyncHandler(async (req, res) => {
    const { projectId, userId } = req.params;
    const membership = await getMembership(projectId, req.userId);
    requireRole(membership, ["ADMIN"]);
    if (userId === req.userId) {
      const err = new Error("Admins cannot remove themselves");
      err.status = 400;
      throw err;
    }
    const victim = await getMembership(projectId, userId);
    if (!victim) {
      const err = new Error("Member not in project");
      err.status = 404;
      throw err;
    }
    if (victim.role === "ADMIN") {
      const admins = await prisma.projectMember.count({
        where: { projectId, role: "ADMIN" },
      });
      if (admins <= 1) {
        const err = new Error("Cannot remove last admin");
        err.status = 400;
        throw err;
      }
    }
    await prisma.projectMember.delete({ where: { id: victim.id } });
    res.status(204).send();
  })
);

projectsRouter.get(
  "/:projectId/tasks",
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const membership = await getMembership(projectId, req.userId);
    if (!membership) {
      const err = new Error("Project not found");
      err.status = 404;
      throw err;
    }
    let tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });
    if (membership.role === "MEMBER") {
      tasks = tasks.filter(
        (t) => !t.assigneeUserId || t.assigneeUserId === req.userId
      );
    }
    res.json(tasks);
  })
);

projectsRouter.post(
  "/:projectId/tasks",
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const membership = await getMembership(projectId, req.userId);
    requireRole(membership, ["ADMIN"]);
    const body = await parseBody(createTaskSchema, req);

    if (body.assigneeUserId != null) {
      const pm = await getMembership(projectId, body.assigneeUserId);
      if (!pm) {
        const err = new Error("Assignee must be a project member");
        err.status = 400;
        throw err;
      }
    }

    const dueDate =
      body.dueDate === null || body.dueDate === undefined
        ? null
        : body.dueDate;

    const task = await prisma.task.create({
      data: {
        projectId,
        title: body.title,
        description: body.description ?? null,
        dueDate,
        priority: body.priority ?? "MEDIUM",
        status: body.status ?? "TODO",
        assigneeUserId: body.assigneeUserId ?? null,
        createdByUserId: req.userId,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
    res.status(201).json(task);
  })
);

projectsRouter.patch(
  "/:projectId/tasks/:taskId",
  asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params;
    const membership = await getMembership(projectId, req.userId);
    if (!membership) {
      const err = new Error("Project not found");
      err.status = 404;
      throw err;
    }
    const body = await parseBody(updateTaskSchema, req);

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
    });
    if (!task) {
      const err = new Error("Task not found");
      err.status = 404;
      throw err;
    }

    if (membership.role === "MEMBER") {
      if (!task.assigneeUserId || task.assigneeUserId !== req.userId) {
        const err = new Error("Forbidden");
        err.status = 403;
        throw err;
      }
      if (body.assigneeUserId !== undefined) {
        const err = new Error("Members cannot reassign tasks");
        err.status = 403;
        throw err;
      }
    }

    if (body.assigneeUserId !== undefined && body.assigneeUserId !== null) {
      const pm = await getMembership(projectId, body.assigneeUserId);
      if (!pm) {
        const err = new Error("Assignee must be a project member");
        err.status = 400;
        throw err;
      }
    }

    const data = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.priority !== undefined) data.priority = body.priority;
    if (body.status !== undefined) data.status = body.status;
    if (body.dueDate !== undefined) {
      data.dueDate =
        body.dueDate === null ? null : body.dueDate;
    }
    if (body.assigneeUserId !== undefined) {
      data.assigneeUserId = body.assigneeUserId;
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
    res.json(updated);
  })
);

projectsRouter.delete(
  "/:projectId/tasks/:taskId",
  asyncHandler(async (req, res) => {
    const { projectId, taskId } = req.params;
    const membership = await getMembership(projectId, req.userId);
    requireRole(membership, ["ADMIN"]);
    const deleted = await prisma.task.deleteMany({
      where: { id: taskId, projectId },
    });
    if (!deleted.count) {
      const err = new Error("Task not found");
      err.status = 404;
      throw err;
    }
    res.status(204).send();
  })
);

projectsRouter.get(
  "/:projectId/dashboard",
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const membership = await getMembership(projectId, req.userId);
    if (!membership) {
      const err = new Error("Project not found");
      err.status = 404;
      throw err;
    }
    let where = { projectId };
    if (membership.role === "MEMBER") {
      where = {
        AND: [
          { projectId },
          {
            OR: [
              { assigneeUserId: req.userId },
              { assigneeUserId: null },
            ],
          },
        ],
      };
    }
    const tasks = await prisma.task.findMany({ where });

    const now = new Date();
    const byStatus = {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
    };
    const byUserMap = {};

    let overdue = 0;
    for (const t of tasks) {
      byStatus[t.status]++;
      const key = t.assigneeUserId ?? "unassigned";
      byUserMap[key] = (byUserMap[key] ?? 0) + 1;
      if (
        t.dueDate &&
        t.dueDate < now &&
        t.status !== "DONE"
      ) {
        overdue++;
      }
    }

    const userIds = Object.keys(byUserMap).filter((k) => k !== "unassigned");
    const users =
      userIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true },
          })
        : [];
    const tasksPerUser = [
      ...(byUserMap.unassigned !== undefined
        ? [{ userId: null, label: "Unassigned", count: byUserMap.unassigned }]
        : []),
      ...users.map((u) => ({
        userId: u.id,
        label: u.name,
        email: u.email,
        count: byUserMap[u.id] ?? 0,
      })),
    ];

    res.json({
      totalTasks: tasks.length,
      tasksByStatus: byStatus,
      tasksPerUser,
      overdueTasks: overdue,
      role: membership.role,
    });
  })
);
