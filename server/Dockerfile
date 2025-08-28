FROM node:22-alpine

WORKDIR /app

# Copy only package manifests first (better for caching)
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy rest of app
COPY . .

# Default env
ENV PORT=4000 \
    LOG_PATH=/var/log/browser-recorder/events.log \
    MAX_PAYLOAD_BYTES=1048576

RUN mkdir -p /var/log/browser-recorder

EXPOSE 4000

CMD ["npm", "start"]