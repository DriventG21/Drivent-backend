import app, { init } from "@/app";
import { redisStartup } from "./utils/redis-startup";

const port = +process.env.PORT || 4000;

init().then(redisStartup).then(() => {
  app.listen(port, () => {
    /* eslint-disable-next-line no-console */
    console.log(`Server is listening on port ${port}.`);
  });
});
