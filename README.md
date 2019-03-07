# EmailCleaner

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

The service is online here: https://emailcleaner.herokuapp.com

![screenshot](/screenshot.png?raw=true "Screenshot")

EmailCleaner is a tool to take over control on your hotmail or gmail box.
It alloaws you to list by expeditors, delete batch of emails or identify and unsubscribe from undesired newsletters.

EmailCleaner respects the user's data. None user's data are stored or sell. 
It's an open source solution. There is no database storage in the app.

## Getting started

### Prerequisites

* Docker >= 18.09.2 or nodejs >= 10.15.0 and npm >= 6.X
* Define an outlook application (https://docs.microsoft.com/fr-fr/outlook/rest/node-tutorial)
* Define an google application (https://developers.google.com/gmail/api/quickstart/nodejs)

### Installing

1. Clone the repository    
    
    ````
    $ git clone https://github.com/aektos/emailcleaner.git
    ````
    
2. Generate Gmail and Outlook oauth2 keys

    In development mode, create gmail.oauth2.keys.json and outlook.oauth2.keys.json files at the project root directory like this:

    gmail.oauth2.keys.json file :
    ````
    {
      "web": {
        "client_id": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "project_id": "XXXXXXXXX",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://www.googleapis.com/oauth2/v3/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": "XXXXXXXXXXXXXXXXX",
        "redirect_uris": [
          "http://localhost/gmail/auth"
        ],
        "javascript_origins": [
          "http://localhost"
        ]
      }
    }
    ````
    
    outlook.oauth2.keys.json file :
    ````
    {
        "credentials": {
            "client": {
                "id": "XXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                "secret": "XXXXXXXXXXXX"
            },
            "auth": {
                "tokenHost": "https://login.microsoftonline.com",
                "authorizePath": "common/oauth2/v2.0/authorize",
                "tokenPath": "common/oauth2/v2.0/token"
            }
        },
        "app": {
            "app_scopes": "openid profile offline_access User.Read Mail.ReadWrite MailboxSettings.ReadWrite",
            "redirect_uri": "http://localhost/outlook/auth"
        }
    }
    ````
    
    In production mode, replace localhost with the production domain name and then save the Gmail oauth2 key in the variable process.env.keyFileGoogle and the Outlook oauth2 key in process.env.keyFileMicrosoft.

3. Build and Start Docker container :

    ````
    $ docker build -t emailcleaner ./
    $ docker run -d --name emailcleaner_app -p 80:3000 -v ${pwd}/:/var/www/html/app emailcleaner
    $ docker exec -it emailcleaner_app sh -c "NODE_ENV=development npm start"
   ````
   
4. Force stop and remove the container:
   
    ````
    $ docker rm -f emailcleaner_app
    ````
      
## Running the tests

Tests should be added soon!

## Deployement

The master branch is automatically deployed on Heroku platform here : https://emailcleaner.herokuapp.com

## Built with

* [NodeJS](https://nodejs.org)
* [Express framework](https://expressjs.com)

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

* **Aektos** - *Initial work* -

See also the list of [contributors](https://github.com/aektos/emailcleaner/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details.