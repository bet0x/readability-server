# Usage Examples

## cURL

### Get HTML
```bash
curl -X POST http://localhost:8000/reader/html \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key-here" \
  -d '{"url": "https://example.com/article"}'
```

### Get Markdown
```bash
curl -X POST http://localhost:8000/reader/markdown \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key-here" \
  -d '{"url": "https://example.com/article"}'
```

### Get Plain Text
```bash
curl -X POST http://localhost:8000/reader/text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key-here" \
  -d '{"url": "https://example.com/article"}'
```

## Python

```python
import requests

headers = {
    "Authorization": "Bearer your-api-key-here",
    "Content-Type": "application/json"
}

# Get clean HTML
response = requests.post(
    "http://localhost:8000/reader/html",
    headers=headers,
    json={"url": "https://example.com/article"}
)
html_content = response.text

# Get Markdown
response = requests.post(
    "http://localhost:8000/reader/markdown",
    headers=headers,
    json={"url": "https://example.com/article"}
)
markdown_content = response.text

# Get plain text
response = requests.post(
    "http://localhost:8000/reader/text",
    headers=headers,
    json={"url": "https://example.com/article"}
)
text_content = response.text
```

## JavaScript

```javascript
// Get clean HTML
const response = await fetch('http://localhost:8000/reader/html', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-api-key-here'
  },
  body: JSON.stringify({
    url: 'https://example.com/article'
  })
});

const htmlContent = await response.text();

// Get Markdown
const markdownResponse = await fetch('http://localhost:8000/reader/markdown', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-api-key-here'
  },
  body: JSON.stringify({
    url: 'https://example.com/article'
  })
});

const markdownContent = await markdownResponse.text();
```

## Node.js

```javascript
const axios = require('axios');

const headers = {
  'Authorization': 'Bearer your-api-key-here',
  'Content-Type': 'application/json'
};

// Get clean HTML
const htmlResponse = await axios.post(
  'http://localhost:8000/reader/html',
  { url: 'https://example.com/article' },
  { headers }
);

console.log(htmlResponse.data);
```

## Error Handling

```python
import requests

try:
    response = requests.post(
        "http://localhost:8000/reader/html",
        headers={"Authorization": "Bearer your-api-key-here"},
        json={"url": "https://example.com/article"}
    )
    response.raise_for_status()
    content = response.text
except requests.exceptions.HTTPError as e:
    print(f"HTTP Error: {e}")
except requests.exceptions.RequestException as e:
    print(f"Request Error: {e}")
```
