FROM mhart/alpine-node:10.15

# install dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production

###
# Only copy over the Node pieces we need
# ~> Saves 35MB
###
FROM mhart/alpine-node:base-10.15

WORKDIR /app
COPY --from=0 /app .
COPY . .

EXPOSE 3000
CMD ["node", "__sapper__/build"]
