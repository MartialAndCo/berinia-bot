
async function run() {
    const url = 'http://56.228.15.237:5678/webhook/text-inbound';
    const payload = { prospectId: 'recG6jbDctVzAEMsw' };

    console.log('Testing Webhook:', url);
    console.log('Payload:', JSON.stringify(payload));

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Raw Text:', text);

        try {
            const json = JSON.parse(text);
            console.log('Parsed JSON:', JSON.stringify(json, null, 2));

            // Test my parsing logic
            let variables = {};
            if (Array.isArray(json) && json.length > 0 && json[0].fields) {
                variables = json[0].fields;
                console.log('Logic Match: Array with fields');
            } else if (typeof json === 'object') {
                variables = json;
                console.log('Logic Match: Simple Object');
            }
            console.log('Extracted Variables:', Object.keys(variables));
            console.log('Business Name:', variables['business_name']);
        } catch (e) {
            console.log('Not valid JSON');
        }

    } catch (e) {
        console.error('Fetch Error:', e);
    }
}

run();
