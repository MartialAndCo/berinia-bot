
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeSite(url: string) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
      },
      timeout: 10000 // 10s timeout
    });

    const $ = cheerio.load(data);

    // Extract metadata
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content') || '';

    // Remove scripts, styles, and other non-content elements
    // We remove header/footer to reduce noise, unless user wants them. 
    // Usually "Contact" is in footer. Let's KEEP footer but remove script/style.
    $('script, style, noscript, iframe, svg, link, object, embed, picture, input, button').remove();

    // Optional: Remove comments
    $('*').contents().filter((_, el) => el.type === 'comment').remove();

    // Get the HTML body content (cheerio html() returns the inner HTML)
    let cleanHtml = $('body').html() || '';

    // Compress whitespace to save tokens
    cleanHtml = cleanHtml.replace(/\s+/g, ' ').trim();

    // Combine for context
    // We pass the "Cleaned HTML" so Gemini can see headers, lists, and structure.
    const fullContent = `Title: ${title}\nDescription: ${description}\n\nHTML Content:\n${cleanHtml}`;

    // Truncate if extremely large (Gemini 2.5 Flash has ~1M context, so 100k chars is safe)
    return fullContent.slice(0, 100000);

  } catch (error) {
    console.error('Error scraping site:', error);
    // Return minimal context on failure
    return "Title: Error Scraping\nDescription: Could not access site.\n\nContent:\n";
  }
}
