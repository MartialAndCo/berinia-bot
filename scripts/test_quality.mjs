
const targetUrl = "https://www.retellai.com";
const apiUrl = "http://localhost:3000/api/generate";

console.log(`Testing Quality at ${apiUrl} with target: ${targetUrl}`);

async function runTest() {
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: targetUrl })
        });

        const data = await response.json();

        if (data.status === 'success') {
            console.log("\n✅ SUCCESS");
            console.log("--- GENERATED SYSTEM PROMPT ---");
            console.log("CompanyName:", data.companyName);
            console.log(JSON.stringify(data, null, 2)); // Print full data to check systemPrompt length and detail
            console.log("-------------------------------");
        } else {
            console.error("❌ FAILED:", data);
        }

    } catch (error) {
        console.error("❌ CRTICIAL:", error);
    }
}

runTest();
