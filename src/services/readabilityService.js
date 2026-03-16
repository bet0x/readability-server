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
   * Check if URL is from Broadcom TechDocs
   */
  isBroadcomTechDocsUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'techdocs.broadcom.com';
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
    
    // Pattern to match from "## Our use of cookies" until the Bank of England logo
    const cookiePattern2 = /## Our use of cookies[\s\S]*?\[!\[Bank of England home\]\(https:\/\/www\.bankofengland\.co\.uk\/-.*?\)\]\(https:\/\/www\.bankofengland\.co\.uk\/\)/g;
    
    // Pattern to match numbered lists (1., 2., 3., etc.) until the first ##
    const numberedListPattern = /^\d+\.\s+.*[\s\S]*?(?=\n## )/gm;
    
    let cleanedContent = content.replace(cookiePattern, '');
    cleanedContent = cleanedContent.replace(navigationPattern, '');
    cleanedContent = cleanedContent.replace(cookiePattern2, '');
    cleanedContent = cleanedContent.replace(numberedListPattern, '');
    
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
   * Ensure all links and media src URLs are absolute based on the given base URL
   */
  absolutizeLinks(html, baseUrl) {
    try {
      const fragDom = new JSDOM(`<div id="_root">${html}</div>`, { url: baseUrl, contentType: 'text/html' });
      const doc = fragDom.window.document;
      const root = doc.getElementById('_root');

      const absolutizeAttr = (el, attr) => {
        const val = el.getAttribute(attr);
        if (!val) return;
        try {
          const abs = new URL(val, baseUrl).href;
          el.setAttribute(attr, abs);
        } catch (_) {
          /* ignore invalid URLs */
        }
      };

      root.querySelectorAll('a[href]').forEach(a => absolutizeAttr(a, 'href'));
      root.querySelectorAll('img[src]').forEach(img => absolutizeAttr(img, 'src'));
      root.querySelectorAll('source[src], video[src], audio[src], track[src], script[src], link[href]').forEach(el => {
        if (el.hasAttribute('href')) absolutizeAttr(el, 'href');
        if (el.hasAttribute('src')) absolutizeAttr(el, 'src');
      });
      // srcset handling
      root.querySelectorAll('[srcset]').forEach(el => {
        const srcset = el.getAttribute('srcset');
        if (!srcset) return;
        const parts = srcset.split(',').map(s => s.trim()).filter(Boolean).map(item => {
          const m = item.split(/\s+/);
          const urlPart = m[0];
          const descriptor = m.slice(1).join(' ');
          try {
            const abs = new URL(urlPart, baseUrl).href;
            return descriptor ? `${abs} ${descriptor}` : abs;
          } catch (_) {
            return item; // leave as is
          }
        });
        el.setAttribute('srcset', parts.join(', '));
      });

      // Return inner HTML without wrapper
      return root.innerHTML;
    } catch (_) {
      return html;
    }
  }

  /**
   * For Broadcom TechDocs, extract the main topic content node
   */
  extractBroadcomMainNode(document) {
    try {
      // Main container holds the whole topic content
      let section = document.querySelector('div.topic.section, .topic.section, [class*="topic"][class*="section"]');
      if (!section) {
        // Fallbacks
        section = document.querySelector('#content, main, article');
      }
      if (!section) return null;
      // Prefer a nested topic with concept class, else any .topic under section
      const concept = section.querySelector('div.topic.topic.concept, .topic.concept, [class*="topic"][class*="concept"]');
      if (concept) return concept;
      const anyTopic = section.querySelector('div.topic.topic, .topic');
      if (anyTopic) return anyTopic;
      return section;
    } catch (_) {
      return null;
    }
  }

  /**
   * Cleanup Broadcom content: remove related links and cut after contact-us section
   */
  cleanBroadcomNode(root) {
    if (!root) return root;
    const removeAll = (selector) => {
      root.querySelectorAll(selector).forEach(el => el.remove());
    };
    // Remove related links blocks
    removeAll('.linklist.relatedlinks');
    removeAll('.linkpool.linklist');
    removeAll('.relatedlinks');
    removeAll('[data-label="Related information"]');

    // Remove "In this guide, see:" section (intro paragraph + following list)
    try {
      const candidates = Array.from(root.querySelectorAll('p, div, section, article'));
      for (const el of candidates) {
        const txt = (el.textContent || '').trim();
        if (txt.startsWith('In this guide, see:')) {
          // remove this node
          const parent = el.parentElement;
          const next = el.nextElementSibling;
          el.remove();
          // if next sibling is a list of links, remove it too
          if (next && (/^UL$/i.test(next.tagName) || next.matches('.ul, .list, .linklist, .linkpool'))) {
            next.remove();
          }
          // stop after first removal
          break;
        }
      }
    } catch (_) { /* ignore */ }

    // Cut at contact-us section if present
    const contact = root.querySelector('#contact-us-section, .contact-us-section');
    if (contact) {
      // remove contact and everything after within the same parent
      const parent = contact.parentElement;
      if (parent) {
        let cur = contact;
        while (cur) {
          const next = cur.nextElementSibling;
          cur.remove();
          cur = next;
        }
      } else {
        contact.remove();
      }
    }
    return root;
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
    let dom = this.createDOM(html, url);
    let document = dom.window.document;

    // Broadcom TechDocs: extract main node BEFORE Readability mutates the DOM
    let broadcomPreExtractHtml = null;
    if (this.isBroadcomTechDocsUrl(url)) {
      const preNode = this.extractBroadcomMainNode(document);
      if (preNode) {
        this.cleanBroadcomNode(preNode);
        broadcomPreExtractHtml = preNode.outerHTML;
        // Recreate DOM scoped to main node for cleaner Readability parse
        dom = this.createDOM(broadcomPreExtractHtml, url);
        document = dom.window.document;
      }
    }

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

    // Broadcom TechDocs: override content using the main topic container and absolutize links
    if (this.isBroadcomTechDocsUrl(url)) {
      if (broadcomPreExtractHtml) {
        result.content = broadcomPreExtractHtml;
        // Derive title from h1
        const tmp = this.createDOM(broadcomPreExtractHtml, url).window.document;
        const h1 = tmp.querySelector('h1');
        if (h1) result.title = h1.textContent.trim();
        result.textContent = tmp.body ? tmp.body.textContent.trim() : result.textContent;
      } else {
        const mainNode = this.extractBroadcomMainNode(document);
        if (mainNode) {
          this.cleanBroadcomNode(mainNode);
          result.content = mainNode.outerHTML;
          result.textContent = mainNode.textContent ? mainNode.textContent.trim() : result.textContent;
          const h1 = mainNode.querySelector('h1');
          if (h1 && (!result.title || result.title.trim().length < 3)) {
            result.title = h1.textContent.trim();
          }
        }
      }
      result.content = this.absolutizeLinks(result.content, url);
    }

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


    return responseData;
  }
}

module.exports = ReadabilityService;
