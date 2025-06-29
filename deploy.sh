#!/bin/bash

# YouTube Crawler Google Cloud Function Deployment Script

# Set your project ID
PROJECT_ID="youtubecrawling-463910"
FUNCTION_NAME="youtube-script-api"
REGION=" asia-northeast3"
RUNTIME="nodejs20"
ENTRY_POINT="./server/index.ts"
MEMORY="2048MB"
TIMEOUT="540s"

echo "Deploying YouTube Crawler to Google Cloud Functions..."

gcloud functions deploy $FUNCTION_NAME \
  --runtime $RUNTIME \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point $ENTRY_POINT \
  --source . \
  --memory $MEMORY \
  --timeout $TIMEOUT \
  --region $REGION \
  --project $PROJECT_ID \
  --set-env-vars "TMPDIR=/tmp" \
  --max-instances 10

echo "Deployment complete!"
echo "Function URL: https://$REGION-$PROJECT_ID.cloudfunctions.net/$FUNCTION_NAME"