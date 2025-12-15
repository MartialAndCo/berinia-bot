
const axios = require('axios');

async function testScrape(url) {
    if (!url.startsWith('http')) {
        url = 'https://' + url;
        console.log("Prepended https, new url:", url);
    }

    try {
        console.log(`Testing access to: ${url}`);
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });
        console.log("Success! Status:", 200);
        console.log("Data length:", data.length);
    } catch (error) {
        console.error("Scrape failed:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Headers:", error.response.headers);
        }
    }
}

testScrape('www.creatifpaysage.com');
testScrape('https://creatifpaysage.com');
