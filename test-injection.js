// Native fetch in Node 18+

async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/register-call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agentId: 'const AGENT_ID = 'agent_728d2c4ee1235e28ce8c44e676';',
                dynamicVariables: {
                    prospectId: 'recG6jbDctVzAEMsw',
                    business_name: 'TestBusiness'
                }
            })
        });
        const data = await res.json();
        console.log('Response:', data);
    } catch (e) {
        console.error(e);
    }
}
test();
