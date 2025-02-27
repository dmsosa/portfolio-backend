import { Strategy as LocalStrategy } from "passport-local";
import Benutzer from "../model/benutzer.model";

export const localStrategy = new LocalStrategy(function verify(username, password, cb) {
    Benutzer.findOne({username}).then((benutzer) => {
        if (!benutzer) {
            cb(null, false, { message: "Falschen anmelden Daten! "});
        } else {
            if (!benutzer.checkPassword(password)) {
                cb(null, false, { message: "Falschen anmelden Daten! "})
            }
            cb(null, benutzer);
        }
    }).catch((err) => cb(err))
})

