document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname;

  // Protected pages jahan login required hai
  const protectedPages = [
    "/create.html",
    "/fill.html",
    "/interview.html",
    "/jobs.html",
    "/templates/template-01.html",
    // yahan aur add kar sakte ho agar chahiye
  ];

  // Login status check (userLoggedIn flag se)
  const isLoggedIn = localStorage.getItem("userLoggedIn");

  if (protectedPages.includes(currentPage) && !isLoggedIn) {
    alert("Please login to access this feature.");
    localStorage.setItem("redirectAfterLogin", currentPage); // login ke baad wapas wahi bhej do
    window.location.href = "login.html";
    return; // Further execution stop karne ke liye
  }

  // 🌙 Theme toggle - Now handled by theme-system.js
  // The theme system automatically manages theme persistence across pages

  // 🚪 Logout function
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      localStorage.removeItem("userLoggedIn");  
      alert("Logged out successfully!");
      window.location.href = "index.html";
    });
  }

  // 📄 Template cards generate karna (5 templates)
  const container = document.getElementById("templateScroll");
  if (container) {
    for (let i = 1; i <= 5; i++) {
      const card = document.createElement("div");
      card.className = "template-card";

      const img = document.createElement("img");
      img.src = `assets/templates/template-${String(i).padStart(2, "0")}.png`;
      img.alt = `Template ${i}`;

      const title = document.createElement("h3");
      title.textContent = `Template ${i}`;

      const btn = document.createElement("button");
      btn.textContent = "Use Template";

      btn.addEventListener("click", () => {
        window.location.href = `fill.html?template=template-${String(i).padStart(2, "0")}`;
      });

      card.appendChild(img);
      card.appendChild(title);
      card.appendChild(btn);

      container.appendChild(card);
    }
  }

  // Login hone par Login/Signup links chhupana agar user already logged in ho
  if (isLoggedIn) {
    const loginLink = document.getElementById("loginLink");
    const signupLink = document.getElementById("signupLink");
    const authModal = document.getElementById("authModal");
    const siteContent = document.getElementById("siteContent");
    
    if (loginLink) loginLink.style.display = "none";
    if (signupLink) signupLink.style.display = "none";
    
    // If user is already logged in, show main content
    if (authModal) authModal.style.display = "none";
    if (siteContent) siteContent.style.display = "block";
    
    // Show user welcome message
    showUserWelcome();
  }
});

// ================== 🎯 SHOW USER WELCOME MESSAGE ==================
function showUserWelcome() {
  const userWelcome = document.getElementById("userWelcome");
  const userDisplayName = document.getElementById("userDisplayName");
  
  if (userWelcome && userDisplayName) {
    // Get user info from localStorage
    const userInfo = localStorage.getItem("userInfo");
    
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        userDisplayName.textContent = user.username || "User";
        userWelcome.style.display = "flex";
      } catch (error) {
        console.error("Error parsing user info:", error);
        // Fallback: try to get username from other sources
        const token = localStorage.getItem("token");
        if (token) {
          userDisplayName.textContent = "User";
          userWelcome.style.display = "flex";
        }
      }
    } else {
      // Fallback: show generic welcome
      userDisplayName.textContent = "User";
      userWelcome.style.display = "flex";
    }
  }
}

// ================== ✍️ SIGNUP ==================
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const formData = Object.fromEntries(new FormData(e.target));
      console.log("📝 Sending signup data:", formData);
      
      const res = await fetch("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      console.log("📝 Signup response:", data);
      
      if (res.ok) {
        // Check if email was sent successfully
        if (data.note && data.note.includes("sent to your email")) {
          alert(data.msg + "\n\n📧 Please check your email for OTP!");
        } else if (data.otp) {
          // Fallback: Show OTP if email failed
          alert(data.msg + "\n\nOTP: " + data.otp);
        } else {
          alert(data.msg);
        }
        
        // Auto-populate email for OTP verification
        const otpEmailHidden = document.getElementById("otpEmailHidden");
        const otpEmailText = document.getElementById("otpEmailText");
        
        if (otpEmailHidden && otpEmailText) {
          otpEmailHidden.value = formData.email;
          otpEmailText.textContent = formData.email;
        }
        
        // Show OTP form for verification
        signupForm.style.display = "none";
        const otpForm = document.getElementById("otpForm");
        if (otpForm) otpForm.style.display = "block";
      } else {
        alert(data.error || data.msg || "Signup failed");
      }
    } catch (error) {
      console.error("❌ Signup error:", error);
      alert("Network error. Please try again.");
    }
  });
}

