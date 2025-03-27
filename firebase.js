import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Aquí van tus credenciales de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDB-MLE6kAf-lZ4dPzrb2r4pAYWmaMY_bU",
    authDomain: "juego-a3f6a.firebaseapp.com",
    projectId: "juego-a3f6a",
    storageBucket: "juego-a3f6a.firebasestorage.app",
    messagingSenderId: "391467828990",
    appId: "1:391467828990:web:03307414dc923f499ac7af"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, addDoc, collection };