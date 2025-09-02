const request = require("supertest");
const express = require("express");

const jobsRoutes = require("../routes/jobs");

// Create a test app
const app = express();
app.use(express.json());
app.use("/jobs", jobsRoutes);

describe("Jobs Routes", () => {
  test("Should return job listings (mocked)", async () => {
    const res = await request(app)
      .post("/jobs/search")
      .send({ skills: ["JavaScript", "React"] });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.jobs)).toBe(true);
    expect(res.body.jobs.length).toBeGreaterThan(0);
  });
});

