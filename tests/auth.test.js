const request = require("supertest");
const express = require("express");
const session = require("express-session");

const authRoutes = require("../routes/auth");

// Create a test app
const app = express();
app.use(express.json());
app.use(session({ secret: "testsecret", resave: false, saveUninitialized: true }));
app.use("/auth", authRoutes);

describe("Auth Routes", () => {
  test("Signup should create a new user", async () => {
    const res = await request(app)
      .post("/auth/signup")
      .send({ name: "Test User", email: "test@example.com", password: "123456" });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User registered successfully");
  });

  test("Login should return success for valid user", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@example.com", password: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Login successful");
  });

  test("Login should fail for wrong password", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@example.com", password: "wrongpass" });

    expect(res.statusCode).toBe(401);
  });
});
