FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install -g @mapbox/node-pre-gyp
RUN npm install
RUN npm run build

FROM node:18
WORKDIR /app
COPY --from=builder /app/build ./build
COPY package*.json ./
RUN npm install -g @mapbox/node-pre-gyp
RUN npm ci --omit=dev
EXPOSE 5000

CMD [ "node", "build/app.js" ]