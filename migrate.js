import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
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
const pb = new PocketBase('https://api.fichajes.believ3.top/');

async function migrate() {
  try {
    console.log("Migrando locales...");
    const locSnapshot = await getDocs(collection(db, "locations"));
    for (const doc of locSnapshot.docs) {
      const data = doc.data();
      try {
        await pb.collection('locations').create({
          name: data.name || '',
          address: data.address || '',
          active: data.active !== undefined ? data.active : true,
          color: data.color || ''
        });
        console.log(`Local migrado: ${data.name}`);
      } catch (e) {
        console.error(`Error migrando local ${data.name}:`, e.message);
      }
    }

    console.log("Migrando empleados...");
    const empSnapshot = await getDocs(collection(db, "employees"));
    for (const doc of empSnapshot.docs) {
      const data = doc.data();
      try {
        await pb.collection('employees').create({
          name: data.name || '',
          position: data.position || '',
          active: data.active !== undefined ? data.active : true,
          avatar: data.avatar || ''
        });
        console.log(`Empleado migrado: ${data.name}`);
      } catch (e) {
        console.error(`Error migrando empleado ${data.name}:`, e.message);
      }
    }

    console.log("Migrando sesiones actuales...");
    const sessSnapshot = await getDocs(collection(db, "current_sessions"));
    for (const doc of sessSnapshot.docs) {
      const data = doc.data();
      try {
        await pb.collection('current_sessions').create({
          employeeId: data.employeeId || '',
          employeeName: data.employeeName || '',
          locationId: data.locationId || '',
          locationName: data.locationName || '',
          startTime: data.startTime ? new Date(data.startTime.toDate()).toISOString() : new Date().toISOString(),
          status: data.status || ''
        });
        console.log(`Sesión migrada: ${data.employeeName}`);
      } catch (e) {
        console.error(`Error migrando sesión de ${data.employeeName}:`, e.message);
      }
    }

    console.log("¡Migración completada con éxito!");
    process.exit(0);
  } catch (err) {
    console.error("Error general de migración:", err);
    process.exit(1);
  }
}

migrate();
