const fs = require('fs');

let content = fs.readFileSync('index.tsx', 'utf8');

// Replace empId with employeeId in current_sessions references
content = content.replace(/s\.empId === empId/g, "s.employeeId === empId");
content = content.replace(/s\.empId === emp\.id/g, "s.employeeId === emp.id");
content = content.replace(/toggleAttendance\(session\.empId\)/g, "toggleAttendance(session.employeeId)");

// Replace session.name with session.employeeName
content = content.replace(/session\.name/g, "session.employeeName");
content = content.replace(/sessionEmp\.name/g, "sessionEmp.employeeName");

// Replace session.checkIn with session.startTime
content = content.replace(/session\.checkIn/g, "session.startTime");

// Replace the creation of current_sessions
content = content.replace(/empId: empId,\n\s*name: emp\.name,\n\s*checkIn: new Date\(\)\.toISOString\(\),\n\s*locationId: selectedLocation\?\.id,\n\s*attendanceId: newAttendance\.id/g, 
`employeeId: empId,
                    employeeName: emp.name,
                    startTime: new Date().toISOString(),
                    locationId: selectedLocation?.id,
                    locationName: selectedLocation?.name,
                    status: 'active',
                    attendanceId: newAttendance.id`);

fs.writeFileSync('index.tsx', content);
console.log('Replaced session fields');
