
const targetUrl = "https://berinia.com";
const apiUrl = "http://localhost:3000/api/generate";

console.log(`Testing API at ${apiUrl} with target: ${targetUrl}`);

async function runTest() {
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: targetUrl })
        });

        const status = response.status;
        const data = await response.json();

        console.log("Response Status:", status);
        console.log("Response Data:", JSON.stringify(data, null, 2));

        if (status === 200 && data.status === 'success') {
            console.log("\n✅ SUCCESS: Preview generated successfully!");
            console.log("Preview Link:", data.previewUrl);
            console.log("Retell Agent ID:", data.agentId);
        } else {
            console.error("\n❌ FAILED: API returned error.");
        }

    } catch (error) {
        console.error("\n❌ FAILED: Network/Script error", error);
    }
}

runTest();
