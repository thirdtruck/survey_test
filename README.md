# Intro

Welcome to the Example Survey Web App!

# Requirements

(See _package.js_ for the specific versions required.)

1. _node.js_ and _npm_.
2. A SQL database (tested with MySQL).

# Installation - Local

1. Retrieve the [latest version ](https://github.com/thirdtruck/survey_test) from GitHub.
    - **$ git clone https://github.com/thirdtruck/survey_test.git survey\_test**
    - **$ cd survey\_test**
2. Run **$ npm install**.
3. Create a new database (e.g. "survey") and a new user with full access to that database.
4. Update _./config/config.json_ to point to the database and user created in the previous step.
5. Start the server, with the option to create example data enabled:
    - **$ CLOBBERWITHEXAMPLES=true node ./bin/www**
6. Open the app in your browser: http://localhost:3000
    - Example login:
        - user: _alice_
        - password: _12345_
7. Enjoy!

# Installation - Heroku

1. Fork the [latest version ](https://github.com/thirdtruck/survey_test) from GitHub.
2. Create a new Heroku instance and link it to that fork.
3. Enable ClearDB support on the instance. You will need the **CLEARDB\_DATABASE\_URL** that will be generated.
4. In the forked repo, update _./config/config.json_ with the database information from the previous step. (This can be done in GitHub's web-based editor.)
5. Update the _Config Variables_ of the Heroku instance.
    - The **CLEARDB_DATABASE_URL** from the earlier step,
    - and **CLOBBERWITHEXAMPLES=true**
6. Deploy the app manually from the _heroku_ branch.
7. After the deploy concludes, remove the **CLOBBERWITHEXAMPLES** config variable from the Heroku instance.
8. Visit the site at its specific URL.
    - Example login:
        - user: _alice_
        - password: _12345_
9. Enjoy!
