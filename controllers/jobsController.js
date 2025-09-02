// controllers/jobsController.js

const mockJobs = [
  { id: 1, title: "Frontend Developer", company: "Tech Corp", location: "Remote", skills: ["HTML", "CSS", "JavaScript"] },
  { id: 2, title: "Backend Engineer", company: "CodeWorks", location: "Bangalore", skills: ["Node.js", "Express", "MongoDB"] },
  { id: 3, title: "Full Stack Developer", company: "StartUpX", location: "Noida", skills: ["React", "Node.js", "SQL"] }
];

exports.searchJobs = (req, res) => {
  try {
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ error: "Skills must be provided as an array" });
    }

    const matchedJobs = mockJobs.filter(job =>
      job.skills.some(skill => skills.includes(skill))
    );

    res.status(200).json({ jobs: matchedJobs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};
