# Good app name frontend

We don't care about this. It's **just**  the frontend.
Since we are not doing a serious development, this should be run behind nginx, because we expect the backend to be proxied.

Just run the docker compose.

If you insist on touching the frontend while you touch the backend, you can do this:

```shell
npm i
npm run dev
```

You should edit vite.config.ts to set the backend's location.

