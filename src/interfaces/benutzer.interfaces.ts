import { Types } from "mongoose";

//Was fur der Frontend als aktuell Benutzer verwendet werden
export interface IBenutzer {
    username: string;
    email: string;
    bio?: string;
    image?: string;
    password: string;
    following?: Types.Array<Types.ObjectId>;
    favorites?: Types.Array<Types.ObjectId>;
    role: 'ADMIN' | 'BENUTZER';
};

export interface IBenutzerInfo  extends IBenutzer {
    token: string;
}
export interface IProfileInfo  extends IBenutzer {
    username: string;
    bio: string;
    image: string;

}

export interface BenutzerMethods {
    validatePassword(password: string): boolean;
    setPassword (password: string): boolean;
    generateJwt(): string;
    toBenutzerInfo(): IBenutzerInfo;
    toProfileFor(): IProfileInfo;
    isFollowing(id: string): boolean;
    follow(id: string): Promise<void>;
    unfollow(id: string): Promise<void>;

}

