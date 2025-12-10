# API Reference

## Generate Preview (`POST /api/generate`)

This endpoint initiates the scraping, analysis, and agent creation process. It is designed to be called by your frontend or external automation tools (Zapier, Make).

### Request
- **URL**: `https://your-domain.com/api/generate`
- **Method**: `POST`
- **Headers**: 
  - `Content-Type: application/json`
- **Body**:
```json
{
  "url": "https://target-website.com"
}
```

### Response
#### Success (200 OK)
```json
{
  "status": "success",
  "projectId": "rec123456789",
  "previewUrl": "https://your-domain.com/preview/rec123456789",
  "agentId": "oBeDLoLOeuAbiuaMFXRtDOLriTJ5tSxD",
  "companyName": "Target Company Inc."
}
```

#### Error (500/400)
```json
{
  "error": "Failed to generate preview",
  "details": "Error message details..."
}
```

## Chat Message (`POST /api/chat/message`)

Proxies messages to the Retell AI Chat Agent.

### Request
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "agentId": "oBeDLoLOeuAbiuaMFXRtDOLriTJ5tSxD",
  "message": "Hello, what are your opening hours?"
}
```

### Response
```json
{
  "response": "We are open from 9 AM to 5 PM, Monday to Friday."
}
```
