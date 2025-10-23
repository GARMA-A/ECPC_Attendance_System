FROM node:20-alpine
WORKDIR /app

# Install OpenSSL 1.1 manually
RUN apk add --no-cache openssl1.1-compat

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "run", "dev"]
