const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable wide CORS (API8 Security Misconfiguration)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory request log for frontend visualization of scanner traffic
const requestLogs = [];
function logRequest(req, category, targetEndpoint, status, details = {}) {
  const logEntry = {
    id: Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    time: new Date().toLocaleTimeString(),
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Unknown Scanner/Client',
    category,
    targetEndpoint,
    status,
    details
  };
  requestLogs.unshift(logEntry);
  if (requestLogs.length > 100) requestLogs.pop();
}

// ==========================================
// MOCK DATA STORE
// ==========================================

const users = [
  {
    id: 1,
    username: "alice_m",
    name: "Alice Montgomery",
    email: "alice.montgomery@example.com",
    role: "Regular Customer",
    isAdmin: false,
    phone: "+1 (555) 234-5678",
    ssn_last4: "9821",
    accountBalance: 4250.75,
    billingAddress: "742 Evergreen Terrace, Springfield, OR"
  },
  {
    id: 2,
    username: "bob_vance",
    name: "Bob Vance",
    email: "bob.vance@vancerefrigeration.com",
    role: "Corporate VIP",
    isAdmin: false,
    phone: "+1 (555) 876-5432",
    ssn_last4: "1452",
    accountBalance: 18920.00,
    billingAddress: "1725 Slough Avenue, Scranton, PA"
  },
  {
    id: 3,
    username: "evelyn_reed",
    name: "Dr. Evelyn Reed",
    email: "ereed@apexhealth.org",
    role: "System Administrator",
    isAdmin: true,
    phone: "+1 (555) 901-2345",
    ssn_last4: "4920",
    accountBalance: 98140.50,
    billingAddress: "404 Silicon Parkway, San Francisco, CA"
  },
  {
    id: 4,
    username: "marcus_v",
    name: "Marcus Vance",
    email: "m.vance@quantafinance.io",
    role: "Auditor",
    isAdmin: false,
    phone: "+1 (555) 432-8765",
    ssn_last4: "3189",
    accountBalance: 12430.00,
    billingAddress: "88 Wall Street Suite 400, New York, NY"
  }
];

const orders = [
  {
    id: 101,
    userId: 1,
    customerName: "Alice Montgomery",
    product: "Enterprise Cloud Subscription - Tier 1",
    totalAmount: 1299.99,
    status: "Processing",
    creditCardMasked: "************4112",
    shippingAddress: "742 Evergreen Terrace, Springfield, OR",
    notes: "Please leave package on front porch."
  },
  {
    id: 102,
    userId: 2,
    customerName: "Bob Vance",
    product: "Industrial Cryo Cooling Units (x4)",
    totalAmount: 8500.00,
    status: "Shipped",
    creditCardMasked: "************9021",
    shippingAddress: "1725 Slough Avenue, Scranton, PA",
    notes: "Deliver to dock 4 behind warehouse."
  },
  {
    id: 103,
    userId: 3,
    customerName: "Dr. Evelyn Reed",
    product: "Advanced Diagnostic Workstation Pro",
    totalAmount: 14200.00,
    status: "Delivered",
    creditCardMasked: "************8832",
    shippingAddress: "404 Silicon Parkway, San Francisco, CA",
    notes: "Sensitive medical equipment - handle with care."
  },
  {
    id: 104,
    userId: 4,
    customerName: "Marcus Vance",
    product: "Encrypted Hardware Key Vault & HSM",
    totalAmount: 3499.00,
    status: "Pending Payment",
    creditCardMasked: "************6294",
    shippingAddress: "88 Wall Street Suite 400, New York, NY",
    notes: "Requires direct signature upon delivery."
  }
];

const invoices = [
  {
    id: 2001,
    orderId: 101,
    userId: 1,
    invoiceNumber: "INV-2026-001",
    taxId: "TAX-US-992144",
    amountDue: 1299.99,
    bankIban: "US64APEX00012849201948",
    status: "Paid",
    dueDate: "2026-11-15"
  },
  {
    id: 2002,
    orderId: 102,
    userId: 2,
    invoiceNumber: "INV-2026-002",
    taxId: "TAX-US-482019",
    amountDue: 8500.00,
    bankIban: "US64APEX00091823901428",
    status: "Paid",
    dueDate: "2026-11-20"
  },
  {
    id: 2003,
    orderId: 103,
    userId: 3,
    invoiceNumber: "INV-2026-003",
    taxId: "TAX-US-119284",
    amountDue: 14200.00,
    bankIban: "US64APEX00049281740192",
    status: "Pending",
    dueDate: "2026-12-01"
  }
];

const accountSettings = [
  {
    id: 1,
    userId: 1,
    username: "alice_m",
    email: "alice.montgomery@example.com",
    // Sensitive / Protected Properties (BOPLA)
    internalRiskScore: 12,
    creditLimit: 50000.00,
    mfaBypassAllowed: true,
    isVipLevel9: false,
    internalDiscountRate: 0.15,
    kycApproved: true,
    shadowAdminFlag: false,
    adminNotes: "Internal note: Customer requested VIP upgrade review"
  },
  {
    id: 2,
    userId: 2,
    username: "bob_vance",
    email: "bob.vance@vancerefrigeration.com",
    internalRiskScore: 3,
    creditLimit: 150000.00,
    mfaBypassAllowed: false,
    isVipLevel9: true,
    internalDiscountRate: 0.35,
    kycApproved: true,
    shadowAdminFlag: true,
    adminNotes: "High-value enterprise customer, override credit holds"
  }
];

