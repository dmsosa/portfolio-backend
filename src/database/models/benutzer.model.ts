import {  model, Schema, Types } from "mongoose";
import { BenutzerDocument, BenutzerMethods, BenutzerModel, IAuthJSON, IBenutzer, IProfileInfo } from "../../interfaces/benutzer.interfaces";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/secrets";
import * as crypto from "crypto";

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
        type: Schema.Types.String,
        default: 'Hallo, ich nutze das Dmblog!',
    },
    image    : {
        type: Schema.Types.String,
        default: 'https://static.productionready.io/images/smiley-cyrus.jpg',
    },
    following: [
        {
            type: Schema.Types.ObjectId,
            ref : 'Benutzer',
            default: [],
        }
    ],
    followers: [
        {
            type: Schema.Types.ObjectId,
            ref : 'Benutzer',
            default: [],
        }
    ],
    favorites: [
        {
            type: Schema.Types.ObjectId,
            ref : 'Artikel',
            default: [],
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
        isFollowing: benutzer ? benutzer.isFollowing(this._id) : false,
        followingCount: this.following? this.following.length : 0,
        followersCount: this.followers? this.followers.length : 0,
    }
})
benutzerSchema.method('isFollowing', function(userId: Types.ObjectId): boolean {
    return this.following!.some((followerId) => followerId.toString() === userId.toString())
})
benutzerSchema.method('follow', function(userId: Types.ObjectId): Promise<BenutzerDocument> {
    if (this.following!.indexOf(userId) === -1) {
        this.following!.push(userId);
        //followers array verandern
        Benutzer.findById(userId).then((followedUser) => {
            if (followedUser?.followers!.indexOf(this.id) === -1) {
                followedUser.followers.push(this.id);
            }
        })
    }
    return this.save({ validateModifiedOnly: true });

})
benutzerSchema.method('unfollow', async function(userId: Types.ObjectId): Promise<BenutzerDocument> {
    if (this.following!.indexOf(userId) !== -1) {
        this.following!.remove(userId);
        //followers array verandern
        Benutzer.findById(userId).then((unfollowedUser) => {
            if (unfollowedUser?.followers!.indexOf(this.id) !== -1) {
                unfollowedUser?.followers!.remove(this.id);
            }
        })
    }
    return this.save({ validateModifiedOnly: true });
})
benutzerSchema.method('isFavorite', function(artikelId: Types.ObjectId): boolean {
    return this.favorites!.some((favId) => favId.toString() === artikelId.toString());
})
benutzerSchema.method('favorite', async function(artikelId: Types.ObjectId): Promise<void> {
    if (this.favorites!.indexOf(artikelId) === -1) {
        this.favorites!.push(artikelId._id);
        this.save({ validateModifiedOnly: true });
        return;
    }
    
    
})
benutzerSchema.method('unfavorite', async function(artikelId: Types.ObjectId): Promise<void> {
    if (!this.favorites) {
        return;
    }
    this.favorites!.remove(artikelId);
    this.save({ validateModifiedOnly: true });
    return;
})

const Benutzer: BenutzerModel = model<IBenutzer, BenutzerModel>('Benutzer', benutzerSchema);

export default Benutzer;