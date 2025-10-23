import * as carpetaModel from '../models/carpetes.js'

export async function llistaCarpetes(req, res) {
    try {
        const userId = req.user.id
        const carpetes = await carpetaModel.getCarpetaByUserId(userId)
        res.json({ carpetes })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error recuperant carpetes' })
    }
}

export async function afegeixCarpeta(req, res) {
    try {
        const userId = req.user.id
        const { nom } = req.body
        if (!nom) 
            return res.status(400).json({ error: 'Nom de carpeta requerit' })

        const carpeta = await carpetaModel.creaCarpeta(userId, nom)
        res.status(201).json({ carpeta })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error creant carpeta' })
    }
}