Friendville
===========

Friendville is a web dashboard for keeping up with friends and colleagues. 

Detailed Description
-------------------
Developed with the MEAN-stack, it uses Node.js child processes and OAuth to connect asynchronously with the Twilio, Facebook and Twitter APIs allowing users to communicate with friends and colleagues via phone and social media all in one easy to use interface. Authentication and sessions are handled with PassportJS, Facebook OAuth 2.0 and Twitter OAuth 1.0. During initial development, user data and game data were stored in Redis, but this data was ultimately migrated to MongoDB to make use of Mongoose's schemas and relational data capabilities. The front-end utilizes Angular.js and takes advantage of ngFX and angucomplete modules to provide users with an interactive experience that, when combined with the game mechanics, incentives users to stay in touch with their social network. 

Config Requirements
-------------
This repo expects certain API keys to be present in a config.js file.  To connect to Facebook and Twitter APIs and to use the built-in OAuth authentication, one will need to register their app with Twitter and Facebook to receive OAuth Keys.  One will also need to register with Twilio to acquire Twilio API keys and will need to pay for an account if they wish to text anyone other than themselves. 

