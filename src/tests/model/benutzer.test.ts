import { describe } from "mocha";
import Benutzer from "../../database/models/benutzer.model";
import { expect } from "chai";

describe('BenutzerModel Test', () => {
    it('Sollte alle Benutzer finden', () => {
        Benutzer.find().then((benutzerData) => {
            console.log( '\n------------- o ------------', benutzerData.length, '------------- o ------------\n');
            expect(benutzerData, 'expekt NACHRIICHT').to.have.length(28);
            })
            .catch((error) => {
                console.log( '\n------------- o ------------', ':(', '------------- o ------------\n');

            })
    })
    
})

