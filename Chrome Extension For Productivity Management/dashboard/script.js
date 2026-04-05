// Fetch data from the backend API
fetch("http://localhost:3000/api/logs?userId=123")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    if (!data.logs || data.logs.length === 0) {
      throw new Error("No logs found for the user.");
    }

    // Prepare data for Chart.js
    const labels = data.logs.map((log) => new URL(log.url).hostname); // Extract domain names
    const timeSpent = data.logs.map((log) => log.timeSpent / 60); // Convert seconds to minutes

    // Create a Chart.js pie chart
    const ctx = document.getElementById("chart").getContext("2d");
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Time Spent (minutes)",
            data: timeSpent,
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
            ],
            hoverOffset: 4,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            position: "top",
          },
        },
      },
    });
  })
  .catch((error) => {
    console.error("Error fetching or processing data:", error);
    // Display error message on the dashboard
    document.body.innerHTML += `<p style="color: red;">Error: ${error.message}</p>`;
  });
