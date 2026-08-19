// -------------------- Template & Form Setup --------------------
const params = new URLSearchParams(window.location.search);
let templateNum = params.get("template") || "template-01";

const previewFrame = document.getElementById("previewFrame");
const form = document.getElementById("resumeForm");

// Keep track of whether user has changed color
let userHasChangedColor = false;
let currentTemplateColor = "#2b6cb0"; // Default color

// Job fetching variables
let jobFetchTimeout = null;
const JOB_FETCH_DELAY = 800; // milliseconds to debounce

// Iframe load
previewFrame.src = `./templates/${templateNum}.html`;
previewFrame.onload = () => {
  // Don't apply any color changes on load - keep template default
  updatePreview();

  // Update preview on input
  form.addEventListener("input", updatePreview);
  document.getElementById("photo").addEventListener("change", updatePreview);

  // Add skill change listener for job fetching
  const skillsInput = document.getElementById("skills");
  if (skillsInput) {
    skillsInput.addEventListener("input", handleSkillsChange);
  }
};

// -------------------- Update Preview Function --------------------
function updatePreview() {
  const frameDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
  if (!frameDoc) return;

  // ✅ Universal mapping (ek input ke liye multiple possible IDs/Classes)
  const mappings = {
    name: ["user-name", "username", "name"],
    email: ["user-email", "email"],
    phone: ["user-phone", "phone"],
    address: ["user-address", "address"],
    postal: ["user-postal", "postal", "zipcode"],
    dob: ["user-dob", "dob", "birthdate"],
    nationality: ["user-nationality", "nationality"],
    skills: ["user-skills", "skills"],
    education: ["user-education", "education"],
    experience: ["user-experience", "experience"],
    languages: ["user-languages", "languages"],
    hobbies: ["user-hobbies", "hobbies"],
    summary: ["user-summary", "summary", "summary"], // ⚡ "Summary" key small-case किया
    linkedin: ["user-linkedin", "linkedin"]
  };

// Saare fields update karo
for (let id in mappings) {
  const inputEl = document.getElementById(id);
  if (!inputEl) continue;

  const value = inputEl.value.trim();

  // Multiple selectors try karo (id ya class dono)
  mappings[id].forEach(selectorId => {
    const target =
      frameDoc.getElementById(selectorId) ||
      frameDoc.querySelector(`.${selectorId}`);
    if (target) target.innerText = value || "—";
  });
}


  // ✅ Photo upload handle
  const photoInput = document.getElementById("photo");
  if (photoInput?.files?.[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      const imgCandidates = ["user-photo", "photo", "profile-pic"];
      imgCandidates.forEach(id => {
        const imgTag = frameDoc.getElementById(id);
        if (imgTag) imgTag.src = e.target.result;
      });
    };
    reader.readAsDataURL(photoInput.files[0]);
  }
}

// -------------------- Download Resume as PDF --------------------


