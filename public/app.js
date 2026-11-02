// Configuration for demo resources
const resources = {
  orders: {
    base: '/api/orders',
    sampleIds: [101, 102, 103, 104],
    defaultMethod: 'GET',
    defaultPayload: JSON.stringify({
      status: "Hijacked by Attacker",
      shippingAddress: "Pentest Lab, 1337 Cyber Way"
    }, null, 2)
  },
  users: {
    base: '/api/users',
    sampleIds: [1, 2, 3, 4],
    defaultMethod: 'GET',
    defaultPayload: JSON.stringify({
      role: "Global Administrator (Escalated)",
      accountBalance: 999999.00
    }, null, 2)
  },
  invoices: {
    base: '/api/invoices',
    sampleIds: [2001, 2002, 2003],
    defaultMethod: 'GET',
    defaultPayload: JSON.stringify({
      status: "Redirected to Offshore Bank",
      bankIban: "US99HACK99999999999999"
    }, null, 2)
  }
};

let currentResource = 'orders';

// DOM Elements
const tabOrders = document.getElementById('tabOrders');
const tabUsers = document.getElementById('tabUsers');
const tabInvoices = document.getElementById('tabInvoices');
const httpMethod = document.getElementById('httpMethod');
const objectIdInput = document.getElementById('objectId');
const quickPills = document.getElementById('quickPills');
const displayMethod = document.getElementById('displayMethod');
const displayUrl = document.getElementById('displayUrl');
const btnExecute = document.getElementById('btnExecute');
const payloadContainer = document.getElementById('payloadContainer');
const requestPayload = document.getElementById('requestPayload');
const responseViewer = document.getElementById('responseViewer');
const statusIndicator = document.getElementById('statusIndicator');
const responseStatusText = document.getElementById('responseStatusText');
const btnCopyJson = document.getElementById('btnCopyJson');
const logsContainer = document.getElementById('logsContainer');
const btnClearLogs = document.getElementById('btnClearLogs');
const statLiveRequests = document.getElementById('statLiveRequests');

// Initialize Quick ID Pills
function renderPills() {
  quickPills.innerHTML = '';
  const ids = resources[currentResource].sampleIds;
  ids.forEach(id => {
    const pill = document.createElement('span');
    pill.className = 'pill-id';
    pill.textContent = `ID: ${id}`;
    pill.addEventListener('click', () => {
      objectIdInput.value = id;
      updateUrlDisplay();
    });
    quickPills.appendChild(pill);
  });
}

// Update URL bar preview
function updateUrlDisplay() {
  const method = httpMethod.value;
  const id = objectIdInput.value.trim() || '1';
  const url = `${resources[currentResource].base}/${id}`;
  
  displayMethod.textContent = method;
  displayMethod.className = `method-tag method-${method.toLowerCase().substring(0, 3)}`;
  displayUrl.textContent = url;

  if (method === 'PUT') {
    payloadContainer.classList.remove('hidden');
  } else {
    payloadContainer.classList.add('hidden');
  }
}

// Switch Active Resource Tab
function selectResource(resKey) {
  currentResource = resKey;
  [tabOrders, tabUsers, tabInvoices].forEach(tab => tab.classList.remove('active'));
  
  if (resKey === 'orders') tabOrders.classList.add('active');
  if (resKey === 'users') tabUsers.classList.add('active');
  if (resKey === 'invoices') tabInvoices.classList.add('active');

  objectIdInput.value = resources[resKey].sampleIds[0];
  requestPayload.value = resources[resKey].defaultPayload;
  renderPills();
  updateUrlDisplay();
}

