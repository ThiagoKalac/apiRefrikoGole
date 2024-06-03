import { Request, Response, NextFunction } from "express";
import { AppError } from "./appError";

const tratarError = async (error: Error,req: Request,res: Response,next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ mensagem: error.message });
  }

  console.error(error);

  return res.status(500).json({ mensagem: "Erro interno da aplicação" });
};

export {tratarError};