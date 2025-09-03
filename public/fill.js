// -------------------- Template & Form Setup --------------------
const params = new URLSearchParams(window.location.search);
let templateNum = params.get("template") || "template-01";

const previewFrame = document.getElementById("previewFrame");
const form = document.getElementById("resumeForm");

// Keep track of whether user has changed color
let userHasChangedColor = false;
let currentTemplateColor = "#2b6cb0"; // Default color

// Iframe load
previewFrame.src = `./templates/${templateNum}.html`;
previewFrame.onload = () => {
  // Don't apply any color changes on load - keep template default
  updatePreview();

  // Update preview on input
  form.addEventListener("input", updatePreview);
  document.getElementById("photo").addEventListener("change", updatePreview);
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
