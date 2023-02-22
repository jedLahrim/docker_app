FROM node:14.15.1-alpine

WORKDIR /Uvently
COPY package.json .

RUN npm install
COPY . .

EXPOSE 3000
ENV DB_HOST = 'eventapp-database.ccuvdqrdczzr.us-west-2.rds.amazonaws.com'
ENV DB_PORT = 3306
ENV DB_USERNAME = 'admin'
ENV DB_PASSWORD = 'jolix1235'
ENV DB = 'event_app'

CMD ["npm", "run", "start:prod"]