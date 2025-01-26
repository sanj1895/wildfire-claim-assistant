document.getElementById("trackForm").addEventListener("submit", async function(event) {
    event.preventDefault();  

    const email = document.getElementById("track-email").value;
    const claimResult = document.getElementById("claimResult");
    claimResult.innerHTML = "";  

    try {
        console.log("Fetching claims for email:", email);  

        const response = await fetch(`http://localhost:5001/claims?email=${email}`);

        console.log("Response Status:", response.status);  

        if (!response.ok) {
            claimResult.innerHTML = `<p>Error: Unable to fetch claims</p>`;
            return;
        }

        const data = await response.json();

        if (data.length > 0) {
            claimResult.innerHTML = `<h3>Your Claim Status:</h3>`;
            data.forEach(claim => {
                claimResult.innerHTML += `
                    <p><strong>Name:</strong> ${claim.name}</p>
                    <p><strong>Policy Number:</strong> ${claim.policy}</p>
                    <p><strong>Damage Reported:</strong> ${claim.damage}</p>
                    <p><strong>Estimated Loss:</strong> $${claim.estimatedValue}</p>
                    <p><strong>Uploaded File:</strong> 
                        ${claim.file ? `<a href="/uploads/${claim.file}" target="_blank">Download File</a>` : 'No file uploaded.'}</p>
                    <p><strong>Submitted On:</strong> ${claim.createdAt}</p>
                    <hr>
                `;
            });
        } else {
            claimResult.innerHTML = "<p>No claims found for this email.</p>";
        }

    } catch (error) {
        console.error("Error during fetch:", error);  
        claimResult.innerHTML = `<p>Error: ${error.message}</p>`;
    }
});
