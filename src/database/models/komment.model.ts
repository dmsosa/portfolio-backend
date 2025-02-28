import { model, Model, Schema, Types } from "mongoose";

export interface IKomment {
    body: string,
    author: Types.ObjectId,
    artikel: Types.ObjectId,
}

// type KommentMethods = {
// }

const kommentSchema = new Schema<IKomment>({
    body: {
        type: String,
        required: [true, 'darf nicht Leer sein!'],
        maxlength: 2000,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Benutzer',
    },
    artikel: {
        type: Schema.Types.ObjectId,
        ref: 'Artikel',
    }
}, { timestamps: true })



type KommentModel = Model<IKomment>;
const komment: KommentModel = model<IKomment>('Komment', kommentSchema);

export default komment;