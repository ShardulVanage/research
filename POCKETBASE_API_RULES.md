# PocketBase API Rules for Publications Collection

## Overview
This document provides recommended API rules (access control) for the `publications` collection in PocketBase.

## ⚡ Quick Copy-Paste (Recommended)

Use these exact rules - just copy and paste into PocketBase Admin Dashboard:

**Create Rule:**
```
@request.auth.id != ''
```

**Update Rule:**
```
@request.auth.id = user
```

**Delete Rule:**
```
@request.auth.id = user
```

---

## API Rules Explanation

PocketBase uses rule expressions to control access to collections. Rules are evaluated using a special query language and can reference:
- `@request` - Information about the current request
- `@collection(name)` - Access to another collection's data
- Various operators like `&&`, `||`, `!=`, `==`, etc.

---

## Recommended API Rules for Publications Collection

### 1. **List Rule** (who can view the list of publications)
```
public = true || @request.auth.id = user
```

**Explanation:**
- Allows viewing all public publications for everyone
- Allows viewing all publications (including private ones) for the publication owner
- Unauthenticated users can only see public publications

### 2. **View Rule** (who can view a single publication)
```
public = true || @request.auth.id = user
```

**Explanation:**
- Same as List Rule
- Public publications are viewable by anyone
- Private publications are only viewable by their owner

### 3. **Create Rule** (who can create publications)
```
@request.auth.id != ''
```

**Explanation:**
- Only authenticated users can create publications
- Checks that the user ID exists (not empty)
- Any authenticated user can create a publication

### 4. **Update Rule** (who can update/edit publications)
```
@request.auth.id = user
```

**Explanation:**
- Only the publication owner can update their publications
- Compares the authenticated user's ID with the publication's owner ID
- Prevents other users from editing publications they don't own

**Alternative (with email verification requirement):**
```
@request.auth.id = user && @request.auth.verified = true
```

### 5. **Delete Rule** (who can delete publications)
```
@request.auth.id = user
```

**Explanation:**
- Only the publication owner can delete their publications
- Same ownership check as the Update Rule

**Alternative (with verification):**
```
@request.auth.id = user && @request.auth.verified = true
```

---

## Field-Level Permissions (Optional)

If you want to restrict access to specific fields:

### Protected Fields Example
For the `preview_img` and `file_url` fields, you can set protection:
- Make these fields visible only to the publication owner
- Use collection rules or separate API endpoints

---

## Recommended Setup

### For Public Platform (Recommended)
```json
{
  "listRule": "public = true || @request.auth.id = user",
  "viewRule": "public = true || @request.auth.id = user",
  "createRule": "@request.auth.id != ''",
  "updateRule": "@request.auth.id = user",
  "deleteRule": "@request.auth.id = user"
}
```

**With Email Verification (More Secure):**
```json
{
  "listRule": "public = true || @request.auth.id = user",
  "viewRule": "public = true || @request.auth.id = user",
  "createRule": "@request.auth.id != ''",
  "updateRule": "@request.auth.id = user && @request.auth.verified = true",
  "deleteRule": "@request.auth.id = user && @request.auth.verified = true"
}
```

### For Private Platform
```json
{
  "listRule": "@request.auth.id != ''",
  "viewRule": "@request.auth.id != ''",
  "createRule": "@request.auth.id != ''",
  "updateRule": "@request.auth.id = user",
  "deleteRule": "@request.auth.id = user"
}
```

### For Admin-Only Publications
```json
{
  "listRule": "true",
  "viewRule": "true",
  "createRule": "@request.auth.roles.contains('admin')",
  "updateRule": "@request.auth.roles.contains('admin')",
  "deleteRule": "@request.auth.roles.contains('admin')"
}
```

---

## Common Rule Patterns

### Check User Ownership
```
@request.auth.id = user
```

### Check if User is Verified
```
@request.auth.verified = true
```

### Check if User is Authenticated
```
@request.auth.id != ''
```

### Check if Record is Public
```
public = true
```

### Check if User has Role
```
@request.auth.roles.contains('admin')
```

