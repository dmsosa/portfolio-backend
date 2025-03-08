import {   Document, Model, model, Schema, Types } from "mongoose";
import { BenutzerMethods, IAuthJSON, IBenutzer, IProfileInfo } from "../../interfaces/benutzer.interfaces";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/secrets";
import * as crypto from "crypto";
type BenutzerModel = Model<IBenutzer, object, BenutzerMethods>

export type BenutzerDocument<T = object> = Omit< Document<Types.ObjectId, object, IBenutzer> & { _id: Types.ObjectId; } & IBenutzer & BenutzerMethods,keyof T> | null;

export const benutzerSchema = new Schema<IBenutzer, BenutzerModel, BenutzerMethods>({
    username: {
        type: String,
        required: [true, 'darf nicht Null sein!'],
        unique: true,
        match: [/^\w+$/, 'is invalid'],
        index: true,
        validate: {
            validator: async (value: string) => {
                const users = await Benutzer.countDocuments({ username: value}).exec();
                return users < 2;
            },
            message: props => `${props.value} is already taken.`,
        }
    },
    email: {
        type: String,
        required: [true, 'darf nicht Null sein!'],
        unique: true,
        match: [/\S+@\S+\.\S+/, 'ungultig ist'],
        index: true,
        validate: {
            validator: async (value: string) => {
                const users = await Benutzer.countDocuments({ email: value}).exec();
                return users < 2;
            },
            message: props => `${props.value} is already taken.`,
        }
    },
    bio      : {
        type: Schema.Types.String
    },
    image    : {
        type: Schema.Types.String
    },
    following: [
        {
            type: Schema.Types.ObjectId,
            ref : 'User'
        }
    ],
    hash     : {
        type: Schema.Types.String,
    },
    salt     : {
        type: Schema.Types.String,
    },
    role: {
        type: Schema.Types.String,
        enum: ['ADMIN', 'BENUTZER'],
        default: 'BENUTZER',
    }
}, { collection: 'benutzer', timestamps: true });

benutzerSchema.method('validatePassword', function(password: string) {
    const hash = crypto.pbkdf2Sync(password, this.salt!, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
})
benutzerSchema.method('setPassword', function(password: string):void {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
})


benutzerSchema.method('generateJwt', function(): string {

    const today = new Date();
    const expiresAt = new Date(today);
    expiresAt.setDate(today.getDate() + 60);

    return jwt.sign({ 
        id: this._id,
        username: this.username,
        exp: expiresAt.getTime() / 1000,
    }, JWT_SECRET, { algorithm: 'HS256' });
})

benutzerSchema.method('toAuthJSON', function(): IAuthJSON {
    return {
      username: this.username,
      email: this.email,
      image: this.image,
      bio: this.bio,
      token: this.generateJwt(),
    };
})

benutzerSchema.method('toProfileFor', function(benutzer: BenutzerDocument): IProfileInfo {
    return {
        username: this.username,
        image: this.image,
        bio: this.bio,
        following: benutzer ? benutzer.isFollowing(this._id) : false,
    }
})
benutzerSchema.method('isFollowing', function(userId: Types.ObjectId): boolean {
    return this.following!.some((followerId) => followerId.toString() === userId.toString())
})
benutzerSchema.method('follow', function(userId: Types.ObjectId): Promise<BenutzerDocument> {
    if (this.following!.indexOf(userId) === -1) {
        this.following!.push(userId);
    }
    return this.save({ validateModifiedOnly: true });

})
benutzerSchema.method('unfollow', async function(userId: Types.ObjectId): Promise<BenutzerDocument> {
    this.following!.remove(userId);
    return this.save({ validateModifiedOnly: true });
})








const Benutzer: BenutzerModel = model<IBenutzer, BenutzerModel>('Benutzer', benutzerSchema);

export default Benutzer;