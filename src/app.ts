import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "success", data: { message: "Working" } });
});

export default app;
