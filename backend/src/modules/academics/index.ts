import { Router } from 'express';
import academicYearRoutes from './academicYear.routes';
import termRoutes from './term.routes';
import classRoutes from './class.routes';
import sectionRoutes from './section.routes';
import subjectRoutes from './subject.routes';

const router = Router();

router.use('/academicYears', academicYearRoutes);
router.use('/terms', termRoutes);
router.use('/classs', classRoutes);
router.use('/sections', sectionRoutes);
router.use('/subjects', subjectRoutes);

export default router;
