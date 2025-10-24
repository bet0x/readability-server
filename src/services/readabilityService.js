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
   * Fetch HTML content from URL
   */
  async fetchHtml(url) {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, {
      headers: {
        'User-Agent': this.config.api.userAgent
      },
      timeout: this.config.api.fetchTimeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    return await response.text();
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

    // Fetch HTML from URL
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
    const { finalContent, contentType } = this.convertContent(
      result.content, 
      result.textContent, 
      outputFormat
    );

    return {
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
  }
}

module.exports = ReadabilityService;
