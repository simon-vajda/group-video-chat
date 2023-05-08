# Group Video Chat

## How to run

### Docker Compose

The easiest way to run it is to use Docker. The `docker-compose up -d` command will build and run the containers. If everything was successful then you can access the app on http://localhost:8080/.

You can rebuild the containers with `docker-compose build` after changing something in the source code. To stop the running stack use `docker-compose down`.

Don't forget to change the **JWT_SECRET** variable in the `.env` file if you are hosting the application in production.
