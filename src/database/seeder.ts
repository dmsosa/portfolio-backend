//Seed Data mit Mongoose
//1. Schema erstellen
//2. Die Dateien haben
//3. mongoose.insertMany()
//4. zum Datenbank verbinden
//5. Skript erstellen
//6. 

import mongoose, { Types } from "mongoose";
import logger from "../config/logger";
import { ADMIN, DB, IS_PRODUCTION } from "../config/secrets";
import { benutzerSeed } from "./seed/benutzer.data";
import Artikel from "./models/artikel.model";
import { artikelSeed } from "./seed/artikel.data";
import { kommentSeed } from "./seed/komment.data";
import Komment from "./models/komment.model";
import { BenutzerDocument } from "../interfaces/benutzer.interfaces";
import Benutzer from "./models/benutzer.model";

function getRandomNumberInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function makeFollowers(savedBenutzer: BenutzerDocument[]) {
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
.then( async () => {
    //BENUTZER UND ARTIKELN SETZEN

    if (process.argv[2] == '-d') {
        logger.info("Seeder verbunden! \n DROP COLLECTIONS");
        mongoose.connection.db?.dropCollection('benutzer');
        mongoose.connection.db?.dropCollection('artikeln');
        mongoose.connection.db?.dropCollection('kommentar');
    }
    

    //ADMIN BENUTZER ERSTELLEN;

    const admin = new Benutzer();
    admin.username = ADMIN.USERNAME;
    admin.email = ADMIN.EMAIL;

    admin.setPassword(ADMIN.PASSWORD);
    admin.save();
    Benutzer.insertMany(benutzerSeed)
    .then( (savedBenutzer) =>  {
        //Make followers
        makeFollowers(savedBenutzer);

        
        const allAuthors: Types.ObjectId[] = savedBenutzer.map((benutzer) => benutzer._id);

        artikelSeed.forEach( (art) => {
            const randomIndex = getRandomNumberInRange(0, allAuthors.length - 1);
            const author = allAuthors[randomIndex];
            
            art.author = author;


            //Kommentar setzen

            //Tags zu Array verwalten
            const tagsString = art.tags as string;

            art.tags = tagsString.split(",");
            art.tags.forEach((word) => word.trim());

        });
        Artikel.insertMany(artikelSeed)
        .then((savedArtikel) => {
            //Benutzer Favs 
            savedBenutzer.forEach((benutzer) => {
                
                const favoritenAnzahl = getRandomNumberInRange(6, savedArtikel.length); //zumindest 6 Favoriten Artikeln
                for (let i = 0; i < favoritenAnzahl ; i++) {
                    const randomIndexArtikel = getRandomNumberInRange(0, savedArtikel.length - 1); 
                    const randomArtikel = savedArtikel[randomIndexArtikel];
        
                    benutzer!.favorite(randomArtikel!._id);  
                }
            }); 

            savedArtikel.forEach( async (art) => {
                const kommentAnzahl = getRandomNumberInRange(5, 25);
                const kommentIdArray: Types.ObjectId[] = [];
                for (let i = 0; i < kommentAnzahl ; i++ ) {
                    const randomIndexKomment = getRandomNumberInRange(0, kommentSeed.length - 1);
                    const randomKomment = kommentSeed[randomIndexKomment];
                    const randomIndexAuthors = getRandomNumberInRange(0, allAuthors.length - 1);

                    randomKomment.author = allAuthors[randomIndexAuthors];
                    randomKomment.artikel = art._id;
                    const savedKomment = await Komment.create(randomKomment);
                    kommentIdArray.push(savedKomment.id);
                }
                art.updateOne({ kommentar: kommentIdArray})
            })
            console.log("Datenbank geseedet werden mit artikeln, benutzer und kommentar");
        })
        .catch(err => console.error(err))
    })

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