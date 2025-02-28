import { Request } from "express";
import { BenutzerDocument } from "../database/models/benutzer.model";

export interface CustomRequest extends Request {
  profile?: BenutzerDocument;
}