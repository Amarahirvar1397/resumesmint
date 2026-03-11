// controllers/resumeController.js

// In-memory resumes (replace with DB later)
let resumes = [];

exports.saveResume = (req, res) => {
  try {
    const { details } = req.body;

    if (!details) {
      return res.status(400).json({ error: "Resume details are required" });
    }

    const resume = { id: resumes.length + 1, details };
    resumes.push(resume);

    res.status(201).json({ message: "Resume saved successfully", resume });
  } catch (err) {
    res.status(500).json({ error: "Failed to save resume" });
  }
};

exports.exportResume = (req, res) => {
  try {
    const { id } = req.params;
    const resume = resumes.find(r => r.id === parseInt(id));

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // For now just return JSON (later export as PDF/HTML template)
    res.status(200).json({ message: "Resume exported", resume });
  } catch (err) {
    res.status(500).json({ error: "Export failed" });
  }
};
