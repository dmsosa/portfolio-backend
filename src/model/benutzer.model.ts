import credential from "credential";
import {   Document, Model, model, Schema, Types } from "mongoose";

type THashObject = {
    hash: string,
    salt: string,
    keyLength: number,
    hashMethod: string,
    iterations: number,
}

export interface IBenutzer {
    username: string;
    email: string;
    bio: string;
    image: string;
    password: string;
    following: Types.Array<Types.ObjectId>;
    favorites: Types.Array<Types.ObjectId>;
    role: 'ADMIN' | 'BENUTZER';
};
export interface IBenutzerInfo {
    username: string;
    email: string;
    bio: string;
    image: string;
    following: boolean;
}
interface BenutzerMethods {
    validatePassword(password: string): boolean;
    setPassword(password: string): void;
    
}

type BenutzerModel = Model<IBenutzer, object, BenutzerMethods>

export type BenutzerDocument<T = object> = Omit< Document<Types.ObjectId, object, IBenutzer> & { _id: Types.ObjectId; } & IBenutzer & BenutzerMethods,keyof T> | null;


const benutzerSchema = new Schema<IBenutzer, BenutzerModel, BenutzerMethods>({
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
      favorites: [
        {
          type: Schema.Types.ObjectId,
          ref : 'Article'
        }
      ],
      following: [
        {
          type: Schema.Types.ObjectId,
          ref : 'User'
        }
      ],
      password     : {
        type: Schema.Types.String,
        required: [true, 'darf nicht Null sein!'],
        validate: {
            validator: async (value: string) => {
                if (value.length < 2) return false;
                return true;
            },
            message: props => `${props.value} is not a valid password.`,
        }
      },
}, { collection: 'benutzer', timestamps: true });



benutzerSchema.method('checkPassword', function(password: string) {
    const pw = credential();
    pw.hash(password, (err, hash) => {
        if (err) throw err;
        console.log(hash);
    })
  return false;
})


benutzerSchema.method('setPassword', function(password: string):void {
    const pw = credential();
    
    pw.hash(password, (err, hash) => {
        if (err) throw err;
        const hashedPass: THashObject = JSON.parse(hash);
        console.log(hashedPass.hash, hashedPass.hashMethod);
        this.password = hashedPass.hash;
        this.save();
    })
})



const Benutzer: BenutzerModel = model<IBenutzer, BenutzerModel>('Benutzer', benutzerSchema);

export default Benutzer;