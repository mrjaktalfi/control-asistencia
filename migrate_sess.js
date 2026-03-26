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

async function migrateSess() {
  try {
    console.log("Borrando current_sessions...");
    const sess = await pb.collection('current_sessions').getFullList();
    for (const s of sess) await pb.collection('current_sessions').delete(s.id);

    // I need to map the old IDs to the new IDs.
    // Let's fetch the new locations and employees to map them by name.
    const newLocs = await pb.collection('locations').getFullList();
    const newEmps = await pb.collection('employees').getFullList();

    // Fetch old locations and employees to get their names
    const oldLocsSnapshot = await getDocs(collection(db, "locations"));
    const oldLocs = {};
    oldLocsSnapshot.docs.forEach(d => oldLocs[d.id] = d.data().name);

    const oldEmpsSnapshot = await getDocs(collection(db, "employees"));
    const oldEmps = {};
    oldEmpsSnapshot.docs.forEach(d => oldEmps[d.id] = d.data().name);

    console.log("Migrando sesiones actuales...");
    const sessSnapshot = await getDocs(collection(db, "current_sessions"));
    for (const doc of sessSnapshot.docs) {
      const data = doc.data();
      
      const empName = data.name || oldEmps[data.empId] || '';
      const locName = oldLocs[data.locationId] || '';

      const newEmp = newEmps.find(e => e.name === empName);
      const newLoc = newLocs.find(l => l.name === locName);

      if (!newEmp || !newLoc) {
          console.log(`Saltando sesión de ${empName} en ${locName} porque no se encontró en PB.`);
          continue;
      }

      try {
        await pb.collection('current_sessions').create({
          employeeId: newEmp.id,
          employeeName: empName,
          locationId: newLoc.id,
          locationName: locName,
          startTime: data.checkIn ? new Date(data.checkIn.toDate()).toISOString() : new Date().toISOString(),
          status: 'active'
        });
        console.log(`Sesión migrada: ${empName}`);
      } catch (e) {
        console.error(`Error migrando sesión de ${empName}:`, e.message);
      }
    }

    console.log("¡Migración de sesiones completada!");
    process.exit(0);
  } catch (err) {
    console.error("Error general:", err);
    process.exit(1);
  }
}

migrateSess();
