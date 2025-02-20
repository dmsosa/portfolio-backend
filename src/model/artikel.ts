import {  model, Schema, Types } from "mongoose"

export interface IArtikel {
    slug: string;
    title: string;
    description: string;
    body: string;
    tags: Types.Array<string>;
    favoritesCount: number;
    author: Types.ObjectId;
    comments: Types.Array<Types.ObjectId>
}

const artikelSchema: Schema<IArtikel> = new Schema({
    slug: {
        type: String,
        lowercase: true,
        trim: true, 
        required: [true, 'darf nicht Null sein!'],
        unique: true,
    },
    title: {
        type: String,
        trim: true, 
        required: [true, 'darf nicht Null sein!'],
    },
    description: {
        type: String,
        maxlength: 500,
    },
    body: {
        type: String,
        trim: true, 
        required: [true, 'darf nicht Null sein!'],
    },
    tags: {
        type: [String],
        default: ['react', 'typescript', 'porto']
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Benutzer',
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Komment',
    }]
}, { collection: 'artikeln', timestamps: true });

const Artikel = model<IArtikel>('Artikel', artikelSchema);

export default Artikel