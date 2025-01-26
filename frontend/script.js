document.getElementById("claimForm").addEventListener("submit", async function (e) {
        e.preventDefault(); // Prevent default form submission

        // Collect form data
        const formData = new FormData();
        formData.append("name", document.getElementById("name").value);
        formData.append("email", document.getElementById("email").value);
        formData.append("policy", document.getElementById("policy").value);
        formData.append("damage", document.getElementById("damage").value);
        formData.append("estimated_value", document.getElementById("estimated-value").value);

        const fileInput = document.getElementById("proof");
        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append("proof", fileInput.files[i]); // Append multiple files
        }

        try {
            // Send request to backend
            const response = await fetch("/submit-claim", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                alert("Claim submitted successfully!");
            } else {
                alert("Error submitting claim. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Network error. Please try again.");
        }
    });
