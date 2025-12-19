
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Load env vars FIRST
dotenv.config({ path: resolve(__dirname, '../.env.local') });

async function runUnitTest() {
    console.log("[UnitTest] Starting Deduplication Test...");

    // Dynamic import to ensure env vars are present
    const { POST } = await import('../src/app/api/generate/route');
    const { saveProject, createLead } = await import('../src/lib/airtable');

    try {
        // 1. Create a Lead
        console.log("[UnitTest] Creating Dummy Lead...");
        // Ensure Airtable is configured
        if (!process.env.AIRTABLE_API_KEY) {
            throw new Error("Env vars not loaded!");
        }

        const leadId = await createLead({
            firstName: "Unit",
            lastName: "Test " + Date.now(),
            companyName: "Unit Corp",
            email: "unit@test.com",
            status: "Contacted",
            source: "Test"
        });

        if (!leadId || leadId.startsWith('mock-')) throw new Error("Failed to create REAL lead (got mock mode)");
        console.log(`[UnitTest] Lead Created: ${leadId}`);

        // 2. Create an EXISTING Project for this lead (Simulate previous run)
        console.log("[UnitTest] Creating Existing Project (Seeding)...");
        const projectId = await saveProject({
            url: "https://unit-test-existing.com",
            agentId: "agent-123",
            companyName: "Unit Corp",
            knowledgeBaseSummary: "Summary",
            demoUrl: "https://demo.berinia.com/preview/EXISTING",
            recordId: leadId // This LINKS the project to the lead
        });
        console.log(`[UnitTest] Project Seedeed: ${projectId}`);

        // Wait for Airtable API consistency (optional but safe)
        await new Promise(r => setTimeout(r, 2000));

        // 3. Call POST endpoint
        console.log("[UnitTest] Calling POST API handler...");
        const req = new Request("http://localhost/api/generate", {
            method: "POST",
            body: JSON.stringify({
                url: "https://unit-test-new-request.com", // Different URL should be ignored
                recordId: leadId
            })
        });

        const res = await POST(req);
        const data = await res.json();

        console.log("[UnitTest] API Response:", JSON.stringify(data, null, 2));

        // 4. Verification
        if (data.status === 'success' && data.projectId === projectId) {
            console.log("✅ SCENARIO PASSED: Returned existing project ID!");
            if (data.previewUrl === "https://demo.berinia.com/preview/EXISTING") {
                console.log("✅ URLs match existing demo URL!");
            } else {
                console.warn("⚠️ URL mismatch:", data.previewUrl);
                console.warn("Expected: https://demo.berinia.com/preview/EXISTING");
            }
        } else {
            console.error("❌ SCENARIO FAILED: Did not return existing project.");
            console.error("Expected Project ID:", projectId);
            console.error("Got:", data.projectId);
        }

    } catch (error) {
        console.error("[UnitTest] Error:", error);
    }
}

runUnitTest();
