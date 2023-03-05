const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
let RedisStore = require('connect-redis').default;
const redis = require('redis');
const cors = require('cors');
const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  REDIS_URL,
  SESSION_SECRET,
  REDIS_PORT,
} = require('./config/config');
let redisClient = redis.createClient({
  legacyMode: true,
  socket: {
    host: REDIS_URL,
    port: REDIS_PORT,
  },
});
redisClient.connect().catch(console.error);

const postRouter = require('./routes/postRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;
const connectWithRetry = () => {
  mongoose
    .connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('successfully connected to DB'))
    .catch((e) => {
      console.log(e);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();
app.enable('trust proxy');
app.use(cors({}));
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    saveUninitialized: false,
    cookie: {
      secure: false,
      resave: false,
      httpOnly: true,
      maxAge: 30000,
    },
  })
);
app.use(express.json());

app.get('/api/v1', (req, res) => {
  res.send('<h2>Hi There!!!.</h2>');
  console.log('yeah right');
});
app.use('/api/posts', postRouter);
app.use('/api/users', userRouter);
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}`));
