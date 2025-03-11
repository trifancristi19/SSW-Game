// Fetch and display results from the backend
async function fetchResults() {
    try {
      const response = await fetch('http://172.20.10.2:3000/results');
      const results = await response.json();
      const container = document.getElementById('results-container');
  
      // Clear the container
      container.innerHTML = '';
  
      // Add results to the container
      results.forEach((result, index) => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result';
        resultDiv.innerHTML = `
          <p><strong>Result #${index + 1}</strong></p>
          <p><strong>Date:</strong> ${new Date(result.timestamp).toLocaleString()}</p>
          <p><strong>Score:</strong> ${result.score} / ${result.total}</p>
        `;
        container.appendChild(resultDiv);
      });
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  }
  
  // Print the results
  function printResults() {
    window.print();
  }
  
  // Fetch results on load
  fetchResults();
  