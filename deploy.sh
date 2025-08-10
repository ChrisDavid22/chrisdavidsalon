#!/bin/bash

# Deploy to Vercel and automatically update the alias
echo "Deploying to Vercel..."

# Deploy to production
DEPLOYMENT_URL=$(npx vercel --prod --yes 2>&1 | grep "Production:" | awk '{print $2}')

if [ -z "$DEPLOYMENT_URL" ]; then
    echo "Deployment failed"
    exit 1
fi

echo "Deployed to: $DEPLOYMENT_URL"

# Update the stable alias
echo "Updating alias chris-david-salon.vercel.app..."
npx vercel alias $DEPLOYMENT_URL chris-david-salon.vercel.app

echo "✅ Deployment complete!"
echo "✅ Stable URL: https://chris-david-salon.vercel.app"