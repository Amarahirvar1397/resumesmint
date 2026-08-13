document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("job-form");
  const results = document.getElementById("job-results");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    results.innerHTML = '<li class="loading">Searching jobs...</li>';

    try {
      // Get all form values
      const formData = new FormData(form);
      const skills = formData.get("skills");
      const location = formData.get("location") || "";
      const experience = formData.get("experience") || "";
      const job_type = formData.get("job_type") || "";
      const salary_min = formData.get("salary_min") || "";
      const salary_max = formData.get("salary_max") || "";
      const industry = formData.get("industry") || "";

      // Send all params to backend
      const res = await fetch(
        `/api/jobs?skills=${encodeURIComponent(skills)}&location=${encodeURIComponent(location)}&experience=${encodeURIComponent(experience)}&job_type=${encodeURIComponent(job_type)}&salary_min=${encodeURIComponent(salary_min)}&salary_max=${encodeURIComponent(salary_max)}&industry=${encodeURIComponent(industry)}`
      );

      const data = await res.json();
      console.log("Jobs API Response:", data);

      results.innerHTML = "";

      // Handle response structure from new API
      const jobs = data.jobs || [];

      if (jobs.length === 0) {
        results.innerHTML = '<li class="no-results">No jobs found.</li>';
        return;
      }

      // Check application status for all jobs
      const jobIds = jobs.map(job => job.applyUrl); // Using applyUrl as unique ID
      const applicationChecks = await Promise.all(
        jobIds.map(jobId => 
          fetch(`/api/applications/check/${encodeURIComponent(jobId)}`)
            .then(res => res.json())
            .catch(() => ({ applied: false }))
        )
      );

      jobs.slice(0, 10).forEach((job, index) => {
        const li = document.createElement("li");
        const isApplied = applicationChecks[index]?.applied;
        
        li.innerHTML = `
          <a href="${job.applyUrl}" class="job-link" target="_blank">${job.title}</a>
          <span class="company">${job.company || "Unknown Company"}</span>
          <button class="apply-btn ${isApplied ? 'applied' : ''}" 
                  onclick="${isApplied ? '' : `applyToJob('${encodeURIComponent(JSON.stringify(job))}', this)`}"
                  ${isApplied ? 'disabled' : ''}>
            ${isApplied ? 'Applied' : 'Apply'}
          </button>
        `;
        results.appendChild(li);
      });
    } catch (err) {
      results.innerHTML = '<li class="error">Error fetching jobs.</li>';
      console.error(err);
    }
  });
});

// Function to apply to a job
async function applyToJob(jobString, button) {
  try {
    const job = JSON.parse(decodeURIComponent(jobString));
    
    // Disable button and show loading
    button.disabled = true;
    button.textContent = 'Applying...';
    
    // Create application
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobId: job.applyUrl,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        jobType: job.jobType,
        salary: job.salary,
        applyUrl: job.applyUrl
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Success - update button and redirect
      button.textContent = 'Applied';
      button.classList.add('applied');
      
      // Redirect to job application page
      setTimeout(() => {
        window.open(job.applyUrl, '_blank');
      }, 500);
    } else {
      // Error - restore button
      button.disabled = false;
      button.textContent = 'Apply';
      alert(data.message || 'Failed to apply. Please try again.');
    }
  } catch (error) {
    console.error('Error applying to job:', error);
    button.disabled = false;
    button.textContent = 'Apply';
    alert('Failed to apply. Please try again.');
  }
}
