import express from "express";
import routes from "./routes/routes";
import { connect } from "mongoose";
import configObject from "./config/config";

const app = express();

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || "development";
const { dbUri } = configObject[ENV];

app.use(express.json())

const artikelnRoute = express.Router();
artikelnRoute.get("/", (req, res) => {
    res.send("Hallo");
})
//监听端口



app.use(routes);

connect(dbUri as string).then(() => {
    app.listen(PORT, () => {
        console.log('Das API lauft auf http://localhost:' + PORT);
    })
}).catch((error) => {
    console.log(error)
})