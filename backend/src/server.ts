import cors from "cors";
import express from "express";
import { cvRouter } from "./routes/cv.js";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    message: "Backend portfolio operationnel.",
  });
});

app.use("/api/cv", cvRouter);

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
