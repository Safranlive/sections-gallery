# 📡 Sections Gallery - API Documentation

**Complete reference for all backend endpoints**

Base URL: `http://localhost:5000` (development) or `https://api.yourdomain.com` (production)

---

## 🔐 Authentication

### Shopify OAuth Flow

Sections Gallery uses Shopify OAuth for merchant authentication.

#### 1. Initiate OAuth

```http
GET /api/auth?shop=store.myshopify.com
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| shop | string | Yes | Shop domain (e.g., store.myshopify.com) |

**Response**:
- Redirects to Shopify authorization page
- User approves permissions
- Redirects back to callback URL

**Example**:
```bash
curl "http://localhost:5000/api/auth?shop=mystore.myshopify.com"
```

#### 2. OAuth Callback

```http
GET /api/auth/callback
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| code | string | Yes | Authorization code from Shopify |
| hmac | string | Yes | HMAC signature for verification |
| host | string | Yes | Base64-encoded host |
| shop | string | Yes | Shop domain |
| timestamp | string | Yes | Request timestamp |

**Response**:
- Exchanges code for access token
- Saves shop to database
- Redirects to frontend app

**Note**: This endpoint is called automatically by Shopify, not directly by your app.

---

## 🛍️ Public Endpoints

### 1. List All Sections

Get all available sections in the marketplace.

```http
GET /api/sections
```

**Headers**:
```
Content-Type: application/json
```

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "Hero Banner",
    "description": "Full-width hero section with call-to-action button",
    "thumbnail_url": "https://example.com/hero-thumb.jpg",
    "preview_url": "https://example.com/hero-preview.jpg",
    "video_url": "https://youtube.com/watch?v=abc123",
    "price": "49.99",
    "category": "Hero Sections",
    "features": [
      "Responsive design",
      "Customizable text",
      "Multiple CTA styles"
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "name": "Product Grid",
    "description": "Responsive grid for showcasing products",
    "thumbnail_url": "https://example.com/grid-thumb.jpg",
    "preview_url": "https://example.com/grid-preview.jpg",
    "video_url": null,
    "price": "39.99",
    "category": "Product Display",
    "features": [
      "4 column layout",
      "Hover effects",
      "Quick view"
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

**Example Request**:
```bash
curl http://localhost:5000/api/sections
```

---

### 2. Get Single Section

Get detailed information about a specific section.

```http
GET /api/sections/:id
```

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Section ID |

**Response**: `200 OK`
```json
{
  "id": 1,
  "name": "Hero Banner",
  "description": "Full-width hero section with call-to-action button and customizable background",
  "thumbnail_url": "https://example.com/hero-thumb.jpg",
  "preview_url": "https://example.com/hero-preview.jpg",
  "video_url": "https://youtube.com/watch?v=abc123",
  "price": "49.99",
  "category": "Hero Sections",
  "features": [
    "Responsive design",
    "Customizable text",
    "Multiple CTA styles",
    "Background image/video support"
  ],
  "liquid_code": "{% schema %}\n...\n{% endschema %}",
  "css_code": ".hero { ... }",
  "js_code": "document.querySelector(...)",
  "schema_json": {
    "name": "Hero Banner",
    "settings": []
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Example Request**:
```bash
curl http://localhost:5000/api/sections/1
```

**Error Responses**:

`404 Not Found` - Section doesn't exist
```json
{
  "error": "Section not found"
}
```

---

### 3. Create Billing Charge

Initiate a payment for a section purchase.

```http
POST /api/billing/create
```

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "shop": "mystore.myshopify.com",
  "sectionId": 1
}
```

**Body Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| shop | string | Yes | Shop domain |
| sectionId | integer | Yes | Section ID to purchase |

**Response**: `200 OK`
```json
{
  "confirmationUrl": "https://mystore.myshopify.com/admin/charges/1234567/confirm_application_charge?signature=abc..."
}
```

**Flow**:
1. Frontend calls this endpoint
2. Backend creates Shopify charge
3. Frontend redirects user to `confirmationUrl`
4. User approves payment on Shopify
5. Shopify redirects to confirmation endpoint

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/billing/create \
  -H "Content-Type: application/json" \
  -d '{
    "shop": "mystore.myshopify.com",
    "sectionId": 1
  }'
```

**Error Responses**:

`400 Bad Request` - Missing parameters
```json
{
  "error": "Shop and sectionId are required"
}
```

`404 Not Found` - Shop or section not found
```json
{
  "error": "Shop not found"
}
```

---

### 4. Confirm Payment

Confirm and activate a billing charge after user approval.

```http
GET /api/billing/confirm
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| charge_id | string | Yes | Charge ID from Shopify |
| shop | string | Yes | Shop domain |
| section_id | integer | Yes | Section ID purchased |

**Response**:
- Activates the charge with Shopify
- Creates purchase record in database
- Redirects to frontend installation page

**Redirect URL**:
```
http://localhost:3000/install?sectionId=1&shop=mystore.myshopify.com
```

**Note**: This endpoint is called automatically by Shopify after payment approval.

**Example**:
```
http://localhost:5000/api/billing/confirm?charge_id=1234567&shop=mystore.myshopify.com&section_id=1
```

---

### 5. Get Shop Purchases

Get all sections purchased by a shop.

```http
GET /api/purchases/:shop
```

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| shop | string | Shop domain (URL encoded) |

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "section": {
      "id": 1,
      "name": "Hero Banner",
      "description": "Full-width hero section",
      "thumbnail_url": "https://example.com/hero-thumb.jpg",
      "price": "49.99",
      "category": "Hero Sections",
      "liquid_code": "{% schema %}...",
      "css_code": ".hero { ... }",
      "js_code": "document.querySelector..."
    },
    "amount": "49.99",
    "status": "completed",
    "purchased_at": "2024-01-20T14:30:00Z"
  },
  {
    "id": 2,
    "section": {
      "id": 3,
      "name": "Testimonial Slider",
      "description": "Customer reviews carousel",
      "thumbnail_url": "https://example.com/testimonial-thumb.jpg",
      "price": "29.99",
      "category": "Social Proof",
      "liquid_code": "{% schema %}...",
      "css_code": ".testimonials { ... }",
      "js_code": "const slider = ..."
    },
    "amount": "29.99",
    "status": "completed",
    "purchased_at": "2024-01-22T09:15:00Z"
  }
]
```

**Example Request**:
```bash
curl http://localhost:5000/api/purchases/mystore.myshopify.com
```

**Error Responses**:

`404 Not Found` - Shop not found
```json
{
  "error": "Shop not found"
}
```

---

### 6. Install Section to Theme

Install a purchased section to a Shopify theme.

```http
POST /api/install
```

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "shop": "mystore.myshopify.com",
  "themeId": "123456789",
  "sectionId": 1
}
```

