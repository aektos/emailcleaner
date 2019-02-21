FROM node:10-alpine

WORKDIR /var/www/html/app

RUN npm install -g nodemon

COPY package.json /var/www/html/app

RUN npm install --no-bin-links

EXPOSE 3000

#CMD [ "npm", "start" ]
#CMD [ "nodemon", "./bin/www" ]
ENTRYPOINT ["tail", "-f", "/dev/null"]
