import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";
import PocketBase from 'pocketbase';

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
    const attSnapshot = await getDocs(query(collection(db, "attendance"), limit(1)));
    console.log("Attendance count:", attSnapshot.size);
    if (attSnapshot.size > 0) {
        console.log(attSnapshot.docs[0].data());
    }
    process.exit(0);
}
check();