const teamMembers = [
  {
    id: 1,
    name: "Dr. Evelyn Reed",
    title: "Chief Security Architect",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    department: "Engineering",
    // Excessive Data Exposure fields:
    ssn: "982-11-4920",
    personalPhone: "+1-555-901-2345",
    homeAddress: "404 Silicon Parkway, Apt 12B, San Francisco, CA",
    annualSalary: "$265,000",
    hashedPassword: "$2a$12$e8Yy8sJ.uFqFpG2Z8mH7Ou1b5wA2.K8g1N2i4p7Y9zQ",
    bankRoutingNumber: "121000358",
    bankAccountNumber: "8920194821",
    emergencyContact: "David Reed (Spouse) - 555-901-9988",
    internalEmployeeGrade: "L7-Exec"
  },
  {
    id: 2,
    name: "Marcus Vance",
    title: "Lead Compliance Auditor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    department: "Compliance",
    ssn: "145-22-3189",
    personalPhone: "+1-555-432-8765",
    homeAddress: "88 Wall Street Suite 400, New York, NY",
    annualSalary: "$195,000",
    hashedPassword: "$2a$12$q7Wp5rT.lKmJnG8Y3bV4De6a2c1X8z9O0p1I2u3Y4t",
    bankRoutingNumber: "021000021",
    bankAccountNumber: "4491029482",
    emergencyContact: "Sarah Vance (Sister) - 555-432-1122",
    internalEmployeeGrade: "L6-Senior"
  }
];

const coupons = [
  { code: "WELCOME100", discount: 100, remainingUses: 999999 },
  { code: "SUPER50", discount: 50, remainingUses: 999999 },
  { code: "FREESHIP", discount: 25, remainingUses: 999999 }
];

// ==========================================
// 1. API1:2023 - Broken Object Level Authorization (BOLA)
// ==========================================

// GET /api/users/:id - Access any user record directly without authorization
app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = users.find(u => u.id === userId);

  if (!user) {
    logRequest(req, 'API1:2023 - BOLA', `/api/users/${req.params.id}`, 404);
    return res.status(404).json({ error: "User not found" });
  }

  logRequest(req, 'API1:2023 - BOLA', `/api/users/${req.params.id}`, 200, { userId });
  res.json({
    status: "success",
    vulnerability: "API1:2023 - Broken Object Level Authorization (BOLA)",
    message: "Object accessed directly by ID parameter without ownership verification.",
    data: user
  });
});

// PUT /api/users/:id - Modify any user profile without authorization
app.put('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    logRequest(req, 'API1:2023 - BOLA', `/api/users/${req.params.id}`, 404);
    return res.status(404).json({ error: "User not found" });
  }

  users[userIndex] = { ...users[userIndex], ...req.body, id: userId };
  logRequest(req, 'API1:2023 - BOLA', `/api/users/${req.params.id}`, 200, { updated: req.body });

  res.json({
    status: "success",
    vulnerability: "API1:2023 - Broken Object Level Authorization (BOLA)",
    message: "User object modified without verifying requestor identity or rights.",
    data: users[userIndex]
  });
});

// GET /api/orders/:id - Access any order record directly
app.get('/api/orders/:id', (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    logRequest(req, 'API1:2023 - BOLA', `/api/orders/${req.params.id}`, 404);
    return res.status(404).json({ error: "Order not found" });
  }

  logRequest(req, 'API1:2023 - BOLA', `/api/orders/${req.params.id}`, 200, { orderId });
  res.json({
    status: "success",
    vulnerability: "API1:2023 - Broken Object Level Authorization (BOLA)",
    message: "Order details accessed without caller authentication or ownership check.",
    data: order
  });
});

// PUT /api/orders/:id - Modify any order without authorization
app.put('/api/orders/:id', (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const orderIndex = orders.findIndex(o => o.id === orderId);

  if (orderIndex === -1) {
    logRequest(req, 'API1:2023 - BOLA', `/api/orders/${req.params.id}`, 404);
    return res.status(404).json({ error: "Order not found" });
  }

  orders[orderIndex] = { ...orders[orderIndex], ...req.body, id: orderId };
  logRequest(req, 'API1:2023 - BOLA', `/api/orders/${req.params.id}`, 200);

  res.json({
    status: "success",
    vulnerability: "API1:2023 - Broken Object Level Authorization (BOLA)",
    message: "Order updated directly without authorization.",
    data: orders[orderIndex]
  });
});

// DELETE /api/orders/:id - Delete any order without authorization
app.delete('/api/orders/:id', (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const index = orders.findIndex(o => o.id === orderId);

  if (index === -1) {
    logRequest(req, 'API1:2023 - BOLA', `/api/orders/${req.params.id}`, 404);
    return res.status(404).json({ error: "Order not found" });
  }

  const deleted = orders.splice(index, 1);
  logRequest(req, 'API1:2023 - BOLA', `/api/orders/${req.params.id}`, 200);

  res.json({
    status: "success",
    vulnerability: "API1:2023 - Broken Object Level Authorization (BOLA)",
    message: "Order deleted without authorization.",
    deletedOrder: deleted[0]
  });
});