### Combine Multiple Conditions (AND)
```
@request.auth.id = user && @request.auth.verified = true
```

### Combine Multiple Conditions (OR)
```
public = true || @request.auth.id = user
```

### Allow for Anonymous Users
```
true
```

### Deny All Access
```
false
```

### Check for Specific Status
```
status = 'active'
```

### Combine Field and Auth Check
```
public = true || (@request.auth.id = user && status = 'published')
```

---

## Testing Your Rules

1. **Test as Anonymous User:**
   - Should only see public publications

2. **Test as Publication Owner:**
   - Should see all their publications (public and private)
   - Should be able to create, update, and delete their own

3. **Test as Different Authenticated User:**
   - Should only see public publications
   - Should not be able to edit or delete others' publications

4. **Test as Admin (if applicable):**
   - Should have appropriate access based on rules

---

## Troubleshooting Common Syntax Errors

### Error: "unexpected character '\\'"
**Problem:** Using escaped quotes like `\"` instead of regular quotes
```
❌ WRONG:  @request.auth.id != \"\"
✅ CORRECT: @request.auth.id != ''
```

### Error: "invalid or incomplete filter expression"
**Problem:** Missing proper spacing or incorrect operator syntax
```
❌ WRONG:  @request.auth.id = user&&@request.auth.verified = true
✅ CORRECT: @request.auth.id = user && @request.auth.verified = true
```

### Error: "unexpected end of input"
**Problem:** Incomplete or missing closing parenthesis
```
❌ WRONG:  (public = true || @request.auth.id = user
✅ CORRECT: (public = true || @request.auth.id = user)
```

### Error: "no such field 'user'"
**Problem:** Using field name that doesn't exist
**Solution:** Check your PocketBase schema to confirm the field name is correct

### Boolean Comparison
**Problem:** Using `@request.auth.verified` instead of `@request.auth.verified = true`
```
❌ WRONG:  @request.auth.verified
✅ CORRECT: @request.auth.verified = true
```

### Quotes Usage
- Use **single quotes** `'` for strings: `status = 'active'`
- Use **no quotes** for boolean/number comparisons: `verified = true`, `count > 5`
- Use **no quotes** for field references: `user = @request.auth.id`

---

## PocketBase Admin Dashboard Setup

### Step-by-Step Instructions

1. **Open PocketBase Admin Dashboard**
   - Navigate to `http://localhost:8090/_/` (or your PocketBase URL)

2. **Go to Collections**
   - Click "Collections" in the left sidebar

3. **Select Publications Collection**
   - Click on "publications" collection

4. **Open API Rules Tab**
   - Click on "API Rules" at the top of the page

5. **Copy and Paste Rules**
   - **List Rules:** `public = true || @request.auth.id = user`
   - **View Rules:** `public = true || @request.auth.id = user`
   - **Create Rules:** `@request.auth.id != ''`
   - **Update Rules:** `@request.auth.id = user`
   - **Delete Rules:** `@request.auth.id = user`

6. **Save Changes**
   - Click the "Save" button at the top

### Visual Guide
```
Collections → publications → API Rules Tab
  ├── List Rules    → public = true || @request.auth.id = user
  ├── View Rules    → public = true || @request.auth.id = user
  ├── Create Rules  → @request.auth.id != ''
  ├── Update Rules  → @request.auth.id = user
  └── Delete Rules  → @request.auth.id = user
```

---

## Security Best Practices

1. **Always verify ownership before allowing updates/deletes**
2. **Use email verification for sensitive operations**
3. **Consider rate limiting for create operations**
4. **Log all publication modifications**
5. **Regular security audits of your rules**
6. **Test rules thoroughly before deployment**
7. **Use verified email requirement for sensitive operations**

---

## Related Documentation

- [PocketBase API Rules Documentation](https://pocketbase.io/docs/manage/admins/#rules-syntax)
- [PocketBase Collections Guide](https://pocketbase.io/docs/api-collections/)
- [PocketBase Authentication](https://pocketbase.io/docs/api-authentication/)
