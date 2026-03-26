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

async function migrateAttendance() {
  try {
    console.log("Borrando attendance...");
    const atts = await pb.collection('attendance').getFullList({ requestKey: null });
    for (const a of atts) await pb.collection('attendance').delete(a.id);

    const newLocs = await pb.collection('locations').getFullList({ requestKey: null });
    const newEmps = await pb.collection('employees').getFullList({ requestKey: null });

    const oldLocsSnapshot = await getDocs(collection(db, "locations"));
    const oldLocs = {};
    oldLocsSnapshot.docs.forEach(d => oldLocs[d.id] = d.data().name);

    const oldEmpsSnapshot = await getDocs(collection(db, "employees"));
    const oldEmps = {};
    oldEmpsSnapshot.docs.forEach(d => oldEmps[d.id] = d.data().name);

    console.log("Migrando historial de fichajes...");
    const attSnapshot = await getDocs(collection(db, "attendance"));
    for (const doc of attSnapshot.docs) {
      const data = doc.data();
      
      const empName = data.employeeName || oldEmps[data.employeeId] || '';
      const locName = data.locationName || oldLocs[data.locationId] || '';

      const newEmp = newEmps.find(e => e.name === empName);
      const newLoc = newLocs.find(l => l.name === locName);

      if (!newEmp || !newLoc) {
          console.log(`Saltando registro de ${empName} en ${locName} porque no se encontró en PB.`);
          continue;
      }

      try {
        const newRecord = await pb.collection('attendance').create({
          employeeId: newEmp.id,
          employeeName: empName,
          locationId: newLoc.id,
          locationName: locName,
          checkIn: data.checkIn ? new Date(data.checkIn.toDate()).toISOString() : '',
          checkOut: data.checkOut ? new Date(data.checkOut.toDate()).toISOString() : '',
          date: data.date || '',
          status: data.status || 'completed'
        });
        console.log(`Registro migrado: ${empName} (${data.date})`);
        
        // Update current_sessions if this attendance is active
        if (data.status === 'active') {
            const sess = await pb.collection('current_sessions').getFullList({ filter: `employeeId = '${newEmp.id}'`, requestKey: null });
            if (sess.length > 0) {
                await pb.collection('current_sessions').update(sess[0].id, { attendanceId: newRecord.id });
                console.log(`  -> Vinculado a sesión activa`);
            }
        }
      } catch (e) {
        console.error(`Error migrando registro de ${empName}:`, e.message);
      }
    }

    console.log("¡Migración de historial completada!");
    process.exit(0);
  } catch (err) {
    console.error("Error general:", err);
    process.exit(1);
  }
}

migrateAttendance();
