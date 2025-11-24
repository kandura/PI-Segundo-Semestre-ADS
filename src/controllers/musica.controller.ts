import type { Request,Response } from "express";
import { MusicRepository } from "../repositories/musica.repository.js";

export const MusicaController = {

    //rota responde ao metodo GET, lista musicas, podendo filtrar por genero
    async listar(req: Request, res: Response){
    
    try {
        const genero = 
        typeof req.query.genero === "string" ? req.query.genero : undefined;

        const musics = await MusicRepository.findAll(genero);
        return res.json(musics);
    } catch (error){
        console.error("Erro ao listar músicas:", error);
        return res.status(500).json({message : "Erro ao listar músicas"});
    }
    },

    async criar(req: Request, res: Response) {
        try {
            const{ titulo, artista, genero} = req.body ?? {};

            if (!titulo || !artista || !genero) {
                return res.status(400).json({
                    message:"Campos obrigatórios: titulo, artista, genero",
                });
            }

            const music = await MusicRepository.create({ titulo, artista, genero });
            return res.status(201).json(music);
        } catch (error){
            console.error("Erro ao criar música", error);
            return res.status(500).json({message: "Erro ao criar música"});
        }

    },

};