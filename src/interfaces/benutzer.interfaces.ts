import { Document, Model, Types } from "mongoose";



export interface IBenutzer {
    username: string;
    email: string;
    bio: string;
    image: string;
    hash?: string;
    salt?: string;
    following?: Types.Array<Types.ObjectId>;
    favorites?: Types.Array<Types.ObjectId>;
    role: 'ADMIN' | 'BENUTZER';
};

//Was fur der Frontend als aktuell Benutzer verwendet werden
export interface IAuthJSON {
    username: string;
    email: string;
    bio: string;
    image: string;
    token: string;
}
export interface IProfileInfo {
    username: string;
    bio: string;
    image: string;
    following: boolean;
}

export interface BenutzerMethods {
    validatePassword(password: string): boolean;
    setPassword (password: string): boolean;
    generateJwt(): string;
    toAuthJSON(): IAuthJSON;
    toProfileFor(benutzer: BenutzerDocument): IProfileInfo;
    isFollowing(benutzerId: Types.ObjectId): boolean;
    follow(benutzerId: Types.ObjectId): Promise<BenutzerDocument>;
    unfollow(benutzerId: Types.ObjectId): Promise<BenutzerDocument>;
    isFavorite(artikelId: Types.ObjectId): boolean;
    favorite(artikelId: Types.ObjectId): Promise<void>;
    unfollowfavorite(artikelId: Types.ObjectId): Promise<void>;
}

export type BenutzerModel = Model<IBenutzer, object, BenutzerMethods>

export type BenutzerDocument<T = object> = Omit< Document<Types.ObjectId, object, IBenutzer> & { _id: Types.ObjectId; } & IBenutzer & BenutzerMethods,keyof T> | null;

