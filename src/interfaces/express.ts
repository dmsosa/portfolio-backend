import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { ArtikelPopulatedDocument } from "./artikel.interfaces";
import { KommentPopulatedDocument } from "./komment.interfaces";
import { BenutzerDocument } from "./benutzer.interfaces";

export interface CustomRequest extends Request {
  profile?: BenutzerDocument;
  auth?: JwtPayload;
  artikel?: ArtikelPopulatedDocument;
  benutzer?: BenutzerDocument;
  komment?: KommentPopulatedDocument;
}
declare module "jsonwebtoken" {
  export interface JwtPayload {
    id: string;
    username: string;
  }
}