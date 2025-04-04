import { Document, MergeType, Model, Types } from "mongoose";
import { BenutzerDocument } from "../database/models/benutzer.model";
import { IProfileInfo } from "./benutzer.interfaces";

export interface IKomment {
    artikel: Types.ObjectId,
    author: Types.ObjectId,
    body: string,
    createdAt: Date,
    updatedAt: Date,
}

export type TKommentInput = {
    artikel?: Types.ObjectId,
    author?: Types.ObjectId,
    body: string,
}

export interface IPopulatedKomment {
    author: BenutzerDocument,
}

export interface IKommentInfo {
    author: IProfileInfo,
    body: string,
    createdAt: Date,
    updatedAt: Date,
}

export type KommentModel = Model<IKomment>;

export type KommentDocument = (Document<Types.ObjectId, object, IKomment> & Omit<IKomment, 'author'> & Pick<IPopulatedKomment, "author"> & { _id: Types.ObjectId; }) | null;

export type KommentPopulatedDocument = (Document<Types.ObjectId, object, MergeType<IKomment, Pick<IPopulatedKomment, "author">>> & Omit<IKomment, 'author'> & Pick<IPopulatedKomment, "author"> & { _id: Types.ObjectId; }) | null;