document.getElementById("downloadBtn").addEventListener("click", () => {
  const frame = document.getElementById("previewFrame");
  const frameDoc = frame.contentDocument || frame.contentWindow.document;
  if (!frameDoc) return alert("Preview not loaded!");

  // ✅ Get the actual content from iframe body
  const frameBody = frameDoc.body;
  if (!frameBody) return alert("Template content not found!");

  // ✅ Create a clean wrapper for PDF
  const wrapperHTML = document.createElement("html");
  const head = document.createElement("head");
  const body = document.createElement("body");
  
  // ✅ Set proper viewport and styling for PDF
  head.innerHTML = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      * { box-sizing: border-box; }
      html, body { 
        margin: 0; 
        padding: 0; 
        width: 100%; 
        height: auto;
        font-family: Arial, sans-serif;
      }
      body {
        background: white !important;
        overflow: visible !important;
      }
    </style>
  `;

  wrapperHTML.appendChild(head);
  wrapperHTML.appendChild(body);

  // ✅ Copy all CSS from iframe and apply custom color
  const customColor = document.getElementById("templateColor").value;
  
  frameDoc.querySelectorAll("link[rel='stylesheet'], style").forEach(styleEl => {
    let newStyle;
    if (styleEl.tagName.toLowerCase() === "link") {
      newStyle = document.createElement("link");
      newStyle.rel = "stylesheet";
      newStyle.href = styleEl.href;
    } else {
      newStyle = document.createElement("style");
      newStyle.textContent = styleEl.textContent;
    }
    head.appendChild(newStyle);
  });
  
  // ✅ Add custom color override for PDF only if user has changed color
  const colorOverride = document.createElement("style");
  if (userHasChangedColor) {
    // Use user's selected color
    colorOverride.textContent = `
      :root { --main-color: ${currentTemplateColor} !important; }
      header { background: ${currentTemplateColor} !important; }
      h2 { color: ${currentTemplateColor} !important; border-bottom-color: ${currentTemplateColor} !important; }
      .sidebar { background: ${currentTemplateColor} !important; }
      .accent-color { color: ${currentTemplateColor} !important; }
      .border-accent { border-color: ${currentTemplateColor} !important; }
    `;
  } else {
    // Keep template's original default color
    colorOverride.textContent = `
      :root { --main-color: #2b6cb0 !important; }
      header { background: #2b6cb0 !important; }
      h2 { color: #2b6cb0 !important; border-bottom-color: #2b6cb0 !important; }
      .sidebar { background: #2b6cb0 !important; }
      .accent-color { color: #2b6cb0 !important; }
      .border-accent { border-color: #2b6cb0 !important; }
    `;
  }
  head.appendChild(colorOverride);

  // ✅ Clone the entire body content properly
  const clonedContent = frameBody.cloneNode(true);
  body.appendChild(clonedContent);

  // ✅ Fix any layout issues
  body.style.width = "100%";
  body.style.maxWidth = "none";
  body.style.overflow = "visible";
  body.style.position = "relative";

  // ✅ Profile photo fix
  const imgs = body.querySelectorAll("img");
  imgs.forEach(img => {
    if (
      img.id === "user-photo" ||
      img.id === "photo" ||
      img.id === "profile-pic"
    ) {
      img.style.maxWidth = "120px";
      img.style.maxHeight = "120px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "50%";
    }
  });

  // 🔥 Template-specific fixes
  if (frame.src.includes("template-02")) {
    const resumeWrapper = body.querySelector(".resume");
    if (resumeWrapper) {
      resumeWrapper.style.display = "flex";
      resumeWrapper.style.flexDirection = "row";
      resumeWrapper.style.width = "100%";
      resumeWrapper.style.gap = "20px";
      resumeWrapper.style.maxWidth = "none";
    }

    const aside = body.querySelector("aside");
    const main = body.querySelector("main");

    if (aside) {
      aside.style.width = "30%";
      aside.style.flexShrink = "0";
      aside.style.minWidth = "250px";
    }
    if (main) {
      main.style.width = "70%";
      main.style.display = "flex";
      main.style.flexDirection = "column";
      main.style.gap = "10px";
    }
  }

  // ✅ Fix any containers that might be causing layout issues
  const allElements = body.querySelectorAll("*");
  allElements.forEach(el => {
    const computedStyle = window.getComputedStyle(el);
    if (computedStyle.position === "fixed" || computedStyle.position === "absolute") {
      el.style.position = "relative";
    }
  });

  // ✅ Improved PDF Options
  const opt = {
    margin: [10, 10, 10, 10],
    filename: "my_resume.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      width: 794,  // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      windowWidth: 794,
      windowHeight: 1123
    },
    jsPDF: { 
      unit: "pt", 
      format: "a4", 
      orientation: "portrait",
      compress: true
    },
    pagebreak: { 
      mode: ["avoid-all", "css", "legacy"],
      before: ".page-break-before",
      after: ".page-break-after"
    }
  };

  // ✅ Generate PDF with better error handling
  html2pdf()
    .set(opt)
    .from(wrapperHTML)
    .save()
    .catch(err => {
      console.error("PDF generation failed:", err);
      alert("PDF generation failed. Please try again.");
    });
});






// -------------------- Apply Color to Template Function --------------------
function applyColorToTemplate(color) {
  const frameDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
  if (!frameDoc) return;

  frameDoc.documentElement.style.setProperty('--main-color', color);
  currentTemplateColor = color;
}

// -------------------- Color Picker --------------------
const colorPicker = document.getElementById("templateColor");
colorPicker.addEventListener("input", () => {
  const color = colorPicker.value;
  userHasChangedColor = true; // Mark that user has actively changed color
  applyColorToTemplate(color);
});

// -------------------- Job Fetching Functions --------------------

// Debounced skill change handler
function handleSkillsChange() {
  const skillsInput = document.getElementById("skills");
  const skills = skillsInput.value.trim();

  // Clear previous timeout
  if (jobFetchTimeout) {
    clearTimeout(jobFetchTimeout);
  }

  // Don't fetch if skills are empty
  if (!skills) {
    showJobsMessage("Add your skills to see relevant jobs.");
    return;
  }

  // Set new timeout for debounced fetch
  jobFetchTimeout = setTimeout(() => {
    fetchJobsForSkills(skills);
  }, JOB_FETCH_DELAY);
}

// Fetch jobs based on skills
async function fetchJobsForSkills(skills) {
  const jobsContent = document.getElementById("jobs-content");
  
  // Show loading state
  jobsContent.innerHTML = '<div class="jobs-loading">Finding jobs for you...</div>';

  try {
    // Reuse existing job search API
    const response = await fetch(`/api/jobs?skills=${encodeURIComponent(skills)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch jobs");
    }

    const jobs = data.jobs || [];

    if (jobs.length === 0) {
      showJobsMessage("No matching jobs found. Try adding more skills.");
      return;
    }

    // Display jobs
    displayJobs(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    jobsContent.innerHTML = `
      <div class="jobs-error">
        Failed to load jobs. Please try again later.
      </div>
    `;
  }
}

// Display jobs in the jobs section
function displayJobs(jobs) {
  const jobsContent = document.getElementById("jobs-content");
  
  // Limit to 5 jobs to avoid overwhelming the UI
  const jobsToShow = jobs.slice(0, 5);
  
  const jobsHTML = jobsToShow.map(job => `
    <div class="job-card">
      <div class="job-title">${escapeHtml(job.title)}</div>
      <div class="job-company">${escapeHtml(job.company || 'Unknown Company')}</div>
      <div class="job-location">${escapeHtml(job.location || 'Remote')}</div>
      ${job.skills && job.skills.length > 0 ? `
        <div class="job-skills">
          ${job.skills.slice(0, 4).map(skill => `
            <span class="job-skill-tag">${escapeHtml(skill)}</span>
          `).join('')}
        </div>
      ` : ''}
      <button class="job-view-btn" onclick="applyToJobFromResume('${encodeURIComponent(JSON.stringify(job))}', this)">
        Apply Job
      </button>
    </div>
  `).join('');

  jobsContent.innerHTML = jobsHTML;
}

// Show a message in the jobs section
function showJobsMessage(message) {
  const jobsContent = document.getElementById("jobs-content");
  jobsContent.innerHTML = `<div class="jobs-message">${message}</div>`;
}

// Helper function to escape HTML to prevent XSS
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Function to apply to a job from resume builder
async function applyToJobFromResume(jobString, button) {
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
      // Success - update button
      button.textContent = 'Applied';
      button.classList.add('applied');
      button.style.background = '#10b981';
      
      // Show success message
      alert('Application saved successfully! You can view it in My Applications section.');
      
      // Redirect to job application page after a short delay
      setTimeout(() => {
        window.open(job.applyUrl, '_blank');
      }, 1000);
    } else {
      // Error - restore button
      button.disabled = false;
      button.textContent = 'Apply Job';
      alert(data.message || 'Failed to apply. Please try again.');
    }
  } catch (error) {
    console.error('Error applying to job:', error);
    button.disabled = false;
    button.textContent = 'Apply Job';
    alert('Failed to apply. Please try again.');
  }
}