**Body Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| shop | string | Yes | Shop domain |
| themeId | string | Yes | Theme ID to install to |
| sectionId | integer | Yes | Section ID to install |

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Section installed successfully",
  "assetKey": "sections/hero-banner.liquid"
}
```

**Process**:
1. Verify shop owns the section (purchased)
2. Get section code from database
3. Upload to theme via Shopify Theme API
4. Return success confirmation

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/install \
  -H "Content-Type: application/json" \
  -d '{
    "shop": "mystore.myshopify.com",
    "themeId": "123456789",
    "sectionId": 1
  }'
```

**Error Responses**:

`400 Bad Request` - Missing parameters
```json
{
  "error": "Shop, themeId, and sectionId are required"
}
```

`403 Forbidden` - Section not purchased
```json
{
  "error": "Section not purchased by this shop"
}
```

`404 Not Found` - Shop or section not found
```json
{
  "error": "Shop not found"
}
```

---

### 7. Get Shop Themes

Get all themes available in a shop.

```http
GET /api/themes/:shop
```

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| shop | string | Shop domain |

**Response**: `200 OK`
```json
[
  {
    "id": "123456789",
    "name": "Dawn",
    "role": "main",
    "theme_store_id": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-20T10:30:00Z"
  },
  {
    "id": "987654321",
    "name": "My Custom Theme",
    "role": "unpublished",
    "theme_store_id": null,
    "created_at": "2024-01-15T12:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z"
  }
]
```

**Example Request**:
```bash
curl http://localhost:5000/api/themes/mystore.myshopify.com
```

---

## 🔑 Admin Endpoints

All admin endpoints require JWT authentication.

### Authentication Header

```
Authorization: Bearer <jwt_token>
```

Get token from login endpoint.

---

### 1. Admin Login

Authenticate as admin user.

```http
POST /api/admin/login
```

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "safranlive@gmail.com",
  "password": "your_password"
}
```

**Response**: `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "safranlive@gmail.com"
}
```

**Token expires**: 24 hours

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "safranlive@gmail.com",
    "password": "admin123"
  }'
```

**Error Responses**:

`401 Unauthorized` - Invalid credentials
```json
{
  "error": "Invalid credentials"
}
```

---

### 2. Get All Sections (Admin)

Get all sections with full details including code.

```http
GET /api/admin/sections
```

