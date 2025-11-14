import * as carpetaService from '../services/carpetesService.js'

function checkAutenticat(req, res) {
    if (!req.user || !req.user.id) {
        res.status(401).json({ error: "Usuari no autenticat "})
        return false
    }
    return true
}
export async function llistaCarpetes(req, res) {
    if (!checkAutenticat(req, res)) return

    try {
        const userId = req.user.id
        const carpetes = await carpetaService.getCarpetesByUserId(userId)
        res.json({ carpetes })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error recuperant carpetes' })
    }
}

export async function afegeixCarpeta(req, res) {
    if (!checkAutenticat(req, res)) return
    
    try {
        const userId = req.user.id
        const { nom } = req.body
        if (!nom) 
            return res.status(400).json({ error: 'Nom de carpeta requerit' })

        const carpeta = await carpetaService.creaCarpeta(userId, nom)
        res.status(201).json({ carpeta })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error creant carpeta' })
    }
}

export async function eliminaCarpeta(req, res) {
  try {
    const userId = req.user.id;
    const { carpetaId } = req.params;

    const result = await carpetaService.eliminaCarpeta(userId, carpetaId);

    if (!result) return res.status(404).json({ error: "Carpeta no trobada" });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error eliminant carpeta" });
  }
}