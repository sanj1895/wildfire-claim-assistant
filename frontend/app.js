document.getElementById("claimForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    console.log("Submit button clicked!"); // Debugging step

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const policy = document.getElementById("policy").value;
    const damage = document.getElementById("damage").value;
    const estimatedValue = document.getElementById("estimated-value").value;
    const proof = document.getElementById("proof").files;

    console.log({ name, email, policy, damage, estimatedValue, proof });

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("policy", policy);
    formData.append("damage", damage);
    formData.append("estimatedValue", estimatedValue);
    Array.from(proof).forEach((file, index) => {
        formData.append("proof", file);
    });

    console.log("Submitting claim to backend..."); // Debugging step

    //to backend
    const response = await fetch("http://localhost:5001/submit-claim", {
        method: "POST",
        body: formData
    });

    const data = await response.json();
    console.log("Server Response:", data);

    if (response.ok) {
        document.getElementById("claimForm").style.display = "none";
        document.getElementById("thank-you-message").style.display = "block";
    } else {
        document.getElementById("message").innerHTML = "Error: " + data.error;
    }
});


document.getElementById("trackForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("track-email").value;  
    const claimResult = document.getElementById("claimResult");
    claimResult.innerHTML = ""; 

    try {
        const response = await fetch("http://localhost:5001/claims");

        //response is okay
        if (!response.ok) {
            claimResult.innerHTML = `<p>Error: Unable to fetch claims</p>`;
            return;
        }

        const data = await response.json();

        if (data.length > 0) {
            claimResult.innerHTML = `<h3>Your Claims:</h3>`;
            data.forEach(claim => {
                claimResult.innerHTML += `
                    <p><strong>Claim ID:</strong> ${claim.id}</p>
                    <p><strong>Name:</strong> ${claim.name}</p>
                    <p><strong>Policy Number:</strong> ${claim.policy}</p>
                    <p><strong>Damage Reported:</strong> ${claim.damage}</p>
                    <p><strong>Estimated Loss:</strong> $${claim.estimatedValue}</p>
                    <p><strong>Submitted On:</strong> ${claim.createdAt}</p>
                    
                    <!-- Download PDF Link -->
                    <p><strong>Download Claim PDF:</strong> 
                        <a href="http://localhost:5001/download-claim?email=${claim.email}&claimId=${claim.id}" target="_blank">
                            Download PDF
                        </a>
                    </p>
                    <hr>
                `;
            });
        } else {
            claimResult.innerHTML = "<p>No claims found for this email.</p>";
        }

    } catch (error) {
        //any errors from fetch request
        claimResult.innerHTML = `<p>Error: ${error.message}</p>`;
    }
});




async function fetchFireAlerts() {
    const response = await fetch("https://api.publicalerts.io/fire"); // Example API for fire alerts
    const data = await response.json();

    if (data.alerts && data.alerts.length > 0) {
        document.getElementById("fire-alert").innerText = data.alerts[0].message;
    } else {
        document.getElementById("fire-alert").innerText = "No active fire alerts in your area.";
    }
}

// Load fire alerts on page load
fetchFireAlerts();

document.getElementById("find-shelter").addEventListener("click", function() {
    window.open("https://www.redcross.org/get-help/disaster-relief-and-recovery-services/find-an-open-shelter.html", "_blank");
});

document.getElementById("mental-health").addEventListener("click", function() {
    window.location.href = "tel:18009855900"; // Disaster Distress Helpline
});


