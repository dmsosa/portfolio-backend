import mongoose from "mongoose";
import { DB, IS_PRODUCTION } from "../config/secrets";
import logger from "../config/logger";

const DB_URI = `mongodb://${DB.HOST}:${DB.PORT}/${DB.NAME}`;

const options = { 
    autoIndex         : true,
    connectTimeoutMS  : 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS   : 45000, // Close sockets after 45 seconds of inactivity
    user: IS_PRODUCTION ? DB.USER : undefined,
    pass: IS_PRODUCTION ? DB.PASSWORD : undefined,
}

logger.debug("zum Datenbank verbinden auf: " + DB_URI + DB.NAME );


mongoose.connect(DB_URI, options)
.then(() => {
    logger.info('Mongoose verbunden! :)');
  })
  .catch((e) => {
    logger.info('Mongoose konnte nicht vebindet werden');
    logger.error(e);
  });

mongoose.connection.on('connected', () => {
    logger.info("Datenbank Verbindung offnet auf:  " + DB_URI + "!" );

});

mongoose.connection.on('disconnected', () => {
    logger.info('Mongoose Verbindung ausgeschaltet');
});

mongoose.connection.on('error', (err) => {
    logger.error('Mongoose Verbindungsfehler: ' + err);
  });

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
    mongoose.connection.close(true);
});
