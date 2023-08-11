import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { generateCertificate, validateEventIsOver } from "@/controllers";

const certificateRouter = Router();

certificateRouter
  .all("/*", authenticateToken)
  .get("/", validateEventIsOver)
  .get("/generate", generateCertificate);

export { certificateRouter };