// GET /api/invoices/:id - Confidential financial invoice exposed directly by ID
app.get('/api/invoices/:id', (req, res) => {
  const invoiceId = parseInt(req.params.id, 10);
  const invoice = invoices.find(inv => inv.id === invoiceId);

  if (!invoice) {
    logRequest(req, 'API1:2023 - BOLA', `/api/invoices/${req.params.id}`, 404);
    return res.status(404).json({ error: "Invoice not found" });
  }

  logRequest(req, 'API1:2023 - BOLA', `/api/invoices/${req.params.id}`, 200);
  res.json({
    status: "success",
    vulnerability: "API1:2023 - Broken Object Level Authorization (BOLA)",
    message: "Confidential invoice returned without authorization checks.",
    data: invoice
  });
});

// ==========================================
// 2. API2:2023 - Broken Authentication
// Fails to enforce auth, accepts missing auth, accepts alg=none JWTs or invalid tokens
// ==========================================

// Helper to inspect incoming token if provided
function inspectToken(authHeader) {
  if (!authHeader) {
    return { status: "missing_token", alg: "none", claims: { user: "anonymous_guest", role: "admin" } };
  }
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  try {
    const parts = token.split('.');
    if (parts.length >= 2) {
      const header = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf8'));
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      return { status: "parsed", alg: header.alg || 'unknown', claims: payload };
    }
  } catch (e) {
    // ignore parse error
  }
  return { status: "accepted_arbitrary_token", alg: "none", claims: { user: "caller_identity", role: "admin" } };
}

// GET /api/auth/profile - Claims to require authentication, but executes even with no token or forged alg=none JWT
app.get('/api/auth/profile', (req, res) => {
  const authHeader = req.headers['authorization'];
  const tokenInfo = inspectToken(authHeader);

  logRequest(req, 'API2:2023 - Broken Auth', '/api/auth/profile', 200, {
    authHeaderPresent: !!authHeader,
    detectedAlg: tokenInfo.alg
  });

  res.json({
    status: "success",
    vulnerability: "API2:2023 - Broken Authentication",
    description: "Endpoint completely bypasses token verification: accepts missing token, invalid token, or forged alg=none JWT.",
    authenticated: true,
    authHeaderReceived: authHeader || "(None provided - completely unauthenticated request permitted)",
    detectedTokenAlgorithm: tokenInfo.alg,
    userProfile: {
      id: 3,
      username: "dr_reed_admin",
      email: "ereed@apexhealth.org",
      role: "System Administrator",
      privileges: ["ADMIN_READ", "ADMIN_WRITE", "USER_MANAGEMENT", "DB_EXPORT"],
      sessionExpires: "2099-12-31T23:59:59Z",
      tokenClaims: tokenInfo.claims
    }
  });
});

// POST /api/auth/verify-token - Insecure JWT validator endpoint accepting alg=none or unverified signatures
app.post('/api/auth/verify-token', (req, res) => {
  const token = req.body.token || req.headers['authorization'];
  const tokenInfo = inspectToken(token);

  logRequest(req, 'API2:2023 - Broken Auth', '/api/auth/verify-token', 200, { alg: tokenInfo.alg });

  res.json({
    status: "success",
    vulnerability: "API2:2023 - Broken Authentication",
    tokenAccepted: true,
    signatureVerified: false,
    algorithm: tokenInfo.alg,
    message: "Token accepted without signature verification (insecure alg=none or zero validation flaw).",
    payload: tokenInfo.claims
  });
});

// GET /api/auth/user-session - Returns active session info without any auth header
app.get('/api/auth/user-session', (req, res) => {
  logRequest(req, 'API2:2023 - Broken Auth', '/api/auth/user-session', 200);
  res.json({
    status: "success",
    vulnerability: "API2:2023 - Broken Authentication",
    session: {
      sessionId: "sess_994182903847291823",
      userId: 1,
      authenticatedAs: "root_superadmin",
      impersonated: true,
      authLevel: "unrestricted"
    }
  });
});

// ==========================================
// 3. API3:2023 - Broken Object Property Level Authorization (BOPLA)
// PROPERTY READ (exposure of internal/restricted properties) and PROPERTY WRITE (updating restricted properties)
// ==========================================

// GET /api/account/settings/:id - PROPERTY_READ flaw: returns sensitive/internal object properties
app.get('/api/account/settings/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const settings = accountSettings.find(s => s.id === id) || accountSettings[0];

  logRequest(req, 'API3:2023 - BOPLA', `/api/account/settings/${id}`, 200);
  res.json({
    status: "success",
    vulnerability: "API3:2023 - Broken Object Property Level Authorization (BOPLA - PROPERTY_READ)",
    message: "Exposing internal properties (internalRiskScore, creditLimit, mfaBypassAllowed, shadowAdminFlag, adminNotes) without property-level authorization.",
    data: settings
  });
});

// PUT /api/account/settings/:id - PROPERTY_WRITE flaw: allows unauthorized modification of sensitive object properties
app.put('/api/account/settings/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  let settings = accountSettings.find(s => s.id === id);

  if (!settings) {
    settings = { id, userId: id };
    accountSettings.push(settings);
  }

  // Vulnerability: Blindly writes sensitive properties (creditLimit, mfaBypassAllowed, etc.) without property authorization
  Object.assign(settings, req.body);

  logRequest(req, 'API3:2023 - BOPLA', `/api/account/settings/${id}`, 200, { writtenProperties: Object.keys(req.body) });
  res.json({
    status: "success",
    vulnerability: "API3:2023 - Broken Object Property Level Authorization (BOPLA - PROPERTY_WRITE)",
    message: "Protected properties modified without property-level write authorization checks.",
    updatedProperties: Object.keys(req.body),
    data: settings
  });
});

// ==========================================
// 4. API4:2023 - Unrestricted Resource Consumption
// High pagination limit, massive batch execution, unthrottled heavy queries
// ==========================================

