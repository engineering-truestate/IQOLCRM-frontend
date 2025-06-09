// src/firebase.ts
import { initializeApp } from 'firebase/app'
import acnConfig from '../config/acn/firebase.config'
import truestateConfig from '../config/truestate/firebase.config'
import canvasHomesConfig from '../config/canvas-homes/firebase.config'
import vaultConfig from '../config/vault/firebase.config'

const platform = import.meta.env.VITE_PLATFORM || 'canvas-homes'

let firebaseConfig

switch (platform) {
    case 'acn':
        firebaseConfig = acnConfig
        break
    case 'truestate':
        firebaseConfig = truestateConfig
        break
    case 'canvas-homes':
        firebaseConfig = canvasHomesConfig
        break
    case 'vault':
        firebaseConfig = vaultConfig
        break
    default:
        firebaseConfig = acnConfig
}

const app = initializeApp(firebaseConfig)

export default app
