# Description 

This is the jPrime companion app as I wanted it to be - clean, usable, simple. It has a lot of potential (i.e. it's
unfinished and unpolished af). It uses the latest stable Spring Boot (4.0.6) and Java 25. The PostgreSQL database is
used to store the sessions, halls, etc. (so the app can be made usable by other conferences eventually). The frontend
uses Vite + React 19 + MUI (because <del>that's what everyone uses</del> it's widely adopted and supported). The app has
tests and Flyway migrations, as well as a **working** docker compose file that gives you everything you need to run it.
Features: Obviously, listing the sessions, halls, talks, etc. It also gives you a way to create a "plan" on which talks
to visit.
Currently, the app uses jPrime's API to import the sessions, speakers, and halls (ImportService). Let's see how far it
gets in terms of features before the deadline