// ================== 🔑 OTP VERIFY (Signup Only) ==================
const otpForm = document.getElementById("otpForm");
if (otpForm) {
  otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const formData = Object.fromEntries(new FormData(e.target));
      console.log("🔑 Sending OTP verification:", formData);
      
      const res = await fetch("/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log("🔑 OTP verification response:", data);
      
      if (res.ok) {
        // User is now automatically logged in!
        localStorage.setItem("userLoggedIn", true);
        localStorage.setItem("token", data.token);
        
        // Store user info if needed
        if (data.user) {
          localStorage.setItem("userInfo", JSON.stringify(data.user));
        }

        alert("🎉 Welcome to resumesmint! You are now logged in!");

        // Hide auth modal and show main content
        const authModal = document.getElementById("authModal");
        const siteContent = document.getElementById("siteContent");
        
        if (authModal) authModal.style.display = "none";
        if (siteContent) siteContent.style.display = "block";
        
        // Show user welcome message
        showUserWelcome();
        
        // Optional: Redirect to main page or stay on current page
        const redirectPage = localStorage.getItem("redirectAfterLogin") || "index.html";
        localStorage.removeItem("redirectAfterLogin");
        
        // Small delay to show success message
        setTimeout(() => {
          window.location.href = redirectPage;
        }, 1000);
      } else {
        alert(data.error || data.msg || "OTP verification failed");
      }
    } catch (error) {
      console.error("❌ OTP verification error:", error);
      alert("Network error. Please try again.");
    }
  });
}

// ================== 🔓 LOGIN (Email Based) ==================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const formData = Object.fromEntries(new FormData(e.target));
      console.log("🔑 Sending login data:", formData);
      
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log("🔑 Login response:", data);
      
      if (res.ok) {
        alert(data.msg || "Login successful!");
        localStorage.setItem("userLoggedIn", true);
        if (data.token) localStorage.setItem("token", data.token);
        if (data.user) localStorage.setItem("userInfo", JSON.stringify(data.user));

        // Hide auth modal and show main content
        const authModal = document.getElementById("authModal");
        const siteContent = document.getElementById("siteContent");
        
        if (authModal) authModal.style.display = "none";
        if (siteContent) siteContent.style.display = "block";
        
        // Show user welcome message
        showUserWelcome();
        
        // Optional: Redirect to main page
        const redirectPage = localStorage.getItem("redirectAfterLogin") || "index.html";
        localStorage.removeItem("redirectAfterLogin");
        window.location.href = redirectPage;
      } else {
        alert(data.error || data.msg || "Login failed");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      alert("Network error. Please try again.");
    }
  });
}

// ================== 🔑 FORGOT PASSWORD ==================
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const backToLoginLink = document.getElementById("backToLoginLink");

if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.style.display = "none";
    forgotPasswordForm.style.display = "block";
  });
}

if (backToLoginLink) {
  backToLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    forgotPasswordForm.style.display = "none";
    loginForm.style.display = "block";
  });
}

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const formData = Object.fromEntries(new FormData(e.target));
      console.log("🔑 Sending forgot password request:", formData);
      
      const res = await fetch("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log("🔑 Forgot password response:", data);
      
      if (res.ok) {
        alert(data.msg + "\n\n📧 Please check your email for reset OTP!");
        
        // Auto-populate email for reset OTP verification
        const resetEmailHidden = document.getElementById("resetEmailHidden");
        const resetEmailText = document.getElementById("resetEmailText");
        
        if (resetEmailHidden && resetEmailText) {
          resetEmailHidden.value = formData.email;
          resetEmailText.textContent = formData.email;
        }
        
        // Show reset OTP form
        forgotPasswordForm.style.display = "none";
        const resetOtpForm = document.getElementById("resetOtpForm");
        if (resetOtpForm) resetOtpForm.style.display = "block";
      } else {
        alert(data.error || data.msg || "Reset request failed");
      }
    } catch (error) {
      console.error("❌ Forgot password error:", error);
      alert("Network error. Please try again.");
    }
  });
}

// ================== 🔄 PASSWORD RESET OTP ==================
const resetOtpForm = document.getElementById("resetOtpForm");
if (resetOtpForm) {
  resetOtpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const formData = Object.fromEntries(new FormData(e.target));
      
      // Check if passwords match
      if (formData.newPassword !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      
      console.log("🔄 Sending password reset:", formData);
      
      const res = await fetch("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword
        }),
      });
      const data = await res.json();
      console.log("🔄 Password reset response:", data);
      
      if (res.ok) {
        alert("🎉 Password reset successful! Please login with your new password.");
        
        // Go back to login form
        resetOtpForm.style.display = "none";
        loginForm.style.display = "block";
        
        // Clear the login form
        loginForm.reset();
      } else {
        alert(data.error || data.msg || "Password reset failed");
      }
    } catch (error) {
      console.error("❌ Password reset error:", error);
      alert("Network error. Please try again.");
    }
  });
}