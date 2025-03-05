import { MergeType,  Model, Types } from "mongoose";
import { IProfileInfo } from "./benutzer.interfaces";
import { Document } from "mongoose";
import { BenutzerDocument } from "../database/models/benutzer.model";
// 1. Create an interface representing a document in MongoDB.
//An interface describing how the data is saved in MongoDB

export interface IArtikel {
    slug: string;
    title: string;
    description: string;
    body: string;
    tags: Types.Array<string>;
    author: Types.ObjectId;
    favorites: Types.Array<Types.ObjectId>;
    kommentar: Types.Array<Types.ObjectId>;
    createdAt: Date;
    updatedAt: Date;
};

export interface IPopulatedArtikel {
    author: BenutzerDocument;
}
// 2. Create a Schema corresponding to the document interface. In artikel.model.ts
// 3. Create a Model. In artikel.model.ts



export interface ArtikelMethods {
    generateSlug(): void;
    toJSONFor(benutzer: BenutzerDocument): Promise<IArtikelInfo>;
    updateWith({ title, body, description, tags }: { title: IArtikel['title'], body: IArtikel['body'], description: IArtikel['description'], tags: string }): ArtikelDocument;
    isFavorite(benutzerId: Types.ObjectId): boolean;
    favorite(benutzerId: Types.ObjectId): Promise<void>;
    unfavorite(benutzerId: Types.ObjectId): Promise<void>;
};

export type IArtikelInfo = {
    slug: string;
    title: string;
    description: string;
    body: string;
    tags: string[];
    favoritesCount: number;
    isFavorite: boolean;
    author: IProfileInfo;
    createdAt: string;
    updatedAt: string;
}

export type ArtikelModel = Model<IArtikel, object, ArtikelMethods>;

export type ArtikelDocument = (
    Document<Types.ObjectId, object, MergeType<IArtikel, Pick<IPopulatedArtikel, "author">>> &  Omit<Omit<IArtikel, "author"> & Pick<IPopulatedArtikel, "author"> & { _id: Types.ObjectId; }, keyof ArtikelMethods> & ArtikelMethods)
| null;
