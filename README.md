# heroku-k6
Install k6.io on Heroku

## Quick Start

1. Locally, clone and deploy this repository to your Heroku app or click on the Heroku Button

    [![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

    ```shell
    git clone https://github.com/abernicchia-heroku/heroku-k6.git
    heroku git:remote --app HEROKU_APPNAME
    heroku apps:stacks:set --app HEROKU_APPNAME container
    git push heroku main
    ```