// GET /api/catalog/products - Unrestricted pagination (e.g. limit=100000)
app.get('/api/catalog/products', (req, res) => {
  let limit = parseInt(req.query.limit, 10);
  const offset = parseInt(req.query.offset, 10) || 0;

  // Vulnerability: No upper bound check on limit!
  if (isNaN(limit) || limit <= 0) limit = 10;
  if (limit > 50000) limit = 50000; // Cap at 50,000 for server memory safety while satisfying scanner probe

  const dummyProducts = [];
  for (let i = 0; i < Math.min(limit, 2000); i++) {
    dummyProducts.push({
      id: offset + i + 1,
      sku: `SKU-APX-${10000 + i}`,
      title: `Industrial High-Capacity Server Node #${i + 1}`,
      price: (199.99 + (i % 500)).toFixed(2),
      inStock: true
    });
  }

  logRequest(req, 'API4:2023 - Resource Consumption', '/api/catalog/products', 200, { requestedLimit: req.query.limit, returnedItems: dummyProducts.length });
  res.json({
    status: "success",
    vulnerability: "API4:2023 - Unrestricted Resource Consumption",
    warning: "API lacks upper bound limit validation on pagination parameters.",
    requestedLimit: req.query.limit || "default",
    itemsCount: dummyProducts.length,
    data: dummyProducts
  });
});

// POST /api/batch/operations - Unrestricted batch processing without size limits or rate limits
app.post('/api/batch/operations', (req, res) => {
  const operations = req.body.operations || req.body.batch || [];
  const results = operations.map((op, idx) => ({
    operationIndex: idx,
    type: op.type || "generic_action",
    status: "executed_without_rate_limit"
  }));

  logRequest(req, 'API4:2023 - Resource Consumption', '/api/batch/operations', 200, { batchCount: operations.length });
  res.json({
    status: "success",
    vulnerability: "API4:2023 - Unrestricted Resource Consumption",
    message: "Batch operations accepted with no concurrency, rate limit, or payload size restrictions.",
    totalProcessed: operations.length,
    results: results.slice(0, 50)
  });
});

// GET /api/reports/heavy - Heavy aggregation endpoint with no rate-limiting or timeout
app.get('/api/reports/heavy', (req, res) => {
  const iterations = parseInt(req.query.iterations, 10) || 10000;
  logRequest(req, 'API4:2023 - Resource Consumption', '/api/reports/heavy', 200, { iterations });
  res.json({
    status: "success",
    vulnerability: "API4:2023 - Unrestricted Resource Consumption",
    message: "Resource-intensive query executed without rate limits or client quotas.",
    computedIterations: iterations,
    executionTimeMs: 14.2
  });
});

// ==========================================
// 5. API5:2023 - Broken Function Level Authorization (BFLA)
// Admin / privileged functions accessible by any unauthenticated/regular caller, verb tampering
// ==========================================

// GET /api/admin/system/status - Administrative diagnostic endpoint accessible openly
app.get('/api/admin/system/status', (req, res) => {
  logRequest(req, 'API5:2023 - BFLA', '/api/admin/system/status', 200);
  res.json({
    status: "success",
    vulnerability: "API5:2023 - Broken Function Level Authorization (BFLA)",
    message: "Administrative system diagnostic function reached without administrative privileges or authorization.",
    systemStatus: {
      clusterHealth: "OPTIMAL",
      activeNodes: 16,
      masterNodeIp: "10.142.0.4",
      databaseReplicationLagMs: 0.4,
      adminConsoleUrl: "https://internal-admin.apexvault.corp/console",
      maintenanceMode: false
    }
  });
});

// POST & GET /api/admin/users/promote - Admin state change function reachable openly (also allows GET verb tampering)
const handlePromote = (req, res) => {
  const userId = parseInt(req.body.userId || req.query.userId || 1, 10);
  const targetRole = req.body.targetRole || req.query.targetRole || "SuperAdmin";

  const targetUser = users.find(u => u.id === userId);
  if (targetUser) {
    targetUser.role = targetRole;
    targetUser.isAdmin = true;
  }

  logRequest(req, 'API5:2023 - BFLA', '/api/admin/users/promote', 200, { userId, targetRole, method: req.method });
  res.json({
    status: "success",
    vulnerability: "API5:2023 - Broken Function Level Authorization (BFLA)",
    message: `Privileged function executed via ${req.method}: Promoted User ${userId} to role '${targetRole}' with no administrative credentials.`,
    executedBy: "Anonymous / Unauthenticated Caller",
    updatedUser: targetUser
  });
};
app.post('/api/admin/users/promote', handlePromote);
app.get('/api/admin/users/promote', handlePromote); // Alternate HTTP verb bypass

// DELETE /api/admin/audit-logs - Administrative purge function accessible openly
app.delete('/api/admin/audit-logs', (req, res) => {
  logRequest(req, 'API5:2023 - BFLA', '/api/admin/audit-logs', 200);
  res.json({
    status: "success",
    vulnerability: "API5:2023 - Broken Function Level Authorization (BFLA)",
    message: "Critical administrative function (Purge Audit Logs) executed with no authorization checks.",
    purgedRecords: 1420
  });
});

// ==========================================
// 6. API6:2023 - Unrestricted Access to Sensitive Business Flows
// Business flows (coupon redemption, checkout, funds transfer) without rate-limiting, CAPTCHA, or bot protection
// ==========================================

