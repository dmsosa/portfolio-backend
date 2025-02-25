import {  CallbackWithoutResultAndOptionalError, Document, Model, model, Schema, Types } from "mongoose"
import { slugify } from "../helpers/helpers";
import { IBenutzerInfo } from "./benutzer.model";

export interface IArtikel {
    slug: string;
    title: string;
    description: string;
    content: string;
    tags: Types.Array<string>;
    favoritesCount: number;
    author: Types.ObjectId;
    kommentar: Types.Array<Types.ObjectId>
};
interface ArtikelMethods {
    generateSlug(): void;
};

type ArtikelModel = Model<IArtikel, object, ArtikelMethods>;

export type ArtikelDocument<T = object> = Omit<Document<Types.ObjectId, object, IArtikel> & { _id: Types.ObjectId; } & IArtikel & ArtikelMethods ,keyof T> | null;

export type ArtikelContent = {
    slug: string;
    title: string;
    description: string;
    content: string;
    tags: string[];
    favoritesCount: number;
    isFavorite: boolean;
    author: IBenutzerInfo;
    createdAt: string;
    updatedAt: string;
}
const artikelSchema = new Schema<IArtikel, ArtikelModel, ArtikelMethods>({
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
        validate: {
            validator: async (value: string) => {
                const users = await Artikel.countDocuments({ title: value}).exec();
                return users === 0;
            },
            message: props => `${props.value} is already taken`,
        }
    },
    description: {
        type: String,
        maxlength: 500,
    },
    content: {
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
    kommentar: [{
        type: Schema.Types.ObjectId,
        ref: 'Komment',
    }]
}, { collection: 'artikeln', timestamps: true });

artikelSchema.method('generateSlug', function (): void {
    this.slug = slugify(this.title);
})
artikelSchema.method('generateSlug', function (): void {
    this.slug = slugify(this.title);
})

artikelSchema.pre('validate', function(next: CallbackWithoutResultAndOptionalError): void {
    if (!this.slug) {
        this.generateSlug();
    }
    next();
})
const Artikel: ArtikelModel = model<IArtikel, ArtikelModel>('Artikel', artikelSchema);

export default Artikel;