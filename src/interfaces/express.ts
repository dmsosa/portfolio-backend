import { Request } from "express";
import { BenutzerDocument } from "../database/models/benutzer.model";
import { JwtPayload } from "jsonwebtoken";
import { ArtikelDocument } from "./artikel.interfaces";

export interface CustomRequest extends Request {
  profile?: BenutzerDocument;
  auth?: JwtPayload;
  artikel?: ArtikelDocument;
}
declare module "jsonwebtoken" {
  export interface JwtPayload {
    id: string;
    username: string;
  }
}