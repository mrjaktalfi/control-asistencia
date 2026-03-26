
// Configuración Firebase - Sistema de Asistencia
const firebaseConfig = {
  apiKey: "AIzaSyCQATvoHqEPTgpenBNSav2uBNXjDn4nRXw",
  authDomain: "attendance-40e97.firebaseapp.com",
  projectId: "attendance-40e97",
  storageBucket: "attendance-40e97.firebasestorage.app",
  messagingSenderId: "136574176100",
  appId: "1:136574176100:web:b7f473d849f6341acc4871",
  measurementId: "G-BTZPYS8Y3C"
};

// 1. Expose config globally immediately
window.firebaseConfig = firebaseConfig;

// 2. Attempt immediate initialization
try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      console.log("firebase-config.js: Initializing Firebase App...");
      firebase.initializeApp(firebaseConfig);
    } else {
      console.log("firebase-config.js: App already initialized.");
    }
    
    // Attempt to set global DB reference if Firestore is loaded
    if (firebase.firestore && !window.firestoreDB) {
       window.firestoreDB = firebase.firestore();
       console.log("firebase-config.js: Global firestoreDB set.");
    }
  } else {
    console.warn("firebase-config.js: Firebase SDK not loaded yet.");
  }
} catch (e) {
  console.error("firebase-config.js: Init error:", e);
}