// POST /api/business/coupons/redeem - Automated coupon redemption without velocity checks or anti-automation
app.post('/api/business/coupons/redeem', (req, res) => {
  const { couponCode, cartId } = req.body;
  const coupon = coupons.find(c => c.code === (couponCode || "").toUpperCase());

  logRequest(req, 'API6:2023 - Business Flows', '/api/business/coupons/redeem', 200, { couponCode, cartId });
  if (!coupon) {
    return res.status(400).json({ error: "Invalid coupon code", couponCode });
  }

  res.json({
    status: "success",
    vulnerability: "API6:2023 - Unrestricted Access to Sensitive Business Flows",
    message: "Sensitive business flow (Coupon Redemption) executed with NO anti-automation, rate limiting, or single-use enforcement.",
    couponApplied: coupon.code,
    discountAmount: coupon.discount,
    cartId: cartId || 101,
    redemptionTimestamp: new Date().toISOString()
  });
});

// POST /api/business/checkout - Order checkout flow vulnerable to automated spamming
app.post('/api/business/checkout', (req, res) => {
  const { cartId, items, paymentMethod } = req.body;
  logRequest(req, 'API6:2023 - Business Flows', '/api/business/checkout', 200, { cartId });
  res.json({
    status: "success",
    vulnerability: "API6:2023 - Unrestricted Access to Sensitive Business Flows",
    message: "Checkout business flow executed with no bot detection, CAPTCHA, or rate limits.",
    orderId: Math.floor(10000 + Math.random() * 90000),
    totalCharged: 899.99,
    status: "Confirmed"
  });
});

// POST /api/business/funds/transfer - Financial transfer flow without secondary validation
app.post('/api/business/funds/transfer', (req, res) => {
  const { sourceAccount, targetAccount, amount } = req.body;
  logRequest(req, 'API6:2023 - Business Flows', '/api/business/funds/transfer', 200, { amount, targetAccount });
  res.json({
    status: "success",
    vulnerability: "API6:2023 - Unrestricted Access to Sensitive Business Flows",
    message: "Sensitive financial transfer executed without step-up authentication, velocity limit, or MFA verification.",
    transferId: "TRX-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
    amount: amount || 500,
    sourceAccount: sourceAccount || "ACC-1001",
    targetAccount: targetAccount || "ACC-9999",
    status: "Transfer Complete"
  });
});

// ==========================================
// 7. API8:2023 - Security Misconfiguration
// Public OpenAPI/Swagger spec, debug config endpoints, stack traces on crash, permissive CORS
// ==========================================

// GET /api/config/debug - Exposing internal server environment & debug configuration
app.get('/api/config/debug', (req, res) => {
  logRequest(req, 'API8:2023 - Security Misconfiguration', '/api/config/debug', 200);
  res.json({
    status: "success",
    vulnerability: "API8:2023 - Security Misconfiguration",
    warning: "Internal environment configuration and debug flags exposed to public callers.",
    configuration: {
      NODE_ENV: "development",
      DEBUG: "express:*,apex:*",
      SERVER_ROOT: "c:\\Users\\dhari\\OneDrive\\Desktop\\vulnerable-website",
      DATABASE_URI: "postgres://apex_admin:Sup3rS3cr3tP@ssw0rd!@10.0.4.12:5432/apex_production_db",
      AWS_DEFAULT_REGION: "us-east-1",
      INTERNAL_SECRET_KEY_HINT: "apex-vault-internal-master-key-2026",
      ENABLE_DEBUG_TOOLBAR: true,
      VERBOSE_ERROR_TRACES: true
    }
  });
});

// GET /api/debug/error-trace - Deliberate unhandled exception returning full stack trace
app.get('/api/debug/error-trace', (req, res) => {
  logRequest(req, 'API8:2023 - Security Misconfiguration', '/api/debug/error-trace', 500);
  try {
    throw new Error("DeliberateUnhandledException: NullPointerException in InternalSecurityFilter at ApexServer.processRoute");
  } catch (err) {
    res.status(500).json({
      error: "Internal Server Error",
      vulnerability: "API8:2023 - Security Misconfiguration (Verbose Error Disclosure)",
      message: err.message,
      stack: err.stack,
      serverRuntime: {
        nodeVersion: process.version,
        platform: process.platform,
        pid: process.pid,
        memoryUsage: process.memoryUsage()
      }
    });
  }
});

// ==========================================
// 8. API Excessive Data Exposure
// Endpoint returning private PII (SSN, home address, salary, password hash), expecting client to filter
// ==========================================

// GET /api/public/team-members - Public member directory leaking extensive PII
app.get('/api/public/team-members', (req, res) => {
  logRequest(req, 'API Excessive Data Exposure', '/api/public/team-members', 200);
  res.json({
    status: "success",
    vulnerability: "API Excessive Data Exposure",
    message: "Public team listing returns entire raw database records (SSN, password hash, salary, home address, bank account), relying on client-side filtering.",
    count: teamMembers.length,
    data: teamMembers
  });
});

// GET /api/public/team-members/:id - Specific member with sensitive fields
app.get('/api/public/team-members/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const member = teamMembers.find(m => m.id === id) || teamMembers[0];

  logRequest(req, 'API Excessive Data Exposure', `/api/public/team-members/${id}`, 200);
  res.json({
    status: "success",
    vulnerability: "API Excessive Data Exposure",
    message: "Calling context only requests public profile, but server sends full PII payload.",
    data: member
  });
});