**Headers**:
```
Authorization: Bearer <token>
```

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "Hero Banner",
    "description": "Full-width hero section",
    "thumbnail_url": "https://example.com/hero-thumb.jpg",
    "preview_url": "https://example.com/hero-preview.jpg",
    "video_url": "https://youtube.com/watch?v=abc123",
    "price": "49.99",
    "category": "Hero Sections",
    "features": ["Responsive design", "Customizable text"],
    "liquid_code": "{% schema %}\n...\n{% endschema %}",
    "css_code": ".hero { width: 100%; }",
    "js_code": "document.querySelector('.hero')",
    "schema_json": { "name": "Hero Banner" },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### 3. Create Section (Admin)

Create a new section in the marketplace.

```http
POST /api/admin/sections
```

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Newsletter Signup",
  "description": "Email collection form with customizable styling",
  "thumbnail_url": "https://example.com/newsletter-thumb.jpg",
  "preview_url": "https://example.com/newsletter-preview.jpg",
  "video_url": "https://youtube.com/watch?v=xyz789",
  "price": 19.99,
  "category": "Lead Generation",
  "features": [
    "Email validation",
    "Mailchimp integration",
    "Custom styling"
  ],
  "liquid_code": "{% schema %}\n{\n  \"name\": \"Newsletter\",\n  \"settings\": []\n}\n{% endschema %}\n\n<div class=\"newsletter\">...</div>",
  "css_code": ".newsletter { padding: 2rem; }",
  "js_code": "const form = document.querySelector('.newsletter-form');",
  "schema_json": {
    "name": "Newsletter Signup",
    "settings": []
  }
}
```

**Body Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Section name |
| description | string | Yes | Section description |
| thumbnail_url | string | No | Thumbnail image URL |
| preview_url | string | No | Preview image URL |
| video_url | string | No | Demo video URL |
| price | number | Yes | Price in USD |
| category | string | No | Section category |
| features | array | No | List of features |
| liquid_code | string | Yes | Liquid template code |
| css_code | string | No | CSS styles |
| js_code | string | No | JavaScript code |
| schema_json | object | No | Section schema |

**Response**: `201 Created`
```json
{
  "id": 6,
  "name": "Newsletter Signup",
  "description": "Email collection form with customizable styling",
  "thumbnail_url": "https://example.com/newsletter-thumb.jpg",
  "preview_url": "https://example.com/newsletter-preview.jpg",
  "video_url": "https://youtube.com/watch?v=xyz789",
  "price": "19.99",
  "category": "Lead Generation",
  "features": [
    "Email validation",
    "Mailchimp integration",
    "Custom styling"
  ],
  "liquid_code": "{% schema %}...",
  "css_code": ".newsletter { padding: 2rem; }",
  "js_code": "const form = ...",
  "schema_json": { "name": "Newsletter Signup" },
  "created_at": "2024-01-25T15:45:00Z",
  "updated_at": "2024-01-25T15:45:00Z"
}
```

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/admin/sections \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Newsletter Signup",
    "description": "Email collection form",
    "price": 19.99,
    "liquid_code": "{% schema %}...{% endschema %}"
  }'
```

---

### 4. Update Section (Admin)

Update an existing section.

```http
PUT /api/admin/sections/:id
```

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Section ID |

**Request Body**: Same as create, all fields optional
```json
{
  "name": "Hero Banner v2",
  "price": 59.99,
  "features": [
    "Responsive design",
    "Customizable text",
    "Multiple CTA styles",
    "Video background support"
  ]
}
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "name": "Hero Banner v2",
  "description": "Full-width hero section",
  "price": "59.99",
  "features": [
    "Responsive design",
    "Customizable text",
    "Multiple CTA styles",
    "Video background support"
  ],
  "updated_at": "2024-01-26T10:00:00Z"
}
```

**Example Request**:
```bash
curl -X PUT http://localhost:5000/api/admin/sections/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 59.99
  }'
```

---

### 5. Delete Section (Admin)

Delete a section from the marketplace.

```http
DELETE /api/admin/sections/:id
```

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Section ID |

**Response**: `200 OK`
```json
{
  "message": "Section deleted successfully"
}
```

**Example Request**:
```bash
curl -X DELETE http://localhost:5000/api/admin/sections/1 \
  -H "Authorization: Bearer <token>"
```

**Error Responses**:

`404 Not Found` - Section doesn't exist
```json
{
  "error": "Section not found"
}
```

---

### 6. Get All Shops (Admin)

Get list of all authenticated shops.

```http
GET /api/admin/shops
```

