# 🛰️ CDSE Account Setup - Step by Step Guide

## Registration Process (5 minutes)

### STEP 1: Navigate to Registration
**Open in your browser:**
```
https://identity.dataspace.copernicus.eu/auth/realms/CDSE/login-actions/registration
```

Or go to the main site and click "Register":
```
https://dataspace.copernicus.eu/
```

---

### STEP 2: Fill Registration Form

You'll see a form with these fields:

| Field | What to Enter |
|-------|---------------|
| **Email** | Your email address (will be your username) |
| **First Name** | Your first name |
| **Last Name** | Your last name |
| **Username** | Choose a username (or use email) |
| **Password** | Strong password (min 8 chars) |
| **Confirm Password** | Same password again |

**IMPORTANT:** 
- ✅ Write down your username and password!
- ✅ Use an email you can access immediately
- ✅ Password must have: letters, numbers, special chars

---

### STEP 3: Accept Terms

Check the boxes:
- ☑️ I have read and agree to the Terms and Conditions
- ☑️ I have read and agree to the Privacy Policy

Click **"Register"**

---

### STEP 4: Verify Email

1. Check your email inbox
2. Look for email from: `noreply@dataspace.copernicus.eu`
3. Subject: "Verify your email address"
4. Click the verification link
5. You'll see: "Your email has been verified"

---

### STEP 5: First Login Test

1. Go to: https://dataspace.copernicus.eu/
2. Click "Login"
3. Enter your username/email and password
4. You should see the main dashboard

**Success!** ✅ Your CDSE account is active

---

## What You Get (FREE)

With your CDSE account you have access to:

- ✅ **Unlimited** Sentinel-1 SAR data downloads
- ✅ **Unlimited** Sentinel-2 optical imagery  
- ✅ **Unlimited** Sentinel-3, 5P data
- ✅ Historical archive back to 2014
- ✅ Near-real-time data (within 3 hours)
- ✅ API access for automation

**Cost:** €0 forever! This is EU's open data policy.

---

## Troubleshooting

### "Email already registered"
→ You already have an account! Click "Forgot password" instead

### "Email not received"
→ Check spam folder
→ Wait 5-10 minutes (sometimes delayed)
→ Try different email provider

### "Invalid password format"
→ Must be at least 8 characters
→ Include: uppercase, lowercase, number, special character
→ Example: `AerisQ2024!`

### "Registration timeout"
→ Clear browser cache and try again
→ Try different browser (Chrome/Firefox)

---

## Next Step: Add Credentials to AerisQ

Once registered and verified, you'll add credentials to:
```
c:\Users\Admin\Desktop\aerisq\backend\.env
```

I'll help you with that after registration is complete!

---

## Alternative: Manual Browser Download (No credentials needed for testing)

If you want to test with ONE scene before full registration:

1. Go to: https://browser.dataspace.copernicus.eu/
2. No login required for browsing!
3. Draw area on map
4. Filter: Sentinel-1 → GRD
5. Select date range
6. Click any scene
7. Click "Download" → Will prompt to login
8. Then complete registration to download

This way you can see what's available before committing to setup!

---

Ready to register? Open the link in your browser and follow the steps above.

**When done, let me know and I'll help you configure the credentials!**
