const fs = require('fs');
let code = fs.readFileSync('index.tsx', 'utf8');

const oldToggle = `            if (existingSession) {
                // CHECK OUT
                // 1. Update the permanent attendance record
                if (existingSession.attendanceId) {
                    await db.collection('attendance').doc(existingSession.attendanceId).update({
                        checkOut: new Date().toISOString(),
                        status: 'completed'
                    });
                }
                // 2. Remove from active sessions
                await db.collection('current_sessions').doc(empId).delete();
                showToast(\`Salida registrada: \${employeeName}\`, 'info');

            } else {
                if (!emp) return; // Cannot check in if we don't have employee data
                // CHECK IN
                // 1. Create a permanent attendance record
                const newAttendanceRef = db.collection('attendance').doc();
                const now = new Date(); // Use client date for immediate UI, server timestamp for DB
                
                await newAttendanceRef.set({
                    employeeId: empId,
                    employeeName: emp.name,
                    locationId: selectedLocation?.id,
                    locationName: selectedLocation?.name,
                    checkIn: new Date().toISOString(),
                    date: now.toISOString().split('T')[0],
                    status: 'active'
                });

                // 2. Add to active sessions for quick lookup
                await db.collection('current_sessions').doc(empId).set({
                    empId: empId,
                    name: emp.name,
                    checkIn: new Date().toISOString(),
                    locationId: selectedLocation?.id,
                    attendanceId: newAttendanceRef.id
                });
                
                showToast(\`Entrada registrada: \${emp.name}\`, 'success');
            }`;

const newToggle = `            if (existingSession) {
                // CHECK OUT
                // 1. Update the permanent attendance record
                if (existingSession.attendanceId) {
                    await pb.collection('attendance').update(existingSession.attendanceId, {
                        checkOut: new Date().toISOString(),
                        status: 'completed'
                    });
                }
                // 2. Remove from active sessions
                await pb.collection('current_sessions').delete(existingSession.id);
                showToast(\`Salida registrada: \${employeeName}\`, 'info');

            } else {
                if (!emp) return; // Cannot check in if we don't have employee data
                // CHECK IN
                // 1. Create a permanent attendance record
                const now = new Date();
                
                const newAttendance = await pb.collection('attendance').create({
                    employeeId: empId,
                    employeeName: emp.name,
                    locationId: selectedLocation?.id,
                    locationName: selectedLocation?.name,
                    checkIn: new Date().toISOString(),
                    date: now.toISOString().split('T')[0],
                    status: 'active'
                });

                // 2. Add to active sessions for quick lookup
                await pb.collection('current_sessions').create({
                    empId: empId,
                    name: emp.name,
                    checkIn: new Date().toISOString(),
                    locationId: selectedLocation?.id,
                    attendanceId: newAttendance.id
                });
                
                showToast(\`Entrada registrada: \${emp.name}\`, 'success');
            }`;

code = code.replace(oldToggle, newToggle);
fs.writeFileSync('index.tsx', code);
