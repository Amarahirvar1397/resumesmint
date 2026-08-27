const express = require("express");
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

router.post("/analyze", async (req, res) => {
  try {
    const {
      name,
      skills,
      education,
      experience,
      summary
    } = req.body;

    if (!skills && !experience && !education && !summary) {
      return res.status(400).json({
        success: false,
        message: "Not enough resume information for AI analysis."
      });
    }

    // ========================================
    // STEP 1: GEMINI ANALYZES THE RESUME
    // ========================================

    const prompt = `
You are an expert job recommendation assistant.

Analyze this candidate's resume information and identify suitable job roles and search queries.

Candidate:
Name: ${name || "Not provided"}
Skills: ${skills || "Not provided"}
Education: ${education || "Not provided"}
Experience: ${experience || "Not provided"}
Summary: ${summary || "Not provided"}

Return ONLY valid JSON in this exact structure:

{
  "jobRoles": ["role 1", "role 2", "role 3"],
  "searchQueries": ["query 1", "query 2", "query 3"],
  "reason": "Short explanation of why these roles fit the candidate."
}

Rules:
- Suggest realistic roles based only on the provided information.
- Do not invent skills or experience.
- Prefer specific job titles.
- Maximum 5 job roles.
- Maximum 5 search queries.
- Search queries should be useful for finding real jobs.
`;

    const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const analysis = JSON.parse(response.text);

    // ========================================
    // STEP 2: SEARCH JOBS USING GEMINI QUERIES
    // ========================================

    const allJobs = [];

    for (const query of analysis.searchQueries || []) {
      try {
        const apiParams = new URLSearchParams();

        apiParams.append("q", query);
        apiParams.append("limit", "10");
        apiParams.append("sort", "recent");

        const apiUrl =
          `https://himalayas.app/jobs/api/search?${apiParams.toString()}`;

        console.log("🔎 AI Job Search:", query);

        const jobResponse = await fetch(apiUrl);

        if (!jobResponse.ok) {
          console.log(
            `⚠️ Himalayas returned ${jobResponse.status} for query: ${query}`
          );
          continue;
        }

        const jobData = await jobResponse.json();

        const jobs = (jobData.jobs || []).map(job => ({
          title: job.title,
          company: job.companyName,
          location:
            job.locationRestrictions &&
            job.locationRestrictions.length > 0
              ? job.locationRestrictions.join(", ")
              : "Remote",
          jobType: job.employmentType,
          experience:
            job.seniority && job.seniority.length > 0
              ? job.seniority[0]
              : "Not specified",
          salary:
            job.minSalary && job.maxSalary
              ? `${job.currency} ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()} ${job.salaryPeriod}`
              : "Not disclosed",
          description:
            job.excerpt ||
            job.description?.replace(/<[^>]*>/g, "").substring(0, 200) +
              "...",
          skills: job.categories || [],
          applyUrl: job.applicationLink,
          postedDate: job.pubDate,
          originalUrl: job.applicationLink
        }));

        allJobs.push(...jobs);

      } catch (error) {
        console.error(
          `❌ Job search failed for "${query}":`,
          error.message
        );
      }
    }

    // ========================================
    // STEP 3: REMOVE DUPLICATE JOBS
    // ========================================

    const uniqueJobs = Array.from(
      new Map(
        allJobs.map(job => [
          `${job.title}-${job.company}-${job.applyUrl}`,
          job
        ])
      ).values()
    );

    // ========================================
    // STEP 4: LIMIT RESULTS
    // ========================================

    const recommendedJobs = uniqueJobs.slice(0, 10);
    const jobsForMatching = uniqueJobs.slice(0, 10);

const matchingPrompt = `
You are an expert recruitment matching AI.

Match the candidate against these jobs.

Candidate:
Skills: ${skills || "Not provided"}
Education: ${education || "Not provided"}
Experience: ${experience || "Not provided"}
Summary: ${summary || "Not provided"}

Jobs:
${jobsForMatching.map((job, index) => `
JOB ${index + 1}
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Experience: ${job.experience}
Skills: ${(job.skills || []).join(", ")}
Description: ${job.description || "Not provided"}
`).join("\n")}

Return ONLY valid JSON in this exact structure:

{
  "matches": [
    {
      "jobIndex": 1,
      "matchPercentage": 95,
      "reason": "Short explanation."
    }
  ]
}

Rules:
- jobIndex must match the JOB number.
- matchPercentage must be between 0 and 100.
- Do not invent candidate skills or experience.
- Consider skills, education, experience and summary.
- Rank the strongest matches first.
- Include every provided job exactly once.
`;

const matchingResponse = await ai.models.generateContent({
  model: "gemini-3.5-flash-lite",
  contents: matchingPrompt,
  config: {
    responseMimeType: "application/json"
  }
});

const matchingResult = JSON.parse(matchingResponse.text);

const matchedJobs = (matchingResult.matches || [])
  .map(match => {
    const job = jobsForMatching[match.jobIndex - 1];

    if (!job) return null;

    return {
      ...job,
      matchPercentage: Math.max(
        0,
        Math.min(100, Number(match.matchPercentage) || 0)
      ),
      matchReason: match.reason || "Good match based on your resume."
    };
  })
  .filter(Boolean)
  .sort((a, b) => b.matchPercentage - a.matchPercentage)
  .slice(0, 5);

    // ========================================
    // FINAL RESPONSE
    // ========================================

    res.json({
      success: true,
      analysis: {
        jobRoles: analysis.jobRoles || [],
        searchQueries: analysis.searchQueries || [],
        reason: analysis.reason || ""
      },
      jobs: matchedJobs
    });

  } catch (error) {
    console.error("❌ Gemini AI job recommendation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate AI job recommendations",
      error: error.message
    });
  }
});

module.exports = router;