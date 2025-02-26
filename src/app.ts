import express from "express";
import routes from "./routes/routes";
import { connect } from "mongoose";
import configObject from "./config/config";
import { handleErrorDevelopment, handleErrorProduction } from "./helpers/customErrors";
import errorHandler from "errorhandler";
import "./middleware/passport"; //initialize passport
import passport from "passport";
import { localStrategy } from "./middleware/passport";

const app = express();

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || "development";
const { dbUri } = configObject[ENV];

const isProd = ENV === "production";


app.use(express.json())
passport.use(localStrategy);
app.use(passport.initialize());
// app.use(passport.session());
app.use(routes);



if (!isProd) {
    app.use(errorHandler);  
    app.use(handleErrorDevelopment);
} else {
    app.use(handleErrorProduction);
}

connect(dbUri as string).then(() => {
    app.listen(PORT, () => {
        console.log('Das API lauft auf http://localhost:' + PORT);
    })
}).catch((error) => {
    console.log(error)
})