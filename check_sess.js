import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQATvoHqEPTgpenBNSav2uBNXjDn4nRXw",
  authDomain: "attendance-40e97.firebaseapp.com",
  projectId: "attendance-40e97",
  storageBucket: "attendance-40e97.firebasestorage.app",
  messagingSenderId: "136574176100",
  appId: "1:136574176100:web:b7f473d849f6341acc4871",
  measurementId: "G-BTZPYS8Y3C"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
    const sessSnapshot = await getDocs(collection(db, "current_sessions"));
    for (const doc of sessSnapshot.docs) {
      console.log(doc.id, doc.data());
    }
    process.exit(0);
}
check();
