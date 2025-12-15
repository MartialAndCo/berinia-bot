// Native fetch in Node 18+

async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/register-call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agentId: 'agent_4057218664665a9a5fccb3224e',
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
