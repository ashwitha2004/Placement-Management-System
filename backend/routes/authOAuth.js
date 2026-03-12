import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Student from '../models/Student.js';
const router = express.Router();

// Placeholder: Replace with real OAuth logic and passport/simple-oauth2 if needed

const normalizeUrl = (url) => (url || '').trim().replace(/\/+$/, '');

const isAllowedFrontendOrigin = (origin) => {
  if (!origin) return false;

  let hostname = '';
  try {
    hostname = new URL(origin).hostname;
  } catch (_error) {
    return false;
  }

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return true;
  }

  return /\.vercel\.app$/i.test(hostname);
};

const getBackendBaseUrl = (req) => {
  const configured = normalizeUrl(process.env.BACKEND_URL);
  if (configured) {
    return configured;
  }

  const forwardedProto = (req.headers['x-forwarded-proto'] || '').toString().split(',')[0].trim();
  const protocol = forwardedProto || req.protocol || 'http';
  const host = req.get('host');
  return `${protocol}://${host}`;
};

const configuredFrontendBaseUrl = normalizeUrl(process.env.FRONTEND_URL) || 'http://localhost:5173';

const getFrontendBaseUrl = (req, state = null) => {
  const stateFrontend = normalizeUrl(state?.frontend || '');
  if (stateFrontend && isAllowedFrontendOrigin(stateFrontend)) {
    return stateFrontend;
  }

  const requestedFrontend = normalizeUrl(req.query?.frontend || '');
  if (requestedFrontend && isAllowedFrontendOrigin(requestedFrontend)) {
    return requestedFrontend;
  }

  const referer = req.get('referer');
  if (referer) {
    try {
      const refererOrigin = normalizeUrl(new URL(referer).origin);
      if (isAllowedFrontendOrigin(refererOrigin)) {
        return refererOrigin;
      }
    } catch (_error) {
      // ignore malformed referer
    }
  }

  return configuredFrontendBaseUrl;
};

const getFrontendPath = (state = null, req = null) => {
  const flow = String(state?.flow || req?.query?.flow || 'login').toLowerCase();
  return flow === 'register' ? '/register' : '/';
};

const encodeOAuthState = (payload) => {
  const json = JSON.stringify(payload || {});
  return Buffer.from(json, 'utf8').toString('base64url');
};

const decodeOAuthState = (value) => {
  if (!value) return {};
  try {
    const decoded = Buffer.from(String(value), 'base64url').toString('utf8');
    const parsed = JSON.parse(decoded);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_error) {
    return {};
  }
};

const requireEnv = (key, res) => {
  const value = process.env[key];
  if (!value) {
    res.status(500).json({
      success: false,
      message: `${key} is not configured on server`
    });
    return null;
  }
  return value;
};

const redirectWithOauthError = (res, frontendBaseUrl, frontendPath, code, detail) => {
  const params = new URLSearchParams({ oauth_error: code });
  if (detail) {
    params.set('oauth_error_detail', detail.slice(0, 500));
  }
  return res.redirect(`${frontendBaseUrl}${frontendPath}?${params.toString()}`);
};

const generateToken = (id, role) =>
  jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

const oauthMemoryUsers = new Map();
let oauthMemoryUserCounter = 1;

const isMongoReady = () => mongoose?.connection?.readyState === 1;

const getOrCreateMemoryOAuthUser = ({ email, name, provider, providerId, avatar }) => {
  const existingMemoryUser = oauthMemoryUsers.get(email);
  if (existingMemoryUser) {
    existingMemoryUser.oauthProviders = existingMemoryUser.oauthProviders || {};
    existingMemoryUser.oauthProviders[provider] = providerId;
    if (avatar && !existingMemoryUser.avatar) {
      existingMemoryUser.avatar = avatar;
    }
    oauthMemoryUsers.set(email, existingMemoryUser);
    return existingMemoryUser;
  }

  const memoryUser = {
    _id: `oauth-memory-${oauthMemoryUserCounter++}`,
    id: null,
    name,
    email,
    role: 'student',
    avatar,
    oauthProviders: {
      [provider]: providerId
    },
    otpVerified: true
  };
  memoryUser.id = memoryUser._id;
  oauthMemoryUsers.set(email, memoryUser);
  return memoryUser;
};

const getOrCreateOAuthUser = async ({ email, name, provider, providerId, avatar }) => {
  if (!isMongoReady()) {
    return getOrCreateMemoryOAuthUser({ email, name, provider, providerId, avatar });
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      if (!user.oauthProviders) {
        user.oauthProviders = {};
      }
      user.oauthProviders[provider] = providerId;
      if (avatar && !user.avatar) {
        user.avatar = avatar;
      }
      await user.save();
      return user;
    }

    user = await User.create({
      name,
      email,
      password: `oauth_${provider}_${providerId}`,
      role: 'student',
      avatar,
      oauthProviders: {
        [provider]: providerId
      },
      otpVerified: true
    });

    await Student.create({
      user: user._id,
      rollNumber: `AUTO-${user._id.toString().slice(-6)}`,
      branch: 'CSE',
      cgpa: 0,
      phoneNumber: '',
      skills: [],
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    });

    return user;
  } catch (dbError) {
    console.warn('OAuth Mongo fallback activated:', dbError?.message || dbError);
    return getOrCreateMemoryOAuthUser({ email, name, provider, providerId, avatar });
  }
};

