import { CallbackWithoutResultAndOptionalError,  model, Schema } from "mongoose";
import { checkFields, dateToString, TCheckFieldObject } from "../../helpers/helpers";
import { ArtikelDocument, ArtikelMethods, ArtikelModel, IArtikel } from "../../interfaces/artikel.interfaces";
import { BenutzerDocument } from "./benutzer.model";
import slugify from "slugify";
import { AlreadyExistsError, CustomError } from "../../helpers/customErrors";

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
        minlength: [3, 'Titel muss mindestens 3 Zeichen lang sein'],
        maxlength: [30, 'Titel darf hochstens 30 Zeichen lang sein'],
        unique: true,
    },
    description: {
        type: String,
        minlength: [10, 'Beschreibung muss mindestens 10 Zeichen lang sein'],
        maxlength: [1000, 'Beschreibung darf hochstens 1000 Zeichen lang sein'],
    },
    body: {
        type: String,
        trim: true, 
        required: [true, 'darf nicht Null sein!'],
        minlength: [30, 'Body muss mindestens 30 Zeichen lang sein'],
        maxlength: [30000, 'Body darf hochstens 30000 Zeichen lang sein'],
    },
    tags: {
        type: [String],
        default: ['react', 'typescript', 'porto']
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Benutzer',
    },
    favorites: [{
        type: Schema.Types.ObjectId,
        ref: 'Benutzer',
    }],
    kommentar: [{
        type: Schema.Types.ObjectId,
        ref: 'Komment',
    }],
    createdAt: {
        type: Schema.Types.Date,
        default: new Date(),
    },
    updatedAt: {
        type: Schema.Types.Date,
        default: new Date(),
    }

}, { collection: 'artikeln' });

artikelSchema.pre('save', function(this: ArtikelDocument, next: CallbackWithoutResultAndOptionalError) {
    //Validate fields
    const checkObjectTitle: TCheckFieldObject = {
        name: 'title',
        value: this!.title,
        minLength: 3,
        maxLength: 30,
    };
    const checkObjectSlug: TCheckFieldObject = {
        name: 'slug',
        value: this!.slug,
    };
    const checkObjectBody: TCheckFieldObject = {
        name: 'body',
        value: this!.body,
        minLength: 30,
        maxLength: 30000,
    };
    const checkObjectDescription: TCheckFieldObject = {
        name: 'description',
        value: this!.description,
        minLength: 10,
        maxLength: 1000,
    };

    const checkObjects: TCheckFieldObject[] = [checkObjectTitle, checkObjectSlug, checkObjectBody, checkObjectDescription];
    //Check length correctness
    try {
        checkFields('Artikel', checkObjects)
    } catch (error) {
        next(error as CustomError);
    }
    //Check unique fields
    Artikel.countDocuments({ title: this!.title })
    .then((found) => { if (this!.isNew ? found > 0 : found > 0) { throw new AlreadyExistsError('Artikel', `Es gibt schon ${found} mit title: '${this!.title}'`)}}).catch(next);
    Artikel.countDocuments({ slug: this!.slug })
    .then((found) => { if (this!.isNew ? found > 0 : found > 0) { throw new AlreadyExistsError('Artikel', `Es gibt schon ${found} mit slug: '${this!.slug}'`)}}).catch(next);

    this!.updatedAt = new Date();
    next();
}) 

artikelSchema.pre('validate', function(next: CallbackWithoutResultAndOptionalError): void {
    if (!this.slug) {
        this.generateSlug();
    }
    next();
})
artikelSchema.method('generateSlug', function (): void {
    this.slug = slugify(this.title);
    this.save({validateModifiedOnly: true});
});

artikelSchema.method('toJSONFor', function (this: ArtikelDocument , benutzer: BenutzerDocument) {
    return {
        slug: this!.slug,
        title: this!.title,
        description: this!.description,
        body: this!.body,
        tags: this!.tags,
        favoritesCount: this!.favorites.length,
        isFavorite: benutzer ? false : false,
        author: this!.author?.toProfileFor(benutzer),
        createdAt: dateToString(this!.createdAt),
        updatedAt: dateToString(this!.updatedAt)
    }

})
artikelSchema.method('updateWith', function (this: ArtikelDocument , { title, body, description, tags } : {
    title?: string,
    body?: string,
    description?: string,
    tags?: string,
}) : ArtikelDocument {
    if (title) {
        this!.set("title", title);
        this!.set("slug", slugify(title));
    }
    if (body) {
        this!.set("body", body);
    }
    if (description) {
        this!.set("description", description);
    }
    if (tags) {
        this!.set("tags", tags.split(' '));
    }
    return this;
})

const Artikel: ArtikelModel = model<IArtikel, ArtikelModel>('Artikel', artikelSchema);

export default Artikel;