FROM mhart/alpine-node:10.15

# install dependencies
WORKDIR /app
COPY static /app/static
COPY content /app/content
COPY __sapper__ /app/__sapper__
COPY package.json package-lock.json /app/
RUN npm install --production

###
# Only copy over the Node pieces we need
# ~> Saves 35MB
###
FROM mhart/alpine-node:base-10.15

WORKDIR /app
COPY --from=0 /app .

EXPOSE 3000
CMD ["node", "__sapper__/build"]
