
require('dotenv').config({ path: '.env.local' });

async function runIntegrationTest() {
    console.log('🤖 Starting End-to-End Integration Test via Local API...');

    const PORT = 3002;
    const SECRET = process.env.CRON_SECRET;
    const URL = `http://localhost:${PORT}/api/cron/scraping`;

    if (!SECRET) {
        console.error('❌ CRON_SECRET is missing from .env.local');
        return;
    }

    console.log(`   Target: ${URL}`);
    console.log('   Action: Triggering "Automatic Campaigns" (Cron Job)...');

    try {
        const response = await fetch(URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SECRET}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`   HTTP Status: ${response.status}`);
        const text = await response.text();

        try {
            const json = JSON.parse(text);
            console.log('   Response Body:', JSON.stringify(json, null, 2));

            if (response.ok) {
                console.log('\n✅ TEST PASSED: The API accepted the request and processed the logic.');
                if (json.count === 0) {
                    console.log('   (Note: 0 missions triggered. This is normal if no Airtable records have Status="Active")');
                } else {
                    console.log(`   🚀 Successfully triggered ${json.count} missions!`);
                }
            } else {
                console.error('\n❌ TEST FAILED: API returned an error.');
            }

        } catch (e) {
            console.log('   Response Text (Not JSON):', text);
        }

    } catch (error) {
        console.error('❌ Network Error:', error.message);
        console.log('   Is the server running on port ' + PORT + '?');
    }
}

runIntegrationTest();
