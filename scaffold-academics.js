const fs = require('fs');
const path = require('path');

const models = ['AcademicYear', 'Term', 'Class', 'Section', 'Subject'];

const moduleDir = path.join(__dirname, 'backend/src/modules/academics');
if (!fs.existsSync(moduleDir)) {
  fs.mkdirSync(moduleDir, { recursive: true });
}

models.forEach(model => {
  const lowerModel = model.charAt(0).toLowerCase() + model.slice(1);
  
  // Controller
  const controllerContent = `import { Request, Response } from 'express';
import { ${model} } from '../../models/${model}.model';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const get${model}s = catchAsync(async (req: Request, res: Response) => {
  const records = await ${model}.find().sort({ createdAt: -1 });
  ApiResponse.success(res, records);
});

export const get${model} = catchAsync(async (req: Request, res: Response) => {
  const record = await ${model}.findById(req.params.id);
  if (!record) throw ApiError.notFound('${model} not found');
  ApiResponse.success(res, record);
});

export const create${model} = catchAsync(async (req: Request, res: Response) => {
  if ('isActive' in req.body && req.body.isActive && '${model}' === 'AcademicYear') {
    await ${model}.updateMany({}, { isActive: false });
  }
  const record = await ${model}.create(req.body);
  ApiResponse.created(res, record);
});

export const update${model} = catchAsync(async (req: Request, res: Response) => {
  if ('isActive' in req.body && req.body.isActive && '${model}' === 'AcademicYear') {
    await ${model}.updateMany({}, { isActive: false });
  }
  const record = await ${model}.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!record) throw ApiError.notFound('${model} not found');
  ApiResponse.success(res, record);
});

export const delete${model} = catchAsync(async (req: Request, res: Response) => {
  const record = await ${model}.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!record) throw ApiError.notFound('${model} not found');
  ApiResponse.success(res, record, '${model} deactivated');
});
`;
  fs.writeFileSync(path.join(moduleDir, `${lowerModel}.controller.ts`), controllerContent);

  // Route
  const routeContent = `import { Router } from 'express';
import { get${model}s, get${model}, create${model}, update${model}, delete${model} } from './${lowerModel}.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { USER_ROLES } from '../../config/constants';

const router = Router();

router.use(authenticate, authorize(USER_ROLES.SUPER_ADMIN));

router.get('/', get${model}s);
router.get('/:id', get${model});
router.post('/', create${model});
router.put('/:id', update${model});
router.patch('/:id/deactivate', delete${model}); // Soft delete

export default router;
`;
  fs.writeFileSync(path.join(moduleDir, `${lowerModel}.routes.ts`), routeContent);
});

// Create index.ts to group all academic routes
const indexContent = `import { Router } from 'express';
${models.map(m => `import ${m.charAt(0).toLowerCase() + m.slice(1)}Routes from './${m.charAt(0).toLowerCase() + m.slice(1)}.routes';`).join('\n')}

const router = Router();

${models.map(m => `router.use('/${m.charAt(0).toLowerCase() + m.slice(1)}s', ${m.charAt(0).toLowerCase() + m.slice(1)}Routes);`).join('\n')}

export default router;
`;
fs.writeFileSync(path.join(moduleDir, 'index.ts'), indexContent);

console.log('Academics scaffolded successfully');
