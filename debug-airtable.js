require('dotenv').config({ path: '.env' });
const Airtable = require('airtable');

const baseId = process.env.AIRTABLE_BASE_ID;
const tableName = process.env.AIRTABLE_TABLE_NAME || 'Previews';
const apiKey = process.env.AIRTABLE_API_KEY;
const retellKey = process.env.RETELL_API_KEY;

console.log(`Base: ${baseId}, Key: ${apiKey ? 'Found' : 'Missing'}`);
console.log(`Retell Key: ${retellKey ? 'Found' : 'Missing'}`);

const base = new Airtable({ apiKey }).base(baseId);

const id = 'receNBWaR6rdqjM2d';

base(tableName).find(id, function (err, record) {
    if (err) { console.error(err); return; }
    console.log('Retrieved Record:', id);
    console.log('Fields:', JSON.stringify(record.fields, null, 2));

    const prospect = record.get('Prospect');
    console.log('Prospect Field:', prospect, 'Type:', typeof prospect);
    if (Array.isArray(prospect)) {
        console.log('Expected Prospect ID:', prospect[0]);
    } else {
        console.log('Prospect field is NOT an array.');
    }
});
