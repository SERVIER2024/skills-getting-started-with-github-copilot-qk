document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      
      // Clear existing dropdown options except the first one
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create activity title
        const title = document.createElement("h4");
        title.textContent = name;
        activityCard.appendChild(title);

        // Create description
        const desc = document.createElement("p");
        desc.textContent = details.description;
        activityCard.appendChild(desc);

        // Create schedule
        const schedule = document.createElement("p");
        const scheduleStrong = document.createElement("strong");
        scheduleStrong.textContent = "Schedule:";
        schedule.appendChild(scheduleStrong);
        schedule.appendChild(document.createTextNode(" " + details.schedule));
        activityCard.appendChild(schedule);

        // Create availability
        const availability = document.createElement("p");
        const availStrong = document.createElement("strong");
        availStrong.textContent = "Availability:";
        availability.appendChild(availStrong);
        availability.appendChild(document.createTextNode(" " + spotsLeft + " spots left"));
        activityCard.appendChild(availability);

        // Build participants list
        if (details.participants.length > 0) {
          const participantsTitle = document.createElement("p");
          const titleStrong = document.createElement("strong");
          titleStrong.textContent = "Participants:";
          participantsTitle.appendChild(titleStrong);
          activityCard.appendChild(participantsTitle);

          const participantsList = document.createElement("ul");
          participantsList.className = "participants-list";

          details.participants.forEach(email => {
            const li = document.createElement("li");
            li.textContent = email + " ";

            const unregisterBtn = document.createElement("button");
            unregisterBtn.className = "unregister-btn";
            unregisterBtn.textContent = "取消注册";
            unregisterBtn.setAttribute("data-activity", name);
            unregisterBtn.setAttribute("data-email", email);

            li.appendChild(unregisterBtn);
            participantsList.appendChild(li);
          });

          activityCard.appendChild(participantsList);
        }

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Handle unregister button clicks using event delegation
  activitiesList.addEventListener("click", async (event) => {
    if (event.target.classList.contains("unregister-btn")) {
      const activity = event.target.getAttribute("data-activity");
      const email = event.target.getAttribute("data-email");

      try {
        const response = await fetch(
          `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
          {
            method: "DELETE",
          }
        );

        const result = await response.json();

        if (response.ok) {
          messageDiv.textContent = result.message;
          messageDiv.className = "success";
          // Refresh activities list to show updated participants
          fetchActivities();
        } else {
          messageDiv.textContent = result.detail || "An error occurred";
          messageDiv.className = "error";
        }

        messageDiv.classList.remove("hidden");

        // Hide message after 5 seconds
        setTimeout(() => {
          messageDiv.classList.add("hidden");
        }, 5000);
      } catch (error) {
        messageDiv.textContent = "Failed to unregister. Please try again.";
        messageDiv.className = "error";
        messageDiv.classList.remove("hidden");
        console.error("Error unregistering:", error);
      }
    }
  });

  // Initialize app
  fetchActivities();
});
