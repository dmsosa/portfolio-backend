import express, { Application } from "express";
import routes from "./routes/routes";
import cors from "cors";
import helmet from "helmet";
import { IS_PRODUCTION, PORT } from "./config/secrets";
import { handleErrorDevelopment, handleErrorProduction } from "./helpers/customErrors";
import errorHandler from "errorhandler";
import passport from "passport";
import { localStrategy } from "./middleware/passport";
import logger from "./config/logger";
import "./database"; //database initialization

const app: Application = express();
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
passport.use(localStrategy);
app.use(passport.initialize());
// app.use(passport.session());
app.use(routes);



if (!IS_PRODUCTION) {
    app.use(errorHandler);  
    app.use(handleErrorDevelopment);
} else {
    app.use(handleErrorProduction);
}

app.listen(PORT, () => {
        logger.info('Das API lauft auf http://localhost:' + PORT);
    }).on('error', (error) => {
    logger.error(error);
    console.log(error);
})