import { Router } from "express";
import { MusicaController } from "../controllers/musica.controller.js";

export const musicaRouter =  Router();

musicaRouter.get("/musics", MusicaController.listar);

musicaRouter.post("/musics", MusicaController.criar);

export default musicaRouter;