FROM node:16.14.2 AS build

WORKDIR /home

COPY . .

RUN npm install  && \
  npm run build && \
  npm prune --production

FROM node:16.14.2-alpine

WORKDIR /home

COPY --from=build /home/dist ./dist
COPY --from=build /home/node_modules ./node_modules
COPY --from=build /home/bootstrap.js ./
COPY --from=build /home/package.json ./

ENV TZ="Asia/Shanghai"

RUN npm install  pm2 -g

EXPOSE 7001

ENTRYPOINT ["npm", "run", "online"]
