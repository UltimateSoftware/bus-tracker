FROM node:6.2.2
RUN apt-get update && \
    apt-get install -y build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN mkdir -p /app

ENV NODE_ENV="production"

WORKDIR /app

COPY package.json /app/
RUN npm install -q

COPY . /app

EXPOSE 5000

CMD [ "npm", "start" ]
