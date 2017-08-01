FROM node:8.2.1

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

# Install app dependencies
RUN npm install

EXPOSE 5000

CMD [ "npm", "start" ]
