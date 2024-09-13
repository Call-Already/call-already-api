echo "1. Removing node modules"
rm -rf node_modules

echo "2. Installing dependencies"
npm install --omit=dev

echo "3. Deploying"
serverless deploy

echo "4. Reinstalling dev dependencies"
npm install