//Seed Data mit Mongoose
//1. Schema erstellen
//2. Die Dateien haben
//3. mongoose.insertMany()
//4. zum Datenbank verbinden
//5. Skript erstellen
//6. 

import mongoose, { Types } from "mongoose";
import logger from "../config/logger";
import { DB, IS_PRODUCTION } from "../config/secrets";
import Benutzer, { BenutzerDocument } from "./models/benutzer.model";
import { benutzerSeed } from "./seed/benutzer.data";
import Artikel from "./models/artikel.model";
import { artikelSeed } from "./seed/artikel.data";
import { kommentSeed } from "./seed/komment.data";

function getRandomNumberInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function makeFollowers(savedBenutzer: BenutzerDocument[]) {
    const lastArrayIndex = savedBenutzer.length - 1;
        
    savedBenutzer.forEach((benutzer) => {
        const min = getRandomNumberInRange(0, lastArrayIndex);
        const max = getRandomNumberInRange(min, lastArrayIndex);
        const randomBenutzer: BenutzerDocument[] = savedBenutzer.slice(min, max);
        randomBenutzer.forEach((rand) => {
            benutzer!.follow(rand?.id);
        })
    })
}


const DB_URI = `mongodb://${DB.HOST}:${DB.PORT}/${DB.NAME}`;

const options = { 
    autoIndex         : true,
    connectTimeoutMS  : 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS   : 45000, // Close sockets after 45 seconds of inactivity
    user: IS_PRODUCTION ? DB.USER : undefined,
    pass: IS_PRODUCTION ? DB.PASSWORD : undefined,
}

logger.debug("Seeding");

mongoose.connect(DB_URI, options)
.then( async (mongoose) => {
    //BENUTZER UND ARTIKELN SETZEN
    logger.info("Seeder verbunden!");
    mongoose.connection.db?.dropCollection('benutzer');
    mongoose.connection.db?.dropCollection('artikeln');
    mongoose.connection.db?.dropCollection('kommentar');
        Benutzer.insertMany(benutzerSeed)
        .then((savedBenutzer) => {
            //Make followers
            makeFollowers(savedBenutzer);

            const randomAuthors: Types.ObjectId[] = savedBenutzer.map((benutzer) => benutzer._id);

            artikelSeed.forEach((art) => {
                const randomIndex = getRandomNumberInRange(0, randomAuthors.length - 1);
                const author = randomAuthors[randomIndex];

                art.author = author;

                const tagsString = art.tags as string;

                art.tags = tagsString.split(",");
                art.tags.forEach((word) => word.trim());
            });
            return Artikel.insertMany(artikelSeed)
            .then((savedArtikel) => {
                kommentSeed.forEach((komm) => {
                    const randomIndexAuthors = getRandomNumberInRange(0, randomAuthors.length - 1);
                    const randomIndexArtikeln = getRandomNumberInRange(0, savedArtikel.length - 1);

                    const randomArtikel = savedArtikel[randomIndexArtikeln];
                    komm.author = randomAuthors[randomIndexAuthors];
                    
                    randomArtikel.kommentErstellen(komm);
                    
                })
                console.log("Datenbank geseedet werden mit artikeln, benutzer und kommentar");

            })
            .catch(err => console.error(err));
        })
        mongoose.disconnect();
})
.catch((e) => {
logger.info('Mongoose konnte nicht bei Seeding vebindet werden');
logger.error(e);
});

mongoose.connection.on('connected', () => {
    logger.info("Datenbank Verbindung offnet bei Seeding auf:  " + DB_URI + "!" );

});

mongoose.connection.on('disconnected', () => {
    logger.info('Mongoose Geseedet werdet');
});

mongoose.connection.on('error', (err) => {
    logger.error('Mongoose Verbindungsfehler bei der Seeding: ' + err);
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
    mongoose.connection.close(true);
});
