# Cloud Run Deployment Guide

This guide explains how to deploy the YouTube Script Chatbot to Google Cloud Run.

## Prerequisites

1. Google Cloud Project with billing enabled
2. Google Cloud SDK (gcloud) installed and authenticated
3. Docker installed locally (for testing)
4. Required APIs enabled:
   - Cloud Run API
   - Cloud Build API
   - Container Registry API

## Environment Variables

Create a `.env` file with:
```
OPENAI_API_KEY=your_openai_api_key
```

## Deployment Methods

### Method 1: Using Cloud Build (Recommended)

```bash
# Deploy using Cloud Build
npm run gcp:build
```

This will:
1. Build the Docker image
2. Push to Container Registry
3. Deploy to Cloud Run automatically

### Method 2: Direct Source Deployment

```bash
# Deploy directly from source
npm run gcp:deploy
```

### Method 3: Manual Docker Build and Deploy

```bash
# 1. Build Docker image locally
npm run docker:build

# 2. Test locally
npm run docker:run

# 3. Tag for GCR
docker tag youtube-script-chatbot gcr.io/YOUR_PROJECT_ID/youtube-script-chatbot

# 4. Push to GCR
docker push gcr.io/YOUR_PROJECT_ID/youtube-script-chatbot

# 5. Deploy to Cloud Run
gcloud run deploy youtube-script-chatbot \
  --image gcr.io/YOUR_PROJECT_ID/youtube-script-chatbot \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --set-env-vars NODE_ENV=production
```

## Configuration

The deployment is configured in:
- `cloudbuild.yaml` - Cloud Build configuration
- `Dockerfile` - Container configuration
- `.dockerignore` - Files to exclude from Docker build

### Cloud Run Settings

- **Region**: us-central1
- **Memory**: 1Gi
- **CPU**: 1
- **Port**: 8080
- **Timeout**: 300 seconds
- **Max instances**: 10
- **Concurrency**: 100

## Post-Deployment

After deployment:

1. Get the service URL:
   ```bash
   gcloud run services describe youtube-script-chatbot --region us-central1
   ```

2. Set environment variables in Cloud Run:
   ```bash
   gcloud run services update youtube-script-chatbot \
     --update-env-vars OPENAI_API_KEY=your_key \
     --region us-central1
   ```

3. View logs:
   ```bash
   gcloud run logs read --service youtube-script-chatbot --region us-central1
   ```

## Troubleshooting

### Build Fails
- Check that all dependencies are properly installed
- Ensure `NODE_ENV=production` is set
- Verify the Dockerfile syntax

### Runtime Errors
- Check Cloud Run logs for detailed error messages
- Verify environment variables are set correctly
- Ensure the OpenAI API key is valid

### Performance Issues
- Monitor memory usage in Cloud Run console
- Adjust concurrency settings if needed
- Consider increasing CPU allocation for heavy loads