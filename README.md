# EmailCleaner

https://emailcleaner.herokuapp.com

## Required
* docker >= 18.09.2
* Define an outlook application (https://docs.microsoft.com/fr-fr/outlook/rest/node-tutorial)
* Define an google application (https://developers.google.com/gmail/api/quickstart/nodejs)

## Getting started

First:

    $ git clone https://github.com/aektos/emailcleaner.git
    
Generate gmail.oauth2.keys.json and outlook.oauth2.keys.json \
Then inside the working directory:

    $ docker build -t emailcleaner ./
    $ docker run -d --name emailcleaner_app -p 80:3000 -v ${pwd}/:/var/www/html/app emailcleaner
    $ docker exec -it emailcleaner_app sh -c "NODE_ENV=development npm start"

On development mode, force to delete token: 
    
    $ docker exec -it emailcleaner_app sh -c "rm /tmp/token.json"
    
Force stop and remove the container:

    $ docker rm -f emailcleaner_app
    
## Website

The service is online here: https://emailcleaner.herokuapp.com