**Headers**:
```
Authorization: Bearer <token>
```

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "shop_domain": "store1.myshopify.com",
    "scope": "read_themes,write_themes",
    "created_at": "2024-01-10T08:00:00Z",
    "purchases": [
      {
        "id": 1,
        "section_id": 1,
        "amount": "49.99",
        "status": "completed",
        "purchased_at": "2024-01-15T10:30:00Z"
      }
    ]
  },
  {
    "id": 2,
    "shop_domain": "store2.myshopify.com",
    "scope": "read_themes,write_themes",
    "created_at": "2024-01-12T14:20:00Z",
    "purchases": []
  }
]
```

---

### 7. Get All Purchases (Admin)

Get complete purchase history across all shops.

```http
GET /api/admin/purchases
```

**Headers**:
```
Authorization: Bearer <token>
```

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "shop": {
      "id": 1,
      "shop_domain": "store1.myshopify.com"
    },
    "section": {
      "id": 1,
      "name": "Hero Banner",
      "price": "49.99"
    },
    "amount": "49.99",
    "status": "completed",
    "purchased_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "shop": {
      "id": 1,
      "shop_domain": "store1.myshopify.com"
    },
    "section": {
      "id": 3,
      "name": "Testimonial Slider",
      "price": "29.99"
    },
    "amount": "29.99",
    "status": "completed",
    "purchased_at": "2024-01-20T15:45:00Z"
  }
]
```

---

## 🚨 Error Responses

### Standard Error Format

All errors follow this structure:

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid parameters or missing required fields |
| 401 | Unauthorized | Invalid or missing authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |

### Common Error Scenarios

**Missing Authentication**:
```json
{
  "error": "No token provided"
}
```

**Invalid Token**:
```json
{
  "error": "Invalid token"
}
```

**Expired Token**:
```json
{
  "error": "Token expired"
}
```

**Missing Parameters**:
```json
{
  "error": "Shop and sectionId are required"
}
```

**Resource Not Found**:
```json
{
  "error": "Section not found"
}
```

---

## 🧪 Testing with Postman

### Setup Collection

1. **Create Collection**: "Sections Gallery API"
2. **Add Environment**: "Development"
3. **Set Variables**:
   - `base_url`: `http://localhost:5000`
   - `admin_token`: (set after login)
   - `shop`: `mystore.myshopify.com`

### Example Requests

**1. Get All Sections**:
```
GET {{base_url}}/api/sections
```

**2. Admin Login**:
```
POST {{base_url}}/api/admin/login
Body (JSON):
{
  "email": "safranlive@gmail.com",
  "password": "admin123"
}
```

Save `token` to `admin_token` variable.

**3. Create Section (Admin)**:
```
POST {{base_url}}/api/admin/sections
Headers:
  Authorization: Bearer {{admin_token}}
Body (JSON):
{
  "name": "Test Section",
  "description": "Test description",
  "price": 9.99,
  "liquid_code": "{% schema %}...{% endschema %}"
}
```

---

## 🔒 Security Considerations

### API Keys
- Never expose `SHOPIFY_API_SECRET` in frontend
- Store securely in environment variables
- Rotate keys if compromised

### JWT Tokens
- Store securely (httpOnly cookies recommended for production)
- Implement token refresh for better UX
- Short expiration times (24 hours or less)

### CORS
- Configure allowed origins properly
- Don't use `*` in production
- Whitelist specific domains

### Rate Limiting
- Implement rate limiting to prevent abuse
- Recommended: 100 requests per minute per IP
- Return 429 status when limit exceeded

### Input Validation
- Validate all user input
- Sanitize HTML/SQL to prevent injection
- Check file sizes for uploads
- Validate URLs before storing

---

## 📊 Rate Limiting (Recommended)

While not implemented in the base version, here's a recommended rate limiting strategy:

### Endpoints

| Endpoint Pattern | Limit | Window |
|-----------------|-------|--------|
| `/api/sections` | 100 | 1 minute |
| `/api/billing/*` | 10 | 1 minute |
| `/api/install` | 20 | 1 minute |
| `/api/admin/*` | 200 | 1 minute |

### Implementation

Use `express-rate-limit` package:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);
```

---

## 📞 Support

**API Issues?**

Contact developer:
- 📧 Email: safranlive@gmail.com
- 📱 Phone: +94 777 565 057
- 🌐 Website: [www.systo.lk](https://www.systo.lk)

**Report Bugs**:
- GitHub Issues: [github.com/Safranlive/sections-gallery/issues](https://github.com/Safranlive/sections-gallery/issues)

---

**Version**: 2.0.0  
**Last Updated**: February 2024  
**Status**: Production Ready ✅