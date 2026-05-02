import "dotenv/config";
import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth.js";
import { projectsRouter } from "./routes/projects.js";
import { errorMiddleware } from "./middleware/errors.js";

const app = express();
const port = Number(process.env.PORT) || 4000;

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