// ==========================================
// 9. API Mass Assignment
// Endpoint silently binding extra, privilege-shaped fields (role, isAdmin, walletBalance) injected into JSON body
// ==========================================

// POST /api/auth/register - Mass assignment during registration
app.post('/api/auth/register', (req, res) => {
  const newUserId = users.length + 1;
  // Vulnerability: Blindly binds all request body properties into user record
  const newUser = {
    id: newUserId,
    username: req.body.username || `user_${newUserId}`,
    email: req.body.email || `user${newUserId}@example.com`,
    role: "Regular Customer", // Default
    isAdmin: false,           // Default
    accountBalance: 0,        // Default
    ...req.body,              // Attacker fields overwrite defaults!
    id: newUserId             // Ensure unique ID
  };

  users.push(newUser);

  logRequest(req, 'API Mass Assignment', '/api/auth/register', 201, {
    injectedKeys: Object.keys(req.body),
    boundRole: newUser.role,
    boundIsAdmin: newUser.isAdmin
  });

  res.status(201).json({
    status: "success",
    vulnerability: "API Mass Assignment",
    message: "Registration endpoint bound unexpected injected fields (e.g. role, isAdmin, accountBalance) directly into the internal user model.",
    assignedProperties: Object.keys(req.body),
    user: newUser
  });
});

// PATCH /api/users/:id/mass-assign - Mass assignment on profile update
app.patch('/api/users/:id/mass-assign', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    logRequest(req, 'API Mass Assignment', `/api/users/${req.params.id}/mass-assign`, 404);
    return res.status(404).json({ error: "User not found" });
  }

  // Vulnerability: Blindly applies all keys
  users[userIndex] = { ...users[userIndex], ...req.body, id: userId };

  logRequest(req, 'API Mass Assignment', `/api/users/${req.params.id}/mass-assign`, 200, {
    injectedKeys: Object.keys(req.body)
  });

  res.json({
    status: "success",
    vulnerability: "API Mass Assignment",
    message: "Model properties updated with no schema whitelist or DTO filtering.",
    injectedProperties: Object.keys(req.body),
    data: users[userIndex]
  });
});

// ==========================================
// SYSTEM LOGS, SUMMARY & RESET
// ==========================================

app.get('/api/logs', (req, res) => {
  res.json({
    totalLogs: requestLogs.length,
    logs: requestLogs
  });
});

app.post('/api/reset', (req, res) => {
  requestLogs.length = 0;
  res.json({ message: "Request logs reset successfully" });
});

// Summary endpoint returning vulnerability checklist and quick stats
app.get('/api/summary', (req, res) => {
  res.json({
    system: "Apex Vault Security Lab",
    description: "Intentionally vulnerable testbed for automated API security scanners",
    authentication: "None (Completely unauthenticated & unauthorized by design)",
    vulnerabilitiesSupported: [
      { id: "API1:2023", name: "Broken Object Level Authorization (BOLA)", endpoints: ["/api/users/:id", "/api/orders/:id", "/api/invoices/:id"] },
      { id: "API2:2023", name: "Broken Authentication", endpoints: ["/api/auth/profile", "/api/auth/verify-token", "/api/auth/user-session"] },
      { id: "API3:2023", name: "Broken Object Property Level Authorization (BOPLA)", endpoints: ["/api/account/settings/:id"] },
      { id: "API4:2023", name: "Unrestricted Resource Consumption", endpoints: ["/api/catalog/products", "/api/batch/operations", "/api/reports/heavy"] },
      { id: "API5:2023", name: "Broken Function Level Authorization (BFLA)", endpoints: ["/api/admin/system/status", "/api/admin/users/promote", "/api/admin/audit-logs"] },
      { id: "API6:2023", name: "Unrestricted Access to Sensitive Business Flows", endpoints: ["/api/business/coupons/redeem", "/api/business/checkout", "/api/business/funds/transfer"] },
      { id: "API8:2023", name: "Security Misconfiguration", endpoints: ["/openapi.json", "/swagger.json", "/api/config/debug", "/api/debug/error-trace"] },
      { id: "ExcessiveDataExposure", name: "API Excessive Data Exposure", endpoints: ["/api/public/team-members", "/api/public/team-members/:id"] },
      { id: "MassAssignment", name: "API Mass Assignment", endpoints: ["/api/auth/register", "/api/users/:id/mass-assign"] }
    ]
  });
});

// ==========================================
// OPENAPI 3.0 SPECIFICATION (Swagger / Akto Scanner Ingestion)
// ==========================================

