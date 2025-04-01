import { Request } from "express";
import { BenutzerDocument } from "../database/models/benutzer.model";
import { JwtPayload } from "jsonwebtoken";
import { ArtikelPopulatedDocument } from "./artikel.interfaces";

export interface CustomRequest extends Request {
  profile?: BenutzerDocument;
  auth?: JwtPayload;
  artikel?: ArtikelPopulatedDocument;
}
declare module "jsonwebtoken" {
  export interface JwtPayload {
    id: string;
    username: string;
  }
}