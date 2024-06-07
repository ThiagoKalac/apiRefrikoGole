import * as express from "express";

declare global {
  namespace Express {
    interface Request {
        usuario: {
            id: string,
            admin: boolean
        }
    }
  }
}