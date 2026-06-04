# Description 

This is the jPrime companion app as I wanted it to be - clean, usable, simple. It has a lot of potential (i.e. it's unfinished and unpolished af). It uses the latest stable spring boot (4.0.6), PostgreSQL to store the sessions, halls, etc. (so it is usable by other conferences), Vite + React 19 + MUI for the frontend (because <del>that's what everyone uses</del> it's widely adopted and supported). It has tests and Flyway migrations, as well as a **working** compose file that gives you everything you need to run it. 
Features: Obviously, listing the sessions, halls, talks, etc. It also gives you a way to create a "plan" on which talks to visit. 
Currently, the app uses jPrime's API to import the sessions and halls (ImportService)