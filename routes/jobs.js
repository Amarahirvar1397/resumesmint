const express = require("express");
const router = express.Router();

// ========================================
// GET ALL JOBS + SEARCH + FILTER
// Uses Himalayas Remote Jobs API (free, no API key required)
// ========================================
router.get("/", async (req, res) => {
  try {
    const {
      skills,
      location,
      experience,
      job_type,
      salary_min,
      salary_max,
      industry
    } = req.query;

    // Build Himalayas API query parameters
    const apiParams = new URLSearchParams();
    
    // Map skills to search query
    if (skills) {
      apiParams.append('q', skills);
    }
    
    // Map job_type to employment_type
    if (job_type) {
      const employmentTypeMap = {
        'fulltime': 'Full Time',
        'parttime': 'Part Time', 
        'contract': 'Contractor',
        'internship': 'Intern'
      };
      const mappedType = employmentTypeMap[job_type.toLowerCase()];
      if (mappedType) {
        apiParams.append('employment_type', mappedType);
      }
    }
    
    // Map experience to seniority
    if (experience) {
      const seniorityMap = {
        'entry': 'Entry-level',
        'mid': 'Mid-level',
        'senior': 'Senior'
      };
      const mappedSeniority = seniorityMap[experience.toLowerCase()];
      if (mappedSeniority) {
        apiParams.append('seniority', mappedSeniority);
      }
    }
    
    // Add default limit and sort
    apiParams.append('limit', '20');
    apiParams.append('sort', 'recent');

    // Call Himalayas API
    const apiUrl = `https://himalayas.app/jobs/api/search?${apiParams.toString()}`;
    console.log("Calling Himalayas API:", apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Himalayas API returned ${response.status}: ${response.statusText}`);
    }
    
    const apiData = await response.json();
    
    // Transform Himalayas response to match expected format
    const transformedJobs = apiData.jobs.map(job => ({
      title: job.title,
      company: job.companyName,
      location: job.locationRestrictions && job.locationRestrictions.length > 0 
        ? job.locationRestrictions.join(', ') 
        : 'Remote',
      jobType: job.employmentType,
      experience: job.seniority && job.seniority.length > 0 
        ? job.seniority[0] 
        : 'Not specified',
      salary: job.minSalary && job.maxSalary 
        ? `${job.currency} ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()} ${job.salaryPeriod}`
        : 'Not disclosed',
      description: job.excerpt || job.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
      skills: job.categories || [],
      applyUrl: job.applicationLink,
      postedDate: job.pubDate,
      originalUrl: job.applicationLink
    }));

    res.status(200).json({
      success: true,
      count: transformedJobs.length,
      jobs: transformedJobs
    });

  } catch (error) {
    console.error("❌ Error fetching jobs from Himalayas API:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs from external API",
      error: error.message
    });
  }
});


module.exports = router;