// Google OAuth Redirect
router.get('/google', (req, res) => {
  // Redirect to Google OAuth consent screen
  const clientId = requireEnv('GOOGLE_CLIENT_ID', res);
  if (!clientId) return;

  const backendBaseUrl = getBackendBaseUrl(req);
  const redirectUri = encodeURIComponent(`${backendBaseUrl}/api/auth/google/callback`);
  const scope = encodeURIComponent('profile email');
  const frontendBaseUrl = getFrontendBaseUrl(req);
  const state = encodeOAuthState({
    flow: String(req.query?.flow || 'login').toLowerCase(),
    frontend: frontendBaseUrl
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${encodeURIComponent(state)}`);
});

// Google OAuth Callback
router.get('/google/callback', (req, res) => {
  (async () => {
    try {
      const clientId = requireEnv('GOOGLE_CLIENT_ID', res);
      const clientSecret = requireEnv('GOOGLE_CLIENT_SECRET', res);
      if (!clientId || !clientSecret) return;

      const { code } = req.query;
      const state = decodeOAuthState(req.query?.state);
      const frontendBaseUrl = getFrontendBaseUrl(req, state);
      const frontendPath = getFrontendPath(state, req);
      if (!code) {
        return redirectWithOauthError(res, frontendBaseUrl, frontendPath, 'missing_code', 'No authorization code received from Google');
      }

      const backendBaseUrl = getBackendBaseUrl(req);
      const redirectUri = `${backendBaseUrl}/api/auth/google/callback`;

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          code: String(code),
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });

      if (!tokenResponse.ok) {
        let tokenErrorDetail = `token_status_${tokenResponse.status}`;
        try {
          const tokenErrorBody = await tokenResponse.text();
          if (tokenErrorBody) {
            tokenErrorDetail = tokenErrorBody;
          }
        } catch (_error) {
          // ignore parse issues and keep status fallback
        }
        return redirectWithOauthError(res, frontendBaseUrl, frontendPath, 'token_exchange_failed', tokenErrorDetail);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        return redirectWithOauthError(res, frontendBaseUrl, frontendPath, 'missing_access_token', 'Google token response did not include access_token');
      }

      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!profileResponse.ok) {
        let profileErrorDetail = `profile_status_${profileResponse.status}`;
        try {
          const profileErrorBody = await profileResponse.text();
          if (profileErrorBody) {
            profileErrorDetail = profileErrorBody;
          }
        } catch (_error) {
          // ignore parse issues and keep status fallback
        }
        return redirectWithOauthError(res, frontendBaseUrl, frontendPath, 'profile_fetch_failed', profileErrorDetail);
      }

      const profile = await profileResponse.json();
      const email = profile.email;
      const name = profile.name || profile.email;
      const googleId = profile.id;
      const avatar = profile.picture;

      if (!email || !googleId) {
        return redirectWithOauthError(res, frontendBaseUrl, frontendPath, 'invalid_profile', 'Google profile is missing email or id');
      }

      const user = await getOrCreateOAuthUser({
        email,
        name,
        provider: 'google',
        providerId: googleId,
        avatar
      });

      const appToken = generateToken(user._id, user.role);
      const safeUser = {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      };

      const userParam = encodeURIComponent(JSON.stringify(safeUser));
      return res.redirect(`${frontendBaseUrl}${frontendPath}?oauth=google&token=${encodeURIComponent(appToken)}&user=${userParam}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const state = decodeOAuthState(req.query?.state);
      const frontendBaseUrl = getFrontendBaseUrl(req, state);
      const frontendPath = getFrontendPath(state, req);
      return redirectWithOauthError(res, frontendBaseUrl, frontendPath, 'google_callback_failed', error?.message || 'Unknown callback error');
    }
  })();
});

// GitHub OAuth Redirect
router.get('/github', (req, res) => {
  const clientId = requireEnv('GITHUB_CLIENT_ID', res);
  if (!clientId) return;

  const backendBaseUrl = getBackendBaseUrl(req);
  const redirectUri = encodeURIComponent(`${backendBaseUrl}/api/auth/github/callback`);
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`);
});

// GitHub OAuth Callback
router.get('/github/callback', (req, res) => {
  res.redirect(`${frontendBaseUrl}?oauth=github`);
});

// LinkedIn OAuth Redirect
router.get('/linkedin', (req, res) => {
  const clientId = requireEnv('LINKEDIN_CLIENT_ID', res);
  if (!clientId) return;

  const backendBaseUrl = getBackendBaseUrl(req);
  const redirectUri = encodeURIComponent(`${backendBaseUrl}/api/auth/linkedin/callback`);
  const scope = encodeURIComponent('r_liteprofile r_emailaddress');
  res.redirect(`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`);
});

// LinkedIn OAuth Callback
router.get('/linkedin/callback', (req, res) => {
  res.redirect(`${frontendBaseUrl}?oauth=linkedin`);
});

export default router;
