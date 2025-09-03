document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("job-form");
  const results = document.getElementById("job-results");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    results.innerHTML = '<li class="loading">Searching jobs...</li>';

    const formData = new FormData(form);
    const skills = formData.get("skills");
    const location = formData.get("location") || "remote";

  try {
  // ✅ Saare form values le lo
  const formData = new FormData(form);
  const skills = formData.get("skills");
  const location = formData.get("location") || "";
  const experience = formData.get("experience") || "";
  const job_type = formData.get("job_type") || "";
  const salary_min = formData.get("salary_min") || "";
  const salary_max = formData.get("salary_max") || "";
  const industry = formData.get("industry") || "";

  // ✅ Saare params backend ko bhej do
  const res = await fetch(
    `/api/jobs?skills=${encodeURIComponent(skills)}&location=${encodeURIComponent(location)}&experience=${encodeURIComponent(experience)}&job_type=${encodeURIComponent(job_type)}&salary_min=${encodeURIComponent(salary_min)}&salary_max=${encodeURIComponent(salary_max)}&industry=${encodeURIComponent(industry)}`
  );

  const data = await res.json();
  console.log("Jobs API Response:", data);

  results.innerHTML = "";

  // ✅ Agar array mila to use karo, otherwise data.data
  const jobs = Array.isArray(data) ? data : data?.data || [];

  if (jobs.length === 0) {
    results.innerHTML = '<li class="no-results">No jobs found.</li>';
    return;
  }

  jobs.slice(0, 10).forEach((job) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <a href="${job.job_apply_link}" class="job-link" target="_blank">${job.job_title}</a>
      <span class="company">${job.employer_name || "Unknown Company"}</span>
      <button class="apply-btn" onclick="window.open('${job.job_apply_link}', '_blank')">Apply</button>
    `;
    results.appendChild(li);
  });
} catch (err) {
  results.innerHTML = '<li class="error">Error fetching jobs.</li>';
  console.error(err);
}

  });
});
