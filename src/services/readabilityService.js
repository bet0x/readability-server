/* eslint-env node */
const { JSDOM } = require('jsdom');
const { Readability, isProbablyReaderable } = require('../../index');
const TurndownService = require('turndown');

/**
 * Readability service for processing web content
 */
class ReadabilityService {
  constructor(config) {
    this.config = config;
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
      strongDelimiter: '**',
      linkStyle: 'inlined',
      linkReferenceStyle: 'full'
    });
  }

  /**
   * Check if URL is from NCSC website
   */
  isNcscUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'www.ncsc.gov.uk';
    } catch (e) {
      return false;
    }
  }

  /**
   * Check if URL is from Bank of England website
   */
  isBankOfEnglandUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'www.bankofengland.co.uk';
    } catch (e) {
      return false;
    }
  }

  /**
   * Generate NCSC API URL from original URL
   */
  getNcscApiUrl(originalUrl) {
    try {
      const urlObj = new URL(originalUrl);
      const path = urlObj.pathname;
      
      // Extract collection path from URL
      const collectionMatch = path.match(/^\/collection\/([^\/]+)/);
      if (collectionMatch) {
        const collectionName = collectionMatch[1];
        return `https://www.ncsc.gov.uk/api/1/services/v4/collection-content.json?url=/collection/${collectionName}&pageContentUrl=${path}`;
      }
      
      // Fallback for other NCSC URLs
      return `https://www.ncsc.gov.uk/api/1/services/v4/collection-content.json?url=${path}&pageContentUrl=${path}`;
    } catch (e) {
      throw new Error('Invalid NCSC URL format');
    }
  }

  /**
   * Fetch NCSC content from API
   */
  async fetchNcscContent(url) {
    const apiUrl = this.getNcscApiUrl(url);
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': this.config.api.userAgent,
        'Accept': 'application/json'
      },
      timeout: this.config.api.fetchTimeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch NCSC API: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Parse NCSC JSON content and convert to HTML
   */
  parseNcscContent(jsonData) {
    const page = jsonData.page;
    if (!page || !page.bodyContent) {
      throw new Error('Invalid NCSC API response: missing bodyContent');
    }

    const bodyContent = page.bodyContent;
    const title = bodyContent.title || page.title || 'NCSC Content';
    const summary = bodyContent.summary || page.summary || '';
    
    // Generate HTML content from bodyContent.items
    let htmlContent = '<div id="readability-page-1" class="page">\n    <div>\n';
    
    // Add primary image if present
    if (page.primaryImage && page.primaryImage.imagePath) {
      htmlContent += '        <figure>\n';
      htmlContent += `            <img src="${this.escapeHtml(page.primaryImage.imagePath)}" alt="${this.escapeHtml(page.primaryImage.imageDescription || '')}" />\n`;
      
      if (page.primaryImage.imageCaption && page.primaryImage.imageCaption.trim()) {
        htmlContent += `            <figcaption>${this.escapeHtml(page.primaryImage.imageCaption)}</figcaption>\n`;
      }
      
      if (page.primaryImage.imageCredits && page.primaryImage.imageCredits.trim()) {
        htmlContent += `            <div class="image-credits">${this.escapeHtml(page.primaryImage.imageCredits)}</div>\n`;
      }
      
      htmlContent += '        </figure>\n';
    }
    
    if (bodyContent.content && bodyContent.content.items) {
      bodyContent.content.items.forEach(item => {
        if (item.subheading && item.subheading.trim()) {
          htmlContent += `        <h2>${this.escapeHtml(item.subheading)}</h2>\n`;
        }
        
        if (item.description && item.description.trim()) {
          // Convert description to paragraphs, handling line breaks
          const paragraphs = item.description
            .split(/\n\s*\n/)
            .filter(p => p.trim())
            .map(p => p.trim());
          
          paragraphs.forEach(paragraph => {
            if (paragraph) {
              htmlContent += `        <p>${this.escapeHtml(paragraph)}</p>\n`;
            }
          });
        }
      });
    }
    
    htmlContent += '    </div>\n</div>';
    
    // Generate text content (HTML stripped)
    const textContent = htmlContent
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    return {
      title,
      content: htmlContent,
      textContent,
      length: textContent.length,
      excerpt: summary,
      byline: null,
      dir: null,
      siteName: 'NCSC',
      lang: 'en',
      publishedTime: page.modifiedDate || null,
      readerable: true
    };
  }

  /**
   * Escape HTML characters
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Fetch HTML content from URL
   */
  async fetchHtml(url) {
    // Check if this is an NCSC URL
    if (this.isNcscUrl(url)) {
      try {
        const jsonData = await this.fetchNcscContent(url);
        return this.parseNcscContent(jsonData);
      } catch (error) {
        console.warn('NCSC API failed, falling back to regular fetch:', error.message);
        // Fall through to regular fetch
      }
    }

    // Regular fetch for non-NCSC URLs
    const fetch = (await import('node-fetch')).default;
    
    // Prepare headers
    const headers = {
      'User-Agent': this.config.api.userAgent
    };
    
    // Add Bank of England cookie to bypass cookie notice
    if (this.isBankOfEnglandUrl(url)) {
      headers['Cookie'] = 'boeconsent=necessary';
    }
    
    const response = await fetch(url, {
      headers: headers,
      timeout: this.config.api.fetchTimeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    return await response.text();
  }

  /**
   * Clean Bank of England content by removing cookie notice
   */
  cleanBankOfEnglandContent(content) {
    // Pattern to match from "## Our use of cookies" until the numbered list starts
    const cookiePattern = /## Our use of cookies[\s\S]*?(?=\d+\.\s*\[Home\]\(https:\/\/www\.bankofengland\.co\.uk\/\))/g;
    
    // Pattern to match the navigation section (numbered list starting with Home)
    const navigationPattern = /^\d+\.\s*\[Home\]\(https:\/\/www\.bankofengland\.co\.uk\/\)[\s\S]*?(?=\n## |\n### |$)/gm;
    
    let cleanedContent = content.replace(cookiePattern, '');
    cleanedContent = cleanedContent.replace(navigationPattern, '');
    
    return cleanedContent;
  }

  /**
   * Create DOM from HTML content
   */
  createDOM(html, url) {
    return new JSDOM(html, {
      url: url,
      contentType: 'text/html'
    });
  }

  /**
   * Extract site name from various sources
   */
  extractSiteName(result, url) {
    if (result.siteName) {
      return result.siteName;
    }

    // Try to get from title (common pattern: "Page Title | Site Name")
    if (result.title) {
      const titleParts = result.title.split(' | ');
      if (titleParts.length > 1) {
        return titleParts[titleParts.length - 1].trim();
      }
    }
    
    // Try to get from domain name as fallback
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      // Convert domain to readable site name
      return domain
        .replace('www.', '')
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    } catch (e) {
      return null;
    }
  }

  /**
   * Convert content to specified format
   */
  convertContent(content, textContent, outputFormat) {
    let finalContent = content;
    let contentType = 'html';
    
    if (outputFormat === 'markdown') {
      finalContent = this.turndownService.turndown(content);
      contentType = 'markdown';
    } else if (outputFormat === 'text') {
      finalContent = textContent;
      contentType = 'text';
    }

    return { finalContent, contentType };
  }

  /**
   * Process URL and extract readable content
   */
  async processUrl(url, outputFormat = 'html', options = {}) {
    // Validate output format
    const validFormats = ['html', 'markdown', 'text'];
    if (!validFormats.includes(outputFormat)) {
      throw new Error(`Output format must be one of: ${validFormats.join(', ')}`);
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (urlError) {
      throw new Error('Please provide a valid URL');
    }

    // Check if this is an NCSC URL and handle specially
    if (this.isNcscUrl(url)) {
      try {
        const jsonData = await this.fetchNcscContent(url);
        const ncscResult = this.parseNcscContent(jsonData);
        
        // Convert content based on output format
        const { finalContent, contentType } = this.convertContent(
          ncscResult.content, 
          ncscResult.textContent, 
          outputFormat
        );

        return {
          success: true,
          data: {
            title: ncscResult.title,
            content: finalContent,
            contentType: contentType,
            textContent: ncscResult.textContent,
            length: ncscResult.length,
            excerpt: ncscResult.excerpt,
            byline: ncscResult.byline,
            dir: ncscResult.dir,
            siteName: ncscResult.siteName,
            lang: ncscResult.lang,
            publishedTime: ncscResult.publishedTime,
            readerable: ncscResult.readerable,
            sourceUrl: url,
            outputFormat: outputFormat
          }
        };
      } catch (error) {
        console.warn('NCSC processing failed, falling back to regular processing:', error.message);
        // Fall through to regular processing
      }
    }

    // Check if this is a Bank of England URL and handle specially
    if (this.isBankOfEnglandUrl(url)) {
      console.log('Bank of England URL detected - will dump result for analysis');
      // Continue with normal processing but will dump the result
    }

    // Regular processing for non-NCSC URLs
    const html = await this.fetchHtml(url);

    // Create DOM from HTML
    const dom = this.createDOM(html, url);
    const document = dom.window.document;

    // Check if content is probably readable
    const readerable = isProbablyReaderable(document);

    // Parse with Readability
    const reader = new Readability(document, {
      debug: options.debug || false,
      maxElemsToParse: options.maxElemsToParse || 0,
      nbTopCandidates: options.nbTopCandidates || 5,
      charThreshold: options.charThreshold || 500,
      classesToPreserve: options.classesToPreserve || [],
      keepClasses: options.keepClasses || false,
      disableJSONLD: options.disableJSONLD || false,
      ...options
    });

    const result = reader.parse();

    if (!result) {
      throw new Error('Unable to extract readable content from the provided URL');
    }

    // Extract site name
    result.siteName = this.extractSiteName(result, url);

    // Convert content based on output format
    let { finalContent, contentType } = this.convertContent(
      result.content, 
      result.textContent, 
      outputFormat
    );

    // Clean Bank of England content to remove cookie notice
    if (this.isBankOfEnglandUrl(url)) {
      finalContent = this.cleanBankOfEnglandContent(finalContent);
    }

    const responseData = {
      success: true,
      data: {
        title: result.title,
        content: finalContent,
        contentType: contentType,
        textContent: result.textContent,
        length: result.length,
        excerpt: result.excerpt,
        byline: result.byline,
        dir: result.dir,
        siteName: result.siteName,
        lang: result.lang,
        publishedTime: result.publishedTime,
        readerable,
        sourceUrl: url,
        outputFormat: outputFormat
      }
    };


    console.log('Response content:', finalContent);
    return responseData;
  }
}

module.exports = ReadabilityService;
