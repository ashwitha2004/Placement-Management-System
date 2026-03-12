import express from 'express';
import { googleOAuth, linkedinOAuth, githubOAuth } from '../controllers/oauthController.js';

const router = express.Router();

router.post('/google', googleOAuth);
router.post('/linkedin', linkedinOAuth);
router.post('/github', githubOAuth);

export default router;
