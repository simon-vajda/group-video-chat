FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install -g @mapbox/node-pre-gyp
RUN npm ci --omit=dev
COPY . .

EXPOSE 5000

CMD [ "node", "src/app.js" ]