const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Apex Vault Vulnerability Testing Target",
    version: "2.0.0",
    description: "Live target API implementing all 9 OWASP & Scanner test categories without authentication or authorization."
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: "Local vulnerable server"
    }
  ],
  tags: [
    { name: "API1:2023 - BOLA", description: "Broken Object Level Authorization" },
    { name: "API2:2023 - Broken Authentication", description: "Bypassed or missing authentication, accepts alg=none" },
    { name: "API3:2023 - BOPLA", description: "Broken Object Property Level Authorization (Property Read/Write)" },
    { name: "API4:2023 - Resource Consumption", description: "Unrestricted Resource Consumption & pagination" },
    { name: "API5:2023 - BFLA", description: "Broken Function Level Authorization & Verb Tampering" },
    { name: "API6:2023 - Business Flows", description: "Unrestricted Access to Sensitive Business Flows" },
    { name: "API8:2023 - Security Misconfiguration", description: "Debug config leaks, open specs, error traces" },
    { name: "API Excessive Data Exposure", description: "PII & password hashes returned in public responses" },
    { name: "API Mass Assignment", description: "Blind property binding on user models" }
  ],
  paths: {
    // 1. BOLA
    "/api/users/{id}": {
      get: {
        tags: ["API1:2023 - BOLA"],
        summary: "Get user details by ID (BOLA)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", example: 1 } }],
        responses: { "200": { description: "User record returned" } }
      },
      put: {
        tags: ["API1:2023 - BOLA"],
        summary: "Update user details by ID (BOLA)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", example: 1 } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { name: { type: "string" }, role: { type: "string" }, accountBalance: { type: "number" } }
              }
            }
          }
        },
        responses: { "200": { description: "User updated" } }
      }
    },
    "/api/orders/{id}": {
      get: {
        tags: ["API1:2023 - BOLA"],
        summary: "Get order details by ID (BOLA)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", example: 101 } }],
        responses: { "200": { description: "Order details returned" } }
      },
      put: {
        tags: ["API1:2023 - BOLA"],
        summary: "Update order by ID (BOLA)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", example: 101 } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { shippingAddress: { type: "string" }, status: { type: "string" } }
              }
            }
          }
        },
        responses: { "200": { description: "Order updated" } }
      },
      delete: {
        tags: ["API1:2023 - BOLA"],
        summary: "Delete order by ID (BOLA)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", example: 101 } }],
        responses: { "200": { description: "Order deleted" } }
      }
    },
    "/api/invoices/{id}": {
      get: {
        tags: ["API1:2023 - BOLA"],
        summary: "Get invoice details by ID (BOLA)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", example: 2001 } }],
        responses: { "200": { description: "Invoice returned" } }
      }
    },

    // 2. Broken Authentication
    "/api/auth/profile": {
      get: {
        tags: ["API2:2023 - Broken Authentication"],
        summary: "User Profile (Bypasses Auth & Accepts alg=none)",
        description: "Executes without authentication or accepts forged alg=none JWT tokens.",
        responses: { "200": { description: "Profile returned" } }
      }
    },
    "/api/auth/verify-token": {
      post: {
        tags: ["API2:2023 - Broken Authentication"],
        summary: "Insecure JWT Validation (Accepts alg=none)",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { token: { type: "string", example: "eyJhbGciOiJub25lIn0.eyJ1c2VyIjoiYWRtaW4ifQ." } }
              }
            }
          }
        },
        responses: { "200": { description: "Validation response" } }
      }
    },
    "/api/auth/user-session": {
      get: {
        tags: ["API2:2023 - Broken Authentication"],
        summary: "Unprotected active session retrieval",
        responses: { "200": { description: "Session info" } }
      }
    },

    // 3. BOPLA
    "/api/account/settings/{id}": {
      get: {
        tags: ["API3:2023 - BOPLA"],
        summary: "Get account settings (PROPERTY_READ flaw)",
        description: "Leaks internal object properties (risk score, shadow flags, credit limits).",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", example: 1 } }],
        responses: { "200": { description: "Account settings with internal properties" } }
      },
      put: {
        tags: ["API3:2023 - BOPLA"],
        summary: "Update account settings (PROPERTY_WRITE flaw)",
        description: "Allows modification of protected internal properties.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", example: 1 } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  creditLimit: { type: "number", example: 999999 },
                  mfaBypassAllowed: { type: "boolean", example: true },
                  isVipLevel9: { type: "boolean", example: true }
                }
              }
            }
          }
        },
        responses: { "200": { description: "Settings updated" } }
      }
    },

    // 4. Resource Consumption
    "/api/catalog/products": {
      get: {
        tags: ["API4:2023 - Resource Consumption"],
        summary: "List catalog products (Unbounded pagination limit)",
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", example: 50000 } },
          { name: "offset", in: "query", schema: { type: "integer", example: 0 } }
        ],
        responses: { "200": { description: "Products array" } }
      }
    },
    "/api/batch/operations": {
      post: {
        tags: ["API4:2023 - Resource Consumption"],
        summary: "Batch operation processing (No batch size or rate limit)",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  operations: {
                    type: "array",
                    items: { type: "object", properties: { action: { type: "string" } } }
                  }
                }
              }
            }
          }
        },
        responses: { "200": { description: "Batch processed" } }
      }
    },
    "/api/reports/heavy": {
      get: {
        tags: ["API4:2023 - Resource Consumption"],
        summary: "Heavy unthrottled computation query",
        parameters: [{ name: "iterations", in: "query", schema: { type: "integer", example: 100000 } }],
        responses: { "200": { description: "Computation result" } }
      }
    },

    // 5. BFLA
    "/api/admin/system/status": {
      get: {
        tags: ["API5:2023 - BFLA"],
        summary: "Admin System Status (Unrestricted Function Access)",
        responses: { "200": { description: "Internal system status" } }
      }
    },
    "/api/admin/users/promote": {
      post: {
        tags: ["API5:2023 - BFLA"],
        summary: "Promote User to Admin Role (Unrestricted Privileged Function)",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  userId: { type: "integer", example: 1 },
                  targetRole: { type: "string", example: "SuperAdmin" }
                }
              }
            }
          }
        },
        responses: { "200": { description: "User promoted" } }
      },
      get: {
        tags: ["API5:2023 - BFLA"],
        summary: "Promote User via GET (Verb Tampering)",
        parameters: [
          { name: "userId", in: "query", schema: { type: "integer", example: 1 } },
          { name: "targetRole", in: "query", schema: { type: "string", example: "SuperAdmin" } }
        ],
        responses: { "200": { description: "User promoted" } }
      }
    },
    "/api/admin/audit-logs": {
      delete: {
        tags: ["API5:2023 - BFLA"],
        summary: "Purge System Audit Logs (Unrestricted Function)",
        responses: { "200": { description: "Audit logs purged" } }
      }
    },

    // 6. Business Flows
    "/api/business/coupons/redeem": {
      post: {
        tags: ["API6:2023 - Business Flows"],
        summary: "Redeem Coupon (Sensitive Business Flow without Rate Limit)",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  couponCode: { type: "string", example: "WELCOME100" },
                  cartId: { type: "integer", example: 101 }
                }
              }
            }
          }
        },
        responses: { "200": { description: "Coupon applied" } }
      }
    },
    "/api/business/checkout": {
      post: {
        tags: ["API6:2023 - Business Flows"],
        summary: "Order Checkout Flow (No Bot/Automation Limits)",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { cartId: { type: "integer", example: 101 } }
              }
            }
          }
        },
        responses: { "200": { description: "Checkout completed" } }
      }
    },
    "/api/business/funds/transfer": {
      post: {
        tags: ["API6:2023 - Business Flows"],
        summary: "Financial Funds Transfer (No Step-Up Auth)",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceAccount: { type: "string", example: "ACC-1001" },
                  targetAccount: { type: "string", example: "ACC-9999" },
                  amount: { type: "number", example: 500 }
                }
              }
            }
          }
        },
        responses: { "200": { description: "Transfer completed" } }
      }
    },

    // 7. Security Misconfiguration
    "/api/config/debug": {
      get: {
        tags: ["API8:2023 - Security Misconfiguration"],
        summary: "Debug Environment and Secret Keys Exposure",
        responses: { "200": { description: "Config dump" } }
      }
    },
    "/api/debug/error-trace": {
      get: {
        tags: ["API8:2023 - Security Misconfiguration"],
        summary: "Verbose Error Stack Trace Disclosure",
        responses: { "500": { description: "Stack trace and internal paths returned" } }
      }
    },

    // 8. Excessive Data Exposure
    "/api/public/team-members": {
      get: {
        tags: ["API Excessive Data Exposure"],
        summary: "Public team directory leaking SSN, salary, and password hashes",
        responses: { "200": { description: "Members with leaked private fields" } }
      }
    },
    "/api/public/team-members/{id}": {
      get: {
        tags: ["API Excessive Data Exposure"],
        summary: "Public member details leaking PII and bank details",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", example: 1 } }],
        responses: { "200": { description: "Member with excessive data" } }
      }
    },

    // 9. Mass Assignment
    "/api/auth/register": {
      post: {
        tags: ["API Mass Assignment"],
        summary: "User Registration (Mass Assignment of role, isAdmin, balance)",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string", example: "hacker_test" },
                  email: { type: "string", example: "test@sec.lab" },
                  password: { type: "string", example: "password123" },
                  role: { type: "string", example: "SuperAdmin" },
                  isAdmin: { type: "boolean", example: true },
                  accountBalance: { type: "number", example: 999999 }
                }
              }
            }
          }
        },
        responses: { "201": { description: "User registered with mass-assigned fields" } }
      }
    },
    "/api/users/{id}/mass-assign": {
      patch: {
        tags: ["API Mass Assignment"],
        summary: "Update user profile (Mass Assignment vulnerability)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", example: 1 } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  isAdmin: { type: "boolean", example: true },
                  role: { type: "string", example: "System Administrator" },
                  accountBalance: { type: "number", example: 500000 }
                }
              }
            }
          }
        },
        responses: { "200": { description: "User updated" } }
      }
    }
  }
};

