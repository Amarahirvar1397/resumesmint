document.addEventListener("DOMContentLoaded", () => {
  const applicationsList = document.getElementById("applications-list");
  
  // Load applications on page load
  loadApplications();
  
  async function loadApplications() {
    try {
      const response = await fetch('/api/applications/my');
      const data = await response.json();
      
      if (response.ok) {
        displayApplications(data.applications);
      } else {
        if (response.status === 401) {
          applicationsList.innerHTML = '<li class="error">Please log in to view your applications. <a href="login.html">Click here to login</a></li>';
        } else {
          applicationsList.innerHTML = '<li class="error">Failed to load applications. Please try again.</li>';
        }
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      applicationsList.innerHTML = '<li class="error">Failed to load applications. Please try again.</li>';
    }
  }
  
  function displayApplications(applications) {
    applicationsList.innerHTML = '';
    
    if (applications.length === 0) {
      applicationsList.innerHTML = '<li class="no-applications">No applications yet. <a href="jobs.html">Start applying to jobs!</a></li>';
      return;
    }
    
    applications.forEach(application => {
      const li = document.createElement('li');
      
      // Format date
      const appliedDate = new Date(application.appliedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      // Get status class
      const statusClass = `status-${application.status.toLowerCase().replace(' ', '-')}`;
      
      li.innerHTML = `
        <div class="application-info">
          <h3><a href="${application.applyUrl}" target="_blank">${application.jobTitle}</a></h3>
          <div class="company">${application.company}</div>
          <div class="details">
            <span>📍 ${application.location}</span>
            <span>💼 ${application.jobType}</span>
            <span>💰 ${application.salary}</span>
            <span>📅 Applied: ${appliedDate}</span>
          </div>
        </div>
        <div class="application-actions">
          <span class="status-badge ${statusClass}">${application.status}</span>
          <button class="delete-btn" onclick="deleteApplication('${application._id}', this)">Delete</button>
        </div>
      `;
      
      applicationsList.appendChild(li);
    });
  }
  
  // Make deleteApplication available globally
  window.deleteApplication = async function(applicationId, button) {
    if (!confirm('Are you sure you want to delete this application?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Remove the application from the list
        const li = button.closest('li');
        li.style.opacity = '0';
        setTimeout(() => {
          li.remove();
          
          // Check if list is empty
          if (applicationsList.children.length === 0) {
            applicationsList.innerHTML = '<li class="no-applications">No applications yet. <a href="jobs.html">Start applying to jobs!</a></li>';
          }
        }, 300);
      } else {
        alert(data.message || 'Failed to delete application');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Failed to delete application. Please try again.');
    }
  };
});
