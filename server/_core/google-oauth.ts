import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

/**
 * Register Google OAuth routes (simplified version)
 * In production, you would integrate with real Google OAuth
 */
export function registerGoogleOAuthRoutes(app: Express) {
  // Google login initiation endpoint
  app.get("/api/google/login", (req: Request, res: Response) => {
    // For now, create a demo user with Google login method
    // In production, redirect to Google OAuth consent screen
    const returnPath = typeof req.query.returnPath === "string" ? req.query.returnPath : "/";
    
    try {
      // Create a unique ID for demo Google user
      const googleUserId = `google_demo_${Date.now()}`;
      
      // Store in session temporarily
      res.cookie("_google_temp", googleUserId, { 
        httpOnly: true, 
        maxAge: 5 * 60 * 1000 // 5 minutes
      });
      
      // Redirect to callback
      res.redirect(`/api/google/callback?returnPath=${encodeURIComponent(returnPath)}`);
    } catch (error) {
      console.error("[Google OAuth] Login failed:", error);
      res.redirect(`/?error=google_auth_failed`);
    }
  });

  // Google OAuth callback endpoint
  app.get("/api/google/callback", async (req: Request, res: Response) => {
    const returnPath = typeof req.query.returnPath === "string" ? req.query.returnPath : "/";
    
    try {
      // Get the temporary Google user ID from cookie
      const googleUserId = req.cookies._google_temp || `google_user_${Date.now()}`;
      
      // Create a unique openId for Google users
      const googleOpenId = `google_${googleUserId}`;
      
      // Demo user info
      const demoUserName = "Google User";
      const demoUserEmail = `user-${Date.now()}@google-demo.local`;
      
      // Upsert user in database
      await db.upsertUser({
        openId: googleOpenId,
        name: demoUserName,
        email: demoUserEmail,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });
      
      // Create session token using Manus SDK
      const sessionToken = await sdk.createSessionToken(googleOpenId, {
        name: demoUserName,
        expiresInMs: ONE_YEAR_MS,
      });
      
      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      
      // Clear temporary cookie
      res.clearCookie("_google_temp");
      
      // Redirect to dashboard or return path
      res.redirect(302, returnPath || "/dashboard");
    } catch (error) {
      console.error("[Google OAuth] Callback failed:", error);
      res.redirect(`/?error=google_auth_failed`);
    }
  });
}
