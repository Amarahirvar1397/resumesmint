const request = require("supertest");
const express = require("express");

const resumeRoutes = require("../routes/resume");

// Create a test app
const app = express();
app.use(express.json());
app.use("/resume", resumeRoutes);

describe("Resume Routes", () => {
  test("Should save resume data", async () => {
    const res = await request(app)
      .post("/resume/save")
      .send({
        name: "Test User",
        email: "test@example.com",
        skills: ["JavaScript", "Node.js"]
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Resume saved successfully");
  });

  test("Should export resume", async () => {
    const res = await request(app).get("/resume/export");

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
  });
});