// Execute HTTP Request
async function executeRequest() {
  const method = httpMethod.value;
  const id = objectIdInput.value.trim();
  if (!id) {
    alert("Please provide a valid Object ID");
    return;
  }

  const endpoint = `${resources[currentResource].base}/${id}`;

  statusIndicator.className = 'status-indicator ready';
  responseStatusText.textContent = `Sending ${method} ${endpoint}...`;
  responseViewer.textContent = "Processing request without authentication...";

  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (method === 'PUT') {
    try {
      options.body = requestPayload.value;
      JSON.parse(requestPayload.value); // test syntax
    } catch (e) {
      alert("Invalid JSON payload: " + e.message);
      return;
    }
  }

  const startTime = performance.now();

  try {
    const res = await fetch(endpoint, options);
    const duration = Math.round(performance.now() - startTime);
    const data = await res.json();

    if (res.ok) {
      statusIndicator.className = 'status-indicator success';
      responseStatusText.textContent = `Status: ${res.status} OK (${duration}ms) - Vulnerability Confirmed`;
    } else {
      statusIndicator.className = 'status-indicator error';
      responseStatusText.textContent = `Status: ${res.status} ${res.statusText} (${duration}ms)`;
    }

    responseViewer.textContent = JSON.stringify(data, null, 2);
    fetchLogs(); // refresh logs immediately
  } catch (err) {
    statusIndicator.className = 'status-indicator error';
    responseStatusText.textContent = `Network Error: ${err.message}`;
    responseViewer.textContent = JSON.stringify({ error: err.message }, null, 2);
  }
}

// Real-Time Scanner Traffic Monitor
let totalRequestsSeen = 0;
async function fetchLogs() {
  try {
    const res = await fetch('/api/logs');
    if (!res.ok) return;
    const { logs } = await res.json();
    statLiveRequests.textContent = logs.length;

    if (logs.length === 0) {
      logsContainer.innerHTML = '<div class="empty-state">Waiting for scanner or browser API requests...</div>';
      return;
    }

    logsContainer.innerHTML = logs.map(log => {
      const isOk = log.status >= 200 && log.status < 300;
      const statusClass = isOk ? 'status-200' : 'status-404';
      const methodClass = `method-${log.method.toLowerCase().substring(0, 3)}`;

      return `
        <div class="log-item">
          <div class="log-left">
            <span class="badge-method ${methodClass}">${log.method}</span>
            <span class="log-url" title="${log.url}">${log.url}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="log-time">${log.time}</span>
            <span class="log-status ${statusClass}">${log.status}</span>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    // Ignore transient poll errors
  }
}

// Event Listeners
tabOrders.addEventListener('click', () => selectResource('orders'));
tabUsers.addEventListener('click', () => selectResource('users'));
tabInvoices.addEventListener('click', () => selectResource('invoices'));

httpMethod.addEventListener('change', updateUrlDisplay);
objectIdInput.addEventListener('input', updateUrlDisplay);
btnExecute.addEventListener('click', executeRequest);

btnCopyJson.addEventListener('click', () => {
  navigator.clipboard.writeText(responseViewer.textContent);
  const orig = btnCopyJson.innerHTML;
  btnCopyJson.innerHTML = `<span>Copied!</span>`;
  setTimeout(() => btnCopyJson.innerHTML = orig, 1500);
});

btnClearLogs.addEventListener('click', async () => {
  await fetch('/api/reset', { method: 'POST' });
  fetchLogs();
});

// Setup copy buttons in chips
document.querySelectorAll('.btn-copy-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(btn.getAttribute('data-copy'));
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 1500);
  });
});

// Table quick test buttons
document.querySelectorAll('.test-row-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const method = btn.getAttribute('data-method');
    const resKey = btn.getAttribute('data-resource');
    const targetId = btn.getAttribute('data-id');

    selectResource(resKey);
    httpMethod.value = method;
    objectIdInput.value = targetId;
    updateUrlDisplay();
    executeRequest();
    window.scrollTo({ top: 300, behavior: 'smooth' });
  });
});

// Initial boot
renderPills();
updateUrlDisplay();
fetchLogs();
setInterval(fetchLogs, 2500);
