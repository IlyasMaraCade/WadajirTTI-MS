const fs = require('fs');
let s = fs.readFileSync('backend/src/modules/portal-principal/principalPortal.controller.ts', 'utf8');
s = s.replace(/import \{ ApiResponse \}\\r?\\nimport \{ ApiError \} from '..\\/..\\/utils\\/ApiError'; from '..\\/..\\/utils\\/ApiResponse';/g, \"import { ApiResponse } from '../../utils/ApiResponse';\\nimport { ApiError } from '../../utils/ApiError';\");
fs.writeFileSync('backend/src/modules/portal-principal/principalPortal.controller.ts', s, 'utf8');
