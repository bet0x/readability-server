#!/usr/bin/env python3

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
import re
import uvicorn
import os
from typing import Annotated
from scalar_fastapi import get_scalar_api_reference
from fastapi_mcp import FastApiMCP

# Configuration
API_TOKEN = os.getenv("API_TOKEN", "your-secret-api-key-here")

# HTTP Bearer token scheme
security = HTTPBearer(
    scheme_name="Bearer Token",
    description="API token for accessing Reader View endpoints"
)

app = FastAPI(
    title="Reader View API", 
    version="1.0.5",
    description="A modern API for extracting clean, readable content from web pages with MCP support"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MCP server
mcp = FastApiMCP(app)

class URLRequest(BaseModel):
    url: str

async def verify_token(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
) -> str:
    """
    Verify the provided API token against the configured token.
    
    Args:
        credentials: HTTP Bearer credentials containing the token
        
    Returns:
        The verified token string
        
    Raises:
        HTTPException: If the token is invalid or missing
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if credentials.credentials != API_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return credentials.credentials

# Dependency for authenticated endpoints
Authenticated = Annotated[str, Depends(verify_token)]

def extract_main_content(html, url):
    """Extract main content using simple heuristics"""
    soup = BeautifulSoup(html, 'html.parser')
    
    # Remove unwanted elements
    for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'advertisement', 'ad']):
        element.decompose()
    
    # Find main content
    main_content = None
    
    # Try to find main element
    main = soup.find('main')
    if main:
        main_content = main
    else:
        # Search by common attributes
        for selector in ['article', '[role="main"]', '.content', '.post', '.entry', '.article']:
            element = soup.select_one(selector)
            if element:
                main_content = element
                break
    
    # If no specific content found, use body
    if not main_content:
        main_content = soup.find('body')
    
    # Convert relative URLs to absolute
    if main_content:
        for img in main_content.find_all('img'):
            if img.get('src'):
                img['src'] = requests.compat.urljoin(url, img['src'])
        
        for link in main_content.find_all('a'):
            if link.get('href'):
                link['href'] = requests.compat.urljoin(url, link['href'])
    
    return str(main_content) if main_content else str(soup)

def html_to_markdown(html):
    """Convert HTML to Markdown in a simple way"""
    # Convert headers
    html = re.sub(r'<h1[^>]*>(.*?)</h1>', r'# \1\n\n', html, flags=re.IGNORECASE | re.DOTALL)
    html = re.sub(r'<h2[^>]*>(.*?)</h2>', r'## \1\n\n', html, flags=re.IGNORECASE | re.DOTALL)
    html = re.sub(r'<h3[^>]*>(.*?)</h3>', r'### \1\n\n', html, flags=re.IGNORECASE | re.DOTALL)
    html = re.sub(r'<h4[^>]*>(.*?)</h4>', r'#### \1\n\n', html, flags=re.IGNORECASE | re.DOTALL)
    html = re.sub(r'<h5[^>]*>(.*?)</h5>', r'##### \1\n\n', html, flags=re.IGNORECASE | re.DOTALL)
    html = re.sub(r'<h6[^>]*>(.*?)</h6>', r'###### \1\n\n', html, flags=re.IGNORECASE | re.DOTALL)
    
    # Convert paragraphs
    html = re.sub(r'<p[^>]*>(.*?)</p>', r'\1\n\n', html, flags=re.IGNORECASE | re.DOTALL)
    
    # Convert bold and italic
    html = re.sub(r'<strong[^>]*>(.*?)</strong>', r'**\1**', html, flags=re.IGNORECASE | re.DOTALL)
    html = re.sub(r'<b[^>]*>(.*?)</b>', r'**\1**', html, flags=re.IGNORECASE | re.DOTALL)
    html = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', html, flags=re.IGNORECASE | re.DOTALL)
    html = re.sub(r'<i[^>]*>(.*?)</i>', r'*\1*', html, flags=re.IGNORECASE | re.DOTALL)
    
    # Convert links
    html = re.sub(r'<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>', r'[\2](\1)', html, flags=re.IGNORECASE | re.DOTALL)
    
    # Convert images
    html = re.sub(r'<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>', r'![\2](\1)', html, flags=re.IGNORECASE | re.DOTALL)
    html = re.sub(r'<img[^>]*src="([^"]*)"[^>]*>', r'![](\1)', html, flags=re.IGNORECASE | re.DOTALL)
    
    # Convert lists
    html = re.sub(r'<ul[^>]*>(.*?)</ul>', lambda m: re.sub(r'<li[^>]*>(.*?)</li>', r'- \1\n', m.group(1), flags=re.IGNORECASE | re.DOTALL) + '\n', html, flags=re.IGNORECASE | re.DOTALL)
    
    # Convert blockquotes
    html = re.sub(r'<blockquote[^>]*>(.*?)</blockquote>', lambda m: '> ' + m.group(1).replace('\n', '\n> ') + '\n\n', html, flags=re.IGNORECASE | re.DOTALL)
    
    # Convert code
    html = re.sub(r'<code[^>]*>(.*?)</code>', r'`\1`', html, flags=re.IGNORECASE | re.DOTALL)
    html = re.sub(r'<pre[^>]*>(.*?)</pre>', r'```\n\1\n```\n\n', html, flags=re.IGNORECASE | re.DOTALL)
    
    # Clean remaining HTML
    html = re.sub(r'<[^>]*>', '', html)
    
    # Clean multiple spaces
    html = re.sub(r'\n\s*\n\s*\n', '\n\n', html)
    
    return html.strip()

def process_url(url):
    """Process a URL and extract content"""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Extract title
        soup = BeautifulSoup(response.text, 'html.parser')
        title = soup.find('title')
        title_text = title.get_text().strip() if title else 'No title'
        
        # Extract main content
        content = extract_main_content(response.text, url)
        
        return {
            'title': title_text,
            'content': content
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error processing URL: {str(e)}')

@app.get("/scalar", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title=app.title + " - Scalar Documentation"
    )

@app.get("/")
async def root():
    return {
        "message": "Reader View API",
        "version": "1.0.5",
        "endpoints": {
            "/reader/html": "POST - URL in body, returns clean HTML (Requires API Key)",
            "/reader/markdown": "POST - URL in body, returns Markdown (Requires API Key)",
            "/reader/text": "POST - URL in body, returns plain text (Requires API Key)",
            "/docs": "GET - Interactive API documentation (Swagger UI)",
            "/redoc": "GET - Alternative API documentation (ReDoc)",
            "/scalar": "GET - Modern API documentation (Scalar)",
            "/mcp": "GET - Model Context Protocol server endpoint"
        },
        "authentication": "Bearer token required for all /reader/* endpoints",
        "mcp_support": "Available at /mcp endpoint for AI model integration"
    }

@app.post("/reader/html")
async def reader_html(request: URLRequest, token: Authenticated):
    article = process_url(request.url)
    
    clean_html = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{article['title']}</title>
    <style>
        body {{ 
            font-family: Georgia, serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            line-height: 1.6; 
            color: #333;
        }}
        h1, h2, h3 {{ color: #2c3e50; }}
        img {{ max-width: 100%; height: auto; }}
        blockquote {{ border-left: 4px solid #3498db; padding-left: 20px; margin: 20px 0; }}
    </style>
</head>
<body>
    <h1>{article['title']}</h1>
    {article['content']}
</body>
</html>"""
    
    from fastapi.responses import HTMLResponse
    return HTMLResponse(content=clean_html)

@app.post("/reader/markdown")
async def reader_markdown(request: URLRequest, token: Authenticated):
    article = process_url(request.url)
    markdown = html_to_markdown(article['content'])
    
    full_markdown = f"# {article['title']}\n\n{markdown}"
    
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse(content=full_markdown, media_type="text/markdown")

@app.post("/reader/text")
async def reader_text(request: URLRequest, token: Authenticated):
    article = process_url(request.url)
    
    # Convert HTML to plain text
    text = re.sub(r'<[^>]*>', '', article['content'])
    text = re.sub(r'\s+', ' ', text).strip()
    
    full_text = f"{article['title']}\n\n{text}"
    
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse(content=full_text, media_type="text/plain")

if __name__ == "__main__":
    # Mount MCP server
    mcp.mount()
    
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
