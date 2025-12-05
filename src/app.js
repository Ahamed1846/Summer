import { router } from "./core/index.js";

router.get("/hello", (req, res) => {
  res.text("Hello from Summer Router!");
});

router.get("/users/:id", (req, res) => {
  res.json({ userId: req.params.id });
});
