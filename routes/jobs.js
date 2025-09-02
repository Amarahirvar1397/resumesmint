const express = require("express");
const router = express.Router();
router.get("/", async (req, res) => {
  const { skills, location, experience, job_type, salary_min, salary_max, industry } = req.query;

  let queryParams = new URLSearchParams({
    query: skills || "Software Engineer",
    page: "1",
    num_pages: "1"
  });

  if (location) queryParams.append("location", location);
  if (job_type) queryParams.append("employment_types", job_type); // fulltime/parttime
  if (experience) queryParams.append("experience_required", experience);
  if (salary_min) queryParams.append("salary_min", salary_min);
  if (salary_max) queryParams.append("salary_max", salary_max);
  if (industry) queryParams.append("industry", industry);

  console.log("📩 Final JSearch query:", queryParams.toString());

  try {
    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      }
    );

    const data = await response.json();
    console.log("🔍 JSearch API Response:", JSON.stringify(data, null, 2));

    res.json(data.data || []);
  } catch (err) {
    console.error("❌ Error fetching jobs:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});
module.exports = router;