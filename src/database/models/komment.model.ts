import { CallbackWithoutResultAndOptionalError, model, Schema } from "mongoose";
import { IKomment, IKommentInfo, KommentDocument, KommentMethods, KommentModel, KommentPopulatedDocument } from "../../interfaces/komment.interfaces";
import { BenutzerDocument } from "../../interfaces/benutzer.interfaces";

const kommentSchema = new Schema<IKomment, KommentModel, KommentMethods>({
    artikel: { 
        type: Schema.Types.ObjectId,
        ref: 'Artikel'

    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Benutzer'
    },
    body: {
        type: String,
        trim: true, 
        required: [true, 'darf nicht Null sein!'],
        minlength: [10, 'Body muss mindestens 10 Zeichen lang sein'],
        maxlength: [1000, 'Body darf hochstens 1000 Zeichen lang sein'],
    },
    createdAt: {
        type: Schema.Types.Date,
        default: new Date(),
    },
    updatedAt: {
        type: Schema.Types.Date,
        default: new Date(),
    }
}, {  collection: 'kommentar' });

kommentSchema.pre('save', function(this: KommentDocument, next: CallbackWithoutResultAndOptionalError) {
    this!.updatedAt = new Date();
    next();
})
kommentSchema.method('toJSONFor', function(this: KommentPopulatedDocument, benutzer: BenutzerDocument ):IKommentInfo {
    return {
        author: this!.author!.toProfileFor(benutzer ? benutzer : null),
        body: this!.body,
        createdAt: this!.createdAt,
        updatedAt: this!.updatedAt,
        
    }
})
const Komment: KommentModel = model<IKomment, KommentModel>('Komment', kommentSchema);
export default Komment;