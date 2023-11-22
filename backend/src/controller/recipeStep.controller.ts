import { Router } from 'express';

import { wrap } from '@mikro-orm/core';

import { DI } from '../';

const router = Router({ mergeParams: true });

export const RecipeStepController = router;