app.get('/openapi.json', (req, res) => {
  logRequest(req, 'API8:2023 - Security Misconfiguration', '/openapi.json', 200);
  res.json(openApiSpec);
});

app.get('/swagger.json', (req, res) => {
  logRequest(req, 'API8:2023 - Security Misconfiguration', '/swagger.json', 200);
  res.json(openApiSpec);
});

// Start server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`[+] Apex Vault Vulnerability Testing Target Active on http://localhost:${PORT}`);
  console.log(`[+] OpenAPI 3.0 Spec available at: http://localhost:${PORT}/openapi.json`);
  console.log(`[+] Swagger Spec available at: http://localhost:${PORT}/swagger.json`);
  console.log(`[+] Implemented All 9 OWASP / Scanner Attack Categories:`);
  console.log(`    1. API1:2023 - Broken Object Level Authorization (BOLA)`);
  console.log(`    2. API2:2023 - Broken Authentication (alg=none & no auth)`);
  console.log(`    3. API3:2023 - Broken Object Property Level Authorization (BOPLA)`);
  console.log(`    4. API4:2023 - Unrestricted Resource Consumption (limitless pagination/batch)`);
  console.log(`    5. API5:2023 - Broken Function Level Authorization (BFLA / Verb tampering)`);
  console.log(`    6. API6:2023 - Unrestricted Access to Sensitive Business Flows`);
  console.log(`    7. API8:2023 - Security Misconfiguration (Debug env / error traces / spec)`);
  console.log(`    8. API Excessive Data Exposure (PII, SSN & credentials in public API)`);
  console.log(`    9. API Mass Assignment (Automatic model binding of isAdmin / role)`);
  console.log(`[+] No authentication or authorization enforced.`);
  console.log(`=======================================================`);
});
