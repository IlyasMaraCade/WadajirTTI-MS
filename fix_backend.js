const fs = require('fs');
let s = fs.readFileSync('backend/src/server.ts', 'utf8');
s = s.replace(/username: 'register', password: 'register123'/g, \"username: 'wadajir', password: 'wadajir123'\");
s = s.replace(/username: 'wadajir', password: '123456'/g, \"username: 'teacher', password: 'teacher123'\");
fs.writeFileSync('backend/src/server.ts', s, 'utf8');
console.log('Credentials updated.');

let pRoutes = fs.readFileSync('backend/src/modules/portal-principal/principalPortal.routes.ts', 'utf8');
pRoutes = pRoutes.replace(/USER_ROLES\.PRINCIPAL, USER_ROLES\.SUPER_ADMIN/g, \"USER_ROLES.PRINCIPAL, USER_ROLES.SUPER_ADMIN, USER_ROLES.REGISTRATION\");
if (!pRoutes.includes('/exams/marks')) {
  pRoutes = pRoutes.replace(
    \"router.post('/exams', principalPortalController.createExam);\",
    \"router.post('/exams', principalPortalController.createExam);\\nrouter.post('/exams/marks', principalPortalController.enterMarks);\"
  );
}
fs.writeFileSync('backend/src/modules/portal-principal/principalPortal.routes.ts', pRoutes, 'utf8');
console.log('principalPortal.routes.ts updated.');

let adminRoutes = fs.readFileSync('backend/src/modules/admin/admin.routes.ts', 'utf8');
adminRoutes = adminRoutes.replace(
  /router.get\\('\\/attendance', authorize\\(USER_ROLES.SUPER_ADMIN, USER_ROLES.PRINCIPAL\\)/g,
  \"router.get('/attendance', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.PRINCIPAL, USER_ROLES.REGISTRATION)\"
);
adminRoutes = adminRoutes.replace(
  /router.get\\('\\/marks', authorize\\(USER_ROLES.SUPER_ADMIN, USER_ROLES.PRINCIPAL\\)/g,
  \"router.get('/marks', authorize(USER_ROLES.SUPER_ADMIN, USER_ROLES.PRINCIPAL, USER_ROLES.REGISTRATION)\"
);
fs.writeFileSync('backend/src/modules/admin/admin.routes.ts', adminRoutes, 'utf8');
console.log('admin.routes.ts updated.');
