import { Strategy as LocalStrategy } from "passport-local";
import Benutzer from "../database/models/benutzer.model";

export const localStrategy = new LocalStrategy(function verify(username, password, cb) {
    Benutzer
    .findOne({username})
    .then((benutzer) => {
        if (!benutzer) {
            return cb(null, false, { message: "Falschen anmelden Daten! "});
        }
        if (!benutzer.validatePassword(password)) {
            return cb(null, false, { message: "Falschen anmelden Daten! "});
        }
        return cb(null, benutzer );

        
    })
    .catch(cb)
})

