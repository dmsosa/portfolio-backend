import mongoose from "mongoose";
import config from "../config/config";

const enviroment = process.env.NODE_ENV || "development";

const { dbUri } = config[enviroment];
main().then(() => { console.log("MongoDB Verbunden!")});

async function main() {
    if (!dbUri) {
        throw new Error("Kein Dateibank Verbindung!")
    }
    await mongoose.connect(dbUri);
}
