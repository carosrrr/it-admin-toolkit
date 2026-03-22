// ============================================================
// NAVIGATION
// ============================================================
document.querySelectorAll('.nav-item').forEach(function(item) {
  item.addEventListener('click', function() {
    document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
    document.querySelectorAll('.tool-section').forEach(function(s) { s.classList.remove('active'); });
    item.classList.add('active');
    document.getElementById('tool-' + item.dataset.tool).classList.add('active');
  });
});

function copyText(text) {
  navigator.clipboard.writeText(text).then(function() {
    // brief visual feedback would go here
  });
}

function makeResult(html, id) {
  document.getElementById(id).innerHTML = html;
}

// ============================================================
// SUBNET CALCULATOR
// ============================================================
function calcSubnet() {
  var input = document.getElementById('cidr-input').value.trim();
  var parts = input.split('/');
  if (parts.length !== 2) { makeResult('<div class="result" style="color:var(--red)">Invalid CIDR format. Use: 10.0.1.0/24</div>', 'subnet-result'); return; }
  var ip = parts[0].split('.').map(Number);
  var prefix = parseInt(parts[1]);
  if (ip.length !== 4 || isNaN(prefix) || prefix < 0 || prefix > 32) { makeResult('<div class="result" style="color:var(--red)">Invalid input.</div>', 'subnet-result'); return; }

  var ipNum = ((ip[0]<<24)|(ip[1]<<16)|(ip[2]<<8)|ip[3])>>>0;
  var mask = prefix === 0 ? 0 : (0xFFFFFFFF << (32-prefix))>>>0;
  var network = (ipNum & mask)>>>0;
  var broadcast = (network | (~mask>>>0))>>>0;
  var first = prefix >= 31 ? network : (network+1)>>>0;
  var last = prefix >= 31 ? broadcast : (broadcast-1)>>>0;
  var hosts = prefix >= 31 ? (prefix===32?1:2) : Math.pow(2, 32-prefix)-2;

  function toIP(n) { return [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.'); }
  function toBin(n) { return [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].map(function(o){return ('00000000'+o.toString(2)).slice(-8);}).join('.'); }

  makeResult(
    '<div class="result-grid">' +
    '<div class="result-card"><div class="val">' + toIP(network) + '</div><div class="lbl">Network Address</div></div>' +
    '<div class="result-card"><div class="val">' + toIP(broadcast) + '</div><div class="lbl">Broadcast Address</div></div>' +
    '<div class="result-card"><div class="val">' + toIP(first) + '</div><div class="lbl">First Usable IP</div></div>' +
    '<div class="result-card"><div class="val">' + toIP(last) + '</div><div class="lbl">Last Usable IP</div></div>' +
    '<div class="result-card"><div class="val">' + toIP(mask) + '</div><div class="lbl">Subnet Mask</div></div>' +
    '<div class="result-card"><div class="val">' + hosts.toLocaleString() + '</div><div class="lbl">Usable Hosts</div></div>' +
    '<div class="result-card"><div class="val">/' + prefix + '</div><div class="lbl">CIDR Prefix</div></div>' +
    '<div class="result-card" style="grid-column:1/-1"><div class="val">' + toBin(mask) + '</div><div class="lbl">Mask (binary)</div></div>' +
    '</div>', 'subnet-result');
}

// ============================================================
// IP CONVERTER
// ============================================================
function convertIP() {
  var input = document.getElementById('ip-input').value.trim();
  var parts = input.split('.').map(Number);
  if (parts.length !== 4 || parts.some(function(p){ return isNaN(p)||p<0||p>255; })) {
    makeResult('<div class="result" style="color:var(--red)">Invalid IP address.</div>', 'ip-result'); return;
  }
  var bin = parts.map(function(p){ return ('00000000'+p.toString(2)).slice(-8); }).join('.');
  var hex = parts.map(function(p){ return ('00'+p.toString(16).toUpperCase()).slice(-2); }).join('.');
  var ipInt = ((parts[0]<<24)|(parts[1]<<16)|(parts[2]<<8)|parts[3])>>>0;
  var cls = parts[0]<128?'A':parts[0]<192?'B':parts[0]<224?'C':parts[0]<240?'D':'E';
  var priv = (parts[0]===10||(parts[0]===172&&parts[1]>=16&&parts[1]<=31)||(parts[0]===192&&parts[1]===168));

  makeResult(
    '<div class="result-grid">' +
    '<div class="result-card"><div class="val">' + input + '</div><div class="lbl">Decimal</div></div>' +
    '<div class="result-card" style="grid-column:1/-1"><div class="val">' + bin + '</div><div class="lbl">Binary</div></div>' +
    '<div class="result-card"><div class="val">' + hex + '</div><div class="lbl">Hexadecimal</div></div>' +
    '<div class="result-card"><div class="val">' + ipInt + '</div><div class="lbl">Integer</div></div>' +
    '<div class="result-card"><div class="val">Class ' + cls + '</div><div class="lbl">IP Class</div></div>' +
    '<div class="result-card"><div class="val">' + (priv?'<span style="color:var(--accent)">Private</span>':'<span style="color:var(--yellow)">Public</span>') + '</div><div class="lbl">Type</div></div>' +
    '</div>', 'ip-result');
}

// ============================================================
// PORT LOOKUP
// ============================================================
var PORTS = [
  [20,'FTP Data','TCP'],[21,'FTP Control','TCP'],[22,'SSH','TCP'],[23,'Telnet','TCP'],[25,'SMTP','TCP'],
  [53,'DNS','TCP/UDP'],[67,'DHCP Server','UDP'],[68,'DHCP Client','UDP'],[80,'HTTP','TCP'],[110,'POP3','TCP'],
  [119,'NNTP','TCP'],[123,'NTP','UDP'],[135,'MS RPC','TCP'],[137,'NetBIOS Name','UDP'],[138,'NetBIOS Datagram','UDP'],
  [139,'NetBIOS Session','TCP'],[143,'IMAP','TCP'],[161,'SNMP','UDP'],[162,'SNMP Trap','UDP'],[389,'LDAP','TCP'],
  [443,'HTTPS','TCP'],[445,'SMB','TCP'],[465,'SMTPS','TCP'],[514,'Syslog','UDP'],[587,'SMTP Submission','TCP'],
  [636,'LDAPS','TCP'],[993,'IMAPS','TCP'],[995,'POP3S','TCP'],[1433,'MS SQL','TCP'],[1434,'MS SQL Browser','UDP'],
  [3306,'MySQL','TCP'],[3389,'RDP','TCP'],[5432,'PostgreSQL','TCP'],[5900,'VNC','TCP'],[5985,'WinRM HTTP','TCP'],
  [5986,'WinRM HTTPS','TCP'],[8080,'HTTP Proxy','TCP'],[8443,'HTTPS Alt','TCP'],[9090,'Prometheus','TCP'],
  [27017,'MongoDB','TCP'],[6379,'Redis','TCP']
];

function searchPorts() {
  var q = document.getElementById('port-input').value.trim().toLowerCase();
  if (!q) { makeResult('', 'port-result'); return; }
  var matches = PORTS.filter(function(p) {
    return p[0].toString()===q || p[1].toLowerCase().indexOf(q)!==-1 || p[2].toLowerCase().indexOf(q)!==-1;
  });
  if (matches.length===0) { makeResult('<div class="result" style="color:var(--text3)">No matching ports found.</div>', 'port-result'); return; }
  var html = '<div style="margin-top:1rem">';
  matches.forEach(function(p) {
    html += '<div class="cheat-item"><span class="cheat-cmd">'+p[0]+'</span><span style="flex:1;color:var(--text)">'+p[1]+'</span><span class="tag tag-blue">'+p[2]+'</span></div>';
  });
  html += '</div>';
  makeResult(html, 'port-result');
}

// ============================================================
// PASSWORD GENERATOR
// ============================================================
function genPassword() {
  var len = parseInt(document.getElementById('pw-length').value);
  var chars = '';
  if (document.getElementById('pw-upper').checked) chars += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  if (document.getElementById('pw-lower').checked) chars += 'abcdefghjkmnpqrstuvwxyz';
  if (document.getElementById('pw-digits').checked) chars += '23456789';
  if (document.getElementById('pw-special').checked) chars += '!@#$%&*()=+?';
  if (!chars) { makeResult('<div class="result" style="color:var(--red)">Select at least one option.</div>', 'pw-result'); return; }

  var arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  var pw = '';
  for (var i=0; i<len; i++) pw += chars[arr[i]%chars.length];

  var strength = 0;
  if (/[a-z]/.test(pw)) strength++;
  if (/[A-Z]/.test(pw)) strength++;
  if (/[0-9]/.test(pw)) strength++;
  if (/[^a-zA-Z0-9]/.test(pw)) strength++;
  if (len >= 16) strength++;
  var pct = Math.min(100, strength * 20 + (len > 12 ? 20 : 0));
  var sColor = pct >= 80 ? 'var(--accent)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)';
  var sLabel = pct >= 80 ? 'Strong' : pct >= 50 ? 'Medium' : 'Weak';

  makeResult(
    '<div class="result" style="font-size:1.1rem;letter-spacing:1px;word-break:break-all">' + pw +
    '<button class="copy-btn btn-sm" onclick="copyText(\'' + pw + '\')">Copy</button></div>' +
    '<div style="margin-top:0.5rem;font-size:0.8rem;color:var(--text2)">' + sLabel + ' (' + Math.floor(Math.log2(Math.pow(chars.length,len))) + ' bits of entropy)</div>' +
    '<div class="strength-bar"><div class="strength-fill" style="width:'+pct+'%;background:'+sColor+'"></div></div>', 'pw-result');
}
genPassword();

// ============================================================
// BASE64
// ============================================================
function b64Encode() {
  try {
    var input = document.getElementById('b64-input').value;
    var encoded = btoa(unescape(encodeURIComponent(input)));
    makeResult('<div class="result">' + encoded + '<button class="copy-btn btn-sm" onclick="copyText(this.parentElement.textContent.replace(\'Copy\',\'\').trim())">Copy</button></div>', 'b64-result');
  } catch(e) { makeResult('<div class="result" style="color:var(--red)">Error: ' + e.message + '</div>', 'b64-result'); }
}
function b64Decode() {
  try {
    var input = document.getElementById('b64-input').value.trim();
    var decoded = decodeURIComponent(escape(atob(input)));
    makeResult('<div class="result">' + decoded.replace(/</g,'&lt;') + '<button class="copy-btn btn-sm" onclick="copyText(this.parentElement.textContent.replace(\'Copy\',\'\').trim())">Copy</button></div>', 'b64-result');
  } catch(e) { makeResult('<div class="result" style="color:var(--red)">Invalid Base64 input.</div>', 'b64-result'); }
}

// ============================================================
// JSON FORMATTER
// ============================================================
function formatJSON(spaces) {
  spaces = spaces || 2;
  try {
    var input = document.getElementById('json-input').value.trim();
    var parsed = JSON.parse(input);
    var formatted = JSON.stringify(parsed, null, spaces);
    makeResult('<div class="result"><pre style="margin:0;white-space:pre-wrap">' + formatted.replace(/</g,'&lt;') + '</pre><button class="copy-btn btn-sm" onclick="copyText(this.parentElement.textContent.replace(\'Copy\',\'\').trim())">Copy</button></div>' +
      '<div style="margin-top:0.5rem;font-size:0.75rem;color:var(--text3)">' + Object.keys(parsed).length + ' top-level keys | ' + formatted.length + ' chars</div>', 'json-result');
  } catch(e) {
    makeResult('<div class="result" style="color:var(--red)">Invalid JSON: ' + e.message.replace(/</g,'&lt;') + '</div>', 'json-result');
  }
}
function minifyJSON() {
  try {
    var input = document.getElementById('json-input').value.trim();
    var minified = JSON.stringify(JSON.parse(input));
    makeResult('<div class="result">' + minified.replace(/</g,'&lt;') + '<button class="copy-btn btn-sm" onclick="copyText(this.parentElement.textContent.replace(\'Copy\',\'\').trim())">Copy</button></div>' +
      '<div style="margin-top:0.5rem;font-size:0.75rem;color:var(--text3)">' + minified.length + ' chars (minified)</div>', 'json-result');
  } catch(e) {
    makeResult('<div class="result" style="color:var(--red)">Invalid JSON: ' + e.message.replace(/</g,'&lt;') + '</div>', 'json-result');
  }
}

// ============================================================
// REGEX TESTER
// ============================================================
function testRegex() {
  var pattern = document.getElementById('regex-pattern').value;
  var flags = document.getElementById('regex-flags').value;
  var input = document.getElementById('regex-input').value;
  if (!pattern || !input) { makeResult('', 'regex-result'); return; }

  try {
    var re = new RegExp(pattern, flags);
    var matches = [];
    var match;
    if (flags.indexOf('g') !== -1) {
      while ((match = re.exec(input)) !== null) {
        matches.push({ text: match[0], index: match.index, groups: match.slice(1) });
        if (!match[0].length) re.lastIndex++;
      }
    } else {
      match = re.exec(input);
      if (match) matches.push({ text: match[0], index: match.index, groups: match.slice(1) });
    }

    // Highlight matches in text
    var highlighted = '';
    var lastIdx = 0;
    matches.forEach(function(m) {
      highlighted += input.substring(lastIdx, m.index).replace(/</g,'&lt;');
      highlighted += '<span style="background:rgba(74,240,192,0.25);color:var(--accent);border-radius:2px;padding:0 2px">' + m.text.replace(/</g,'&lt;') + '</span>';
      lastIdx = m.index + m.text.length;
    });
    highlighted += input.substring(lastIdx).replace(/</g,'&lt;');

    var html = '<div class="result" style="white-space:pre-wrap">' + highlighted + '</div>';
    html += '<div style="margin-top:0.8rem;font-size:0.8rem;color:var(--text2)">' + matches.length + ' match' + (matches.length!==1?'es':'') + ' found</div>';

    if (matches.length > 0) {
      html += '<div style="margin-top:0.5rem">';
      matches.forEach(function(m, i) {
        html += '<span class="tag tag-green">Match ' + (i+1) + ': "' + m.text.replace(/</g,'&lt;') + '" at index ' + m.index + '</span> ';
        if (m.groups.length > 0) {
          m.groups.forEach(function(g, gi) {
            html += '<span class="tag tag-blue">Group ' + (gi+1) + ': "' + (g||'').replace(/</g,'&lt;') + '"</span> ';
          });
        }
      });
      html += '</div>';
    }
    makeResult(html, 'regex-result');
  } catch(e) {
    makeResult('<div class="result" style="color:var(--red)">Invalid regex: ' + e.message + '</div>', 'regex-result');
  }
}

// ============================================================
// CLI CHEATSHEET
// ============================================================
var CHEATSHEET = {
  "Azure CLI - Identity": [
    ["az login", "Login to Azure"],
    ["az account list -o table", "List subscriptions"],
    ["az account set -s NAME", "Switch subscription"],
    ["az ad user list -o table", "List Entra ID users"],
    ["az ad user create --display-name NAME --password PWD --user-principal-name UPN", "Create user"],
    ["az ad group list -o table", "List groups"],
    ["az ad group member add --group GROUP --member-id ID", "Add user to group"]
  ],
  "Azure CLI - Resources": [
    ["az group list -o table", "List resource groups"],
    ["az group create -n NAME -l LOCATION", "Create resource group"],
    ["az resource list -g RG -o table", "List resources in RG"],
    ["az vm list -o table", "List VMs"],
    ["az vm start -g RG -n NAME", "Start VM"],
    ["az vm stop -g RG -n NAME", "Stop VM"],
    ["az vm deallocate -g RG -n NAME", "Deallocate VM (stop billing)"],
    ["az storage account list -o table", "List storage accounts"]
  ],
  "Azure CLI - Networking": [
    ["az network vnet list -o table", "List VNets"],
    ["az network nsg list -o table", "List NSGs"],
    ["az network nsg rule list --nsg-name NAME -g RG -o table", "List NSG rules"],
    ["az network public-ip list -o table", "List public IPs"]
  ],
  "PowerShell - Graph API": [
    ["Connect-MgGraph -Scopes 'User.Read.All'", "Connect to Graph"],
    ["Disconnect-MgGraph", "Disconnect current session (use before switching accounts)"],
    ["Get-MgUser -All | Select DisplayName, UPN", "List all users"],
    ["Get-MgUser -UserId UPN", "Get specific user"],
    ["New-MgUser -DisplayName NAME -UserPrincipalName UPN -PasswordProfile @{...}", "Create user"],
    ["Update-MgUser -UserId ID -AccountEnabled:$false", "Disable user"],
    ["Get-MgGroup -All", "List groups"],
    ["Get-MgDevice -All", "List devices"],
    ["Get-MgDirectoryRole -All", "List admin roles"]
  ],
  "PowerShell - Azure (Az Module)": [
    ["Connect-AzAccount", "Login to Azure"],
    ["Get-AzSubscription", "List subscriptions"],
    ["Set-AzContext -Subscription NAME", "Switch subscription"],
    ["Get-AzVM -ResourceGroupName RG", "List VMs"],
    ["Start-AzVM -ResourceGroupName RG -Name NAME", "Start VM"],
    ["Stop-AzVM -ResourceGroupName RG -Name NAME -Force", "Stop VM"],
    ["Get-AzStorageAccount", "List storage accounts"],
    ["Get-AzKeyVault", "List key vaults"]
  ],
  "Terraform": [
    ["terraform init", "Initialize working directory"],
    ["terraform plan", "Preview changes"],
    ["terraform apply", "Apply changes"],
    ["terraform destroy", "Destroy all resources"],
    ["terraform fmt -recursive", "Format all .tf files"],
    ["terraform validate", "Validate syntax"],
    ["terraform state list", "List resources in state"],
    ["terraform import TYPE.NAME AZURE_ID", "Import existing resource"]
  ],
  "Docker": [
    ["docker build -t NAME:TAG .", "Build image"],
    ["docker run -d -p 8080:80 NAME", "Run container (detached)"],
    ["docker ps", "List running containers"],
    ["docker logs CONTAINER", "View logs"],
    ["docker exec -it CONTAINER bash", "Shell into container"],
    ["docker stop CONTAINER", "Stop container"],
    ["docker images", "List images"],
    ["docker system prune -a", "Clean all unused data"]
  ]
};

function renderCheat(filter) {
  var html = '';
  for (var cat in CHEATSHEET) {
    var items = CHEATSHEET[cat];
    var filtered = items.filter(function(item) {
      if (!filter) return true;
      return item[0].toLowerCase().indexOf(filter)!==-1 || item[1].toLowerCase().indexOf(filter)!==-1 || cat.toLowerCase().indexOf(filter)!==-1;
    });
    if (filtered.length === 0) continue;
    html += '<div class="cheat-category"><h3>' + cat + '</h3>';
    filtered.forEach(function(item) {
      html += '<div class="cheat-item"><span class="cheat-cmd" onclick="copyText(\'' + item[0].replace(/'/g,"\\'") + '\')" title="Click to copy">' + item[0] + '</span><span class="cheat-desc">' + item[1] + '</span></div>';
    });
    html += '</div>';
  }
  if (!html) html = '<div style="color:var(--text3);padding:1rem">No commands match your search.</div>';
  document.getElementById('cheat-content').innerHTML = html;
}
function filterCheat() { renderCheat(document.getElementById('cheat-search').value.toLowerCase()); }
renderCheat();

// ============================================================
// SLA CALCULATOR
// ============================================================
function addSLAService() {
  var div = document.createElement('div');
  div.className = 'sla-service';
  div.innerHTML = '<input type="text" placeholder="Service name"><input type="number" step="0.01" min="0" max="100" value="99.9" style="width:110px"><span style="color:var(--text3);font-size:0.85rem">%</span><button class="sla-remove btn-sm" onclick="this.parentElement.remove();calcSLA()">x</button>';
  document.getElementById('sla-services').appendChild(div);
}

function calcSLA() {
  var services = document.querySelectorAll('.sla-service');
  var composite = 1;
  var details = [];
  services.forEach(function(s) {
    var name = s.querySelector('input[type=text]').value || 'Unnamed';
    var sla = parseFloat(s.querySelector('input[type=number]').value);
    if (isNaN(sla)) return;
    composite *= (sla / 100);
    details.push({ name: name, sla: sla });
  });

  var compositePct = composite * 100;
  var monthlyMinutes = 43200; // 30 days
  var downtime = monthlyMinutes * (1 - composite);
  var yearlyDowntime = downtime * 12;

  var dtColor = compositePct >= 99.9 ? 'var(--accent)' : compositePct >= 99 ? 'var(--yellow)' : 'var(--red)';

  var html = '<div class="result-grid" style="margin-top:1.5rem">';
  html += '<div class="result-card"><div class="val" style="color:'+dtColor+'">' + compositePct.toFixed(6) + '%</div><div class="lbl">Composite SLA</div></div>';
  html += '<div class="result-card"><div class="val">' + downtime.toFixed(1) + ' min</div><div class="lbl">Monthly Downtime</div></div>';
  html += '<div class="result-card"><div class="val">' + (yearlyDowntime/60).toFixed(1) + ' hrs</div><div class="lbl">Yearly Downtime</div></div>';
  html += '<div class="result-card"><div class="val">' + details.length + '</div><div class="lbl">Services in Chain</div></div>';
  html += '</div>';

  html += '<div style="margin-top:1rem;font-size:0.8rem;color:var(--text2)">';
  html += 'Formula: ';
  details.forEach(function(d, i) {
    html += d.sla + '%';
    if (i < details.length-1) html += ' x ';
  });
  html += ' = ' + compositePct.toFixed(6) + '%';
  html += '</div>';

  // SLA reference table
  html += '<div style="margin-top:1.5rem"><div class="result-label">SLA Reference</div>';
  html += '<div style="font-size:0.8rem;color:var(--text2);font-family:var(--mono)">';
  var refs = [[99,'7.2 hrs/mo'],[99.9,'43.2 min/mo'],[99.95,'21.6 min/mo'],[99.99,'4.3 min/mo'],[99.999,'26 sec/mo']];
  refs.forEach(function(r) {
    var marker = Math.abs(compositePct - r[0]) < 0.05 ? ' <-- your SLA' : '';
    html += r[0] + '% = ' + r[1] + '<span style="color:var(--accent)">' + marker + '</span><br>';
  });
  html += '</div></div>';

  makeResult(html, 'sla-result');
}

// ============================================================
// TEXT DIFF
// ============================================================
function runDiff() {
  var a = document.getElementById('diff-a').value.split('\n');
  var b = document.getElementById('diff-b').value.split('\n');
  var maxLen = Math.max(a.length, b.length);
  var html = '<div class="diff-output">';
  var added = 0, removed = 0, same = 0;

  for (var i = 0; i < maxLen; i++) {
    var lineA = i < a.length ? a[i] : null;
    var lineB = i < b.length ? b[i] : null;

    if (lineA === lineB) {
      html += '<div class="diff-line diff-same">  ' + (lineA||'').replace(/</g,'&lt;') + '</div>';
      same++;
    } else {
      if (lineA !== null) {
        html += '<div class="diff-line diff-remove">- ' + lineA.replace(/</g,'&lt;') + '</div>';
        removed++;
      }
      if (lineB !== null) {
        html += '<div class="diff-line diff-add">+ ' + lineB.replace(/</g,'&lt;') + '</div>';
        added++;
      }
    }
  }
  html += '</div>';
  html += '<div style="margin-top:0.8rem;font-size:0.8rem">';
  html += '<span class="tag tag-green">+' + added + ' added</span>';
  html += '<span class="tag tag-red">-' + removed + ' removed</span>';
  html += '<span style="color:var(--text3);font-size:0.75rem;margin-left:0.5rem">' + same + ' unchanged</span>';
  html += '</div>';
  makeResult(html, 'diff-result');
}

// Init subnet calc with default value
calcSubnet();

// ============================================================
// AZURE SERVICES GUIDE
// ============================================================
var AZURE_SERVICES = [
  // ----- Compute -----
  { cat:"Compute", name:"Virtual Machines", tags:["IaaS","compute","VM"],
    path:"Portal > Virtual Machines > + Create",
    short:"Run Windows or Linux VMs in the cloud with full OS control.",
    desc:"Azure VMs give you full control over the operating system, installed software, and configurations. You choose the VM size (CPU, RAM, disk), OS image, and region. VMs are billed per-minute while running.",
    tips:["Always deallocate VMs when not in use (Stop from portal still bills; Deallocate does not).","Use B-series VMs for dev/test workloads - they are burstable and much cheaper.","Enable Azure Backup on every production VM before you need it.","Use Availability Sets or Availability Zones for production workloads that need uptime SLA.","Tag every VM with owner and cost center for cost tracking."],
    bugs:["Stopping a VM from inside the OS (shutdown) does NOT deallocate it - you still get billed. Always deallocate from the Azure Portal or CLI.","RDP/SSH not connecting? Check the NSG rules on the subnet AND the NIC-level NSG. Both must allow the traffic.","VM stuck in 'Creating' state? Often caused by quota limits. Check Subscription > Usage + quotas.","Disk performance issues? Standard HDD is very slow. Switch to Standard SSD or Premium SSD.","Forgot to set a static IP? The public IP changes every time you deallocate. Set it to Static in the Public IP resource."]
  },
  { cat:"Compute", name:"App Service", tags:["PaaS","web","hosting","webapp"],
    path:"Portal > App Services > + Create",
    short:"Host web apps, APIs, and backends without managing infrastructure.",
    desc:"Azure App Service is a fully managed PaaS for hosting web applications, REST APIs, and mobile backends. Supports .NET, Node.js, Python, Java, PHP, and containers. Handles OS patching, scaling, and load balancing for you.",
    tips:["Use deployment slots (staging/production) to deploy with zero downtime.","Enable 'Always On' for production apps to prevent cold starts.","Use App Service Plan at least S1 for production. Free/Shared tiers have severe limitations.","Configure health check endpoint at /health so Azure knows when your app is unhealthy.","Use Managed Identity instead of connection strings to access other Azure services."],
    bugs:["App keeps restarting? Check Application Insights or the Diagnose and Solve Problems blade. Often caused by exceeding memory limits.","Cold starts on consumption plan can take 10-30 seconds. Use Premium plan or Always On.","Custom domain not working? You need to add both a CNAME and a TXT verification record.","Deployment from GitHub failing? Check the deployment center logs, not just GitHub Actions.","Getting 403 Forbidden? Check IP restrictions under Networking > Access Restrictions."]
  },
  { cat:"Compute", name:"Azure Functions", tags:["serverless","compute","event-driven"],
    path:"Portal > Function App > + Create",
    short:"Run event-driven serverless code without managing servers.",
    desc:"Azure Functions lets you run small pieces of code (functions) triggered by events like HTTP requests, timers, queue messages, or blob uploads. You only pay for execution time. Great for automation, webhooks, and integrations.",
    tips:["Use Consumption plan for unpredictable workloads. Use Premium plan if you need VNet integration or no cold starts.","Keep functions small and focused. One function = one responsibility.","Use Durable Functions for complex workflows that need to coordinate multiple steps.","Store secrets in Key Vault and reference them in app settings, never hardcode.","Timer triggers use CRON syntax. Example: '0 */5 * * * *' runs every 5 minutes."],
    bugs:["Cold start on Consumption plan can be 5-15 seconds. Premium plan eliminates this but costs more.","Function timeout defaults to 5 minutes on Consumption. Increase it or switch plans for long-running tasks.","'No such host is known' error? The function app name might conflict with a deleted app. Names are globally unique and reserved for ~48h after deletion.","Blob trigger can have up to 10-minute delay on Consumption plan. Use Event Grid trigger for near-instant.","Local development works but cloud fails? Check that the function runtime version matches locally and in Azure."]
  },
  { cat:"Compute", name:"Container Instances (ACI)", tags:["container","docker","serverless"],
    path:"Portal > Container Instances > + Create",
    short:"Run Docker containers without managing VMs or orchestrators.",
    desc:"ACI lets you run containers in Azure without provisioning VMs or adopting Kubernetes. Just specify the image, CPU, memory, and you get a running container with a public IP. Great for simple workloads, batch jobs, and dev/test.",
    tips:["Use ACI for simple single-container workloads. If you need auto-scaling or multiple containers talking to each other, consider Container Apps or AKS.","Set restart policy to 'Never' for batch/one-time jobs, 'Always' for long-running services.","Pull images from ACR (Azure Container Registry) for faster pulls and private access.","Always set resource limits (CPU and memory). ACI charges per second based on what you allocate.","Use container groups to run sidecar containers alongside your main container."],
    bugs:["Container keeps restarting? Check container logs with 'az container logs'. Often caused by the app crashing on startup.","Image pull fails from ACR? Enable Admin User on ACR or use Managed Identity authentication.","Public IP not accessible? Check if the port in ACI matches the port your app listens on inside the container.","DNS name already taken? ACI DNS labels are per-region. Try a different label or region.","Container OOM killed? You allocated too little memory. Check logs and increase the memory limit."]
  },
  // ----- Networking -----
  { cat:"Networking", name:"Virtual Network (VNet)", tags:["network","VNet","subnet"],
    path:"Portal > Virtual Networks > + Create",
    short:"Create isolated private networks for your Azure resources.",
    desc:"VNets are the fundamental building block of networking in Azure. They provide isolation, segmentation (subnets), and connectivity for VMs, App Services, databases, and more. Every resource that needs network access should be in a VNet.",
    tips:["Plan your address space carefully. Use /16 for the VNet and /24 for subnets as a starting point.","Use Network Security Groups (NSGs) on every subnet. Default deny-all inbound, allow only what you need.","Use VNet Peering to connect VNets instead of VPN gateways (cheaper and faster for same-region).","Reserve a subnet for private endpoints (Azure PaaS services connecting privately to your VNet).","Name subnets by purpose: snet-workload, snet-management, snet-endpoints."],
    bugs:["Subnets cannot overlap with each other within the same VNet. Plan CIDR ranges before creating.","Cannot delete a VNet that has resources in it. Remove all connected NICs, subnets, and peerings first.","Private endpoints require a dedicated subnet. Some services also require specific subnet delegations.","VNet peering is not transitive. If VNet A peers with B, and B peers with C, A cannot reach C automatically.","Changing the address space of a VNet requires removing all peerings first, then re-adding them."]
  },
  { cat:"Networking", name:"Network Security Group (NSG)", tags:["firewall","security","rules","network"],
    path:"Portal > Network Security Groups > + Create",
    short:"Filter network traffic to and from Azure resources with rules.",
    desc:"NSGs contain security rules that allow or deny inbound/outbound traffic. They can be applied to subnets or individual NICs. Rules are evaluated by priority (lower number = higher priority). This is your primary firewall in Azure.",
    tips:["Always add a deny-all rule at the lowest priority (4096) as a safety net.","Apply NSGs to subnets (not individual NICs) for easier management.","Use Application Security Groups (ASGs) to group VMs and write rules by role instead of IP.","NSG flow logs (stored in Storage Account) are essential for troubleshooting connectivity issues.","Use the 'Effective security rules' blade on a NIC to see the actual rules being applied after merging."],
    bugs:["Two NSGs can apply to a VM: one on the subnet, one on the NIC. Traffic must pass BOTH. This is the #1 cause of 'it should work but does not'.","Default rules cannot be deleted, only overridden with higher-priority rules.","NSG changes can take 1-2 minutes to propagate. Do not panic if a new rule does not work instantly.","Outbound rules: Azure allows all outbound by default. If you add a deny rule, make sure you still allow DNS (port 53) or nothing will resolve.","Service Tags (like 'Internet', 'AzureCloud') simplify rules but watch out - 'VirtualNetwork' includes peered VNets too."]
  },
  { cat:"Networking", name:"Load Balancer", tags:["network","balancer","HA","availability"],
    path:"Portal > Load Balancers > + Create",
    short:"Distribute traffic across multiple VMs for high availability.",
    desc:"Azure Load Balancer operates at Layer 4 (TCP/UDP) and distributes incoming traffic across backend VMs. Use it for high availability. Choose between Public (internet-facing) and Internal (private traffic). Standard SKU includes zone redundancy and SLA.",
    tips:["Always use Standard SKU (Basic is being retired and has no SLA).","Configure health probes - the LB only sends traffic to healthy backends.","Use Outbound Rules to control SNAT for backend VMs accessing the internet.","For HTTP/HTTPS workloads, use Application Gateway (Layer 7) instead - it supports path-based routing, SSL termination, and WAF.","Combine with Availability Zones for zone-redundant high availability."],
    bugs:["Backend VMs not receiving traffic? Check health probe. If the probe fails, LB marks the VM as unhealthy and stops sending traffic.","Using Basic SKU? VMs in the backend pool MUST be in the same Availability Set. Standard SKU does not have this limitation.","Floating IP enabled but app not responding? The app must be configured to listen on the load balancer frontend IP, not just its own NIC IP.","SNAT exhaustion: if backend VMs make many outbound connections, you may run out of SNAT ports. Add Outbound Rules with more allocated ports.","Cannot mix Basic and Standard: LB, Public IP, and NSG must all be the same SKU."]
  },
  // ----- Identity -----
  { cat:"Identity & Access", name:"Entra ID (Azure AD)", tags:["identity","AD","users","SSO","MFA"],
    path:"Portal > Microsoft Entra ID",
    short:"Cloud identity service for users, groups, SSO, and MFA.",
    desc:"Microsoft Entra ID (formerly Azure AD) is the identity backbone of Azure and Microsoft 365. It manages users, groups, app registrations, enterprise applications, conditional access, MFA, and SSO. Every Azure subscription is tied to an Entra ID tenant.",
    tips:["Enable MFA for ALL users, especially admins. Use Conditional Access policies instead of per-user MFA.","Limit Global Admin to 2-4 accounts maximum. Use least-privilege roles for daily tasks.","Create break-glass accounts (2 emergency admin accounts with MFA but excluded from Conditional Access).","Use Security Groups for permission management, not individual user assignments.","Review Sign-in Logs and Audit Logs weekly to catch suspicious activity early."],
    bugs:["Deleted user cannot sign in but still shows in some places? It takes up to 30 days for soft-deleted users to be permanently removed.","SSO not working for an app? Check the Enterprise Application > Users and groups. The user must be assigned to the app.","Conditional Access policy not applying? Check the 'What If' tool under CA > What If to simulate.","Guest user cannot access resources? They may need explicit permission in the resource AND a valid license.","MFA registration prompts keep appearing? User may have stale MFA methods. Reset their MFA from the Authentication Methods blade."]
  },
  { cat:"Identity & Access", name:"Conditional Access", tags:["security","MFA","policy","zero-trust"],
    path:"Portal > Entra ID > Protection > Conditional Access",
    short:"Enforce access policies based on conditions like location, device, and risk.",
    desc:"Conditional Access is the Zero Trust policy engine in Entra ID. It evaluates conditions (user, location, device state, risk level) and enforces controls (require MFA, block access, require compliant device). Essential for security.",
    tips:["Start with 3 baseline policies: require MFA for all users, block legacy auth, require compliant devices for sensitive apps.","Always use Report-Only mode first to test a new policy before enforcing it.","Exclude your break-glass accounts from ALL Conditional Access policies.","Use Named Locations to define trusted networks (your office IPs).","Combine with Intune compliance policies: 'require compliant device' means the device must pass Intune checks."],
    bugs:["Policy not applying? Use the 'What If' tool to test. The most common issue is the user or app being excluded.","Legacy authentication (POP3, IMAP, SMTP) bypasses MFA by default. Create a policy to BLOCK legacy auth.","Multiple policies can apply simultaneously. The most restrictive grant control wins (if one says 'block', it blocks).","Service accounts and shared mailboxes need to be excluded or handled separately - they cannot do interactive MFA.","Policy changes can take 5-15 minutes to propagate. Test with a fresh incognito window."]
  },
  // ----- Management -----
  { cat:"Management & Governance", name:"Intune (Endpoint Manager)", tags:["MDM","devices","management","security"],
    path:"Portal > Microsoft Intune > Devices",
    short:"Manage and secure devices (Windows, macOS, iOS, Android) from the cloud.",
    desc:"Microsoft Intune is a cloud-based MDM/MAM service. It manages device enrollment, compliance policies, configuration profiles, app deployment, and security policies. Supports Windows, macOS, iOS, and Android.",
    tips:["Use Autopilot for zero-touch Windows provisioning. Ship laptops directly to users, they enroll on first boot.","Create compliance policies BEFORE conditional access policies. CA can block non-compliant devices.","Use Configuration Profiles to enforce settings (Wi-Fi, VPN, certificates, restrictions).","Set up device categories and dynamic groups to auto-organize devices.","Enable BitLocker/FileVault encryption policies and store recovery keys in Entra ID."],
    bugs:["Device stuck in 'Pending' enrollment? Check that the user has an Intune license and that enrollment restrictions allow their device type.","Compliance policy shows 'Not evaluated'? The device may not have checked in recently. Force a sync from the Intune portal or the Company Portal app.","Autopilot profile not applying? The hardware hash must be imported to Intune BEFORE the device goes through OOBE.","macOS enrollment requires an Apple MDM Push Certificate. If it expires, all macOS devices lose management. Renew it BEFORE expiration.","App deployment failing? Check if the app requires a specific OS version or architecture (x86 vs x64 vs ARM)."]
  },
  { cat:"Management & Governance", name:"Azure Automation", tags:["runbook","automation","powershell","scheduling"],
    path:"Portal > Automation Accounts > + Create",
    short:"Automate tasks with PowerShell/Python runbooks and schedules.",
    desc:"Azure Automation runs PowerShell or Python scripts (Runbooks) on a schedule or triggered by webhooks. Use it for user lifecycle management, resource maintenance, compliance checks, and any repetitive IT task.",
    tips:["Use Managed Identity for authentication instead of storing credentials in the Runbook.","Test runbooks in the Test Pane before publishing.","Use Hybrid Runbook Worker to run scripts against on-premises resources (like Active Directory).","Set up webhook triggers for integration with Zapier, Power Automate, or HR platforms.","Monitor job history and set up alerts for failed jobs."],
    bugs:["Runbook fails with 'module not found'? Import the required PowerShell modules in the Automation Account > Modules.","Webhook stopped working? Webhooks have an expiration date. Create a new one.","Runbook timeout (default 3 hours for cloud, unlimited for Hybrid Worker). For long-running scripts, use Hybrid Worker.","Az module vs AzureRM: AzureRM is deprecated. Make sure your runbooks use the Az module.","Output not visible? Use Write-Output, not Write-Host. Write-Host output is not captured in job logs."]
  },
  { cat:"Management & Governance", name:"Logic Apps", tags:["automation","workflow","integration","no-code"],
    path:"Portal > Logic Apps > + Create",
    short:"Build automated workflows with a visual designer, no code required.",
    desc:"Logic Apps is a cloud-based workflow engine with 400+ connectors (Office 365, Salesforce, SAP, Twitter, etc.). Design workflows visually with triggers (when X happens), conditions, and actions. Great for integrations and business process automation.",
    tips:["Use Consumption plan for infrequent workflows (pay per execution). Use Standard plan for high-volume.","Start simple: trigger on new email > parse data > create item in SharePoint. Then add complexity.","Use Managed Connectors for Microsoft services (they handle auth for you).","Always add error handling (Configure Run After > Has Failed) to catch and notify on failures.","Use Tracked Properties to log important data points for troubleshooting."],
    bugs:["Workflow running slow? Check for sequential actions that could run in parallel. Use Parallel Branches.","Trigger not firing? Some triggers poll on an interval (default 3 min). Check the trigger configuration.","JSON parse action fails? The input schema may not match the actual payload. Use 'Generate from sample' with a real payload.","Hitting connector limits? Each connector has API call limits. Check the limits page and add delays if needed.","Expressions returning null? The most common issue is incorrect path syntax. Use body('actionName')?['property'] with the null-safe operator."]
  },
  // ----- Data -----
  { cat:"Data & Storage", name:"Storage Account", tags:["storage","blob","files","queue","table"],
    path:"Portal > Storage Accounts > + Create",
    short:"Store blobs, files, queues, and tables with high durability.",
    desc:"Azure Storage Account is a unified service for Blob (objects/files), File Shares (SMB), Queue (messages), and Table (NoSQL key-value). Supports different redundancy levels (LRS, ZRS, GRS) and access tiers (Hot, Cool, Archive).",
    tips:["Use lifecycle management rules to automatically move old blobs to Cool/Archive tier and save costs.","Enable soft delete for blobs and containers (7-365 day retention) to protect against accidental deletion.","Use Shared Access Signatures (SAS) with short expiry instead of sharing the full access key.","Set minimum TLS version to 1.2 and disable public blob access unless you specifically need it.","Use AzCopy for large data transfers instead of the portal or Storage Explorer."],
    bugs:["Getting 403 Forbidden? Check: 1) Access key correct, 2) SAS token not expired, 3) Network rules not blocking you, 4) CORS settings for browser access.","Blob not found (404) but it exists? Check the container and blob name - they are case-sensitive.","Cannot delete storage account? There might be resource locks, or it is used as a diagnostic setting target. Check and remove dependencies.","Archive tier blobs: you cannot read them directly. You must rehydrate to Hot/Cool first (takes up to 15 hours).","Performance issues? Standard accounts have IOPS limits. Switch to Premium for high-performance workloads."]
  },
  { cat:"Data & Storage", name:"Azure SQL Database", tags:["database","SQL","relational","PaaS"],
    path:"Portal > SQL Databases > + Create",
    short:"Fully managed relational database with built-in intelligence.",
    desc:"Azure SQL Database is a managed PaaS version of SQL Server. It handles patching, backups, high availability, and scaling. Supports single databases and elastic pools (multiple DBs sharing resources).",
    tips:["Use Elastic Pools when you have multiple databases with unpredictable usage patterns to save costs.","Enable Auditing and Advanced Threat Protection from day one.","Use serverless compute tier for dev/test - it auto-pauses when idle and you pay zero.","Configure geo-replication for disaster recovery of critical databases.","Use Managed Identity for app connections instead of SQL authentication with passwords."],
    bugs:["Cannot connect? Check: 1) Firewall rules allow your IP, 2) Server name is correct (.database.windows.net), 3) Port 1433 is not blocked.","DTU limits exceeded? Your queries are too resource-intensive for the tier. Scale up or optimize queries.","Backup retention: default is 7 days for Basic, 35 days for Standard/Premium. Set long-term retention if you need more.","Elastic Pool running slow? One database may be consuming all the eDTUs. Check resource utilization per database.","Deleted database? It is recoverable within the retention period. Go to the SQL Server > Deleted databases."]
  },
  { cat:"Data & Storage", name:"Key Vault", tags:["security","secrets","certificates","keys"],
    path:"Portal > Key Vaults > + Create",
    short:"Securely store and manage secrets, keys, and certificates.",
    desc:"Azure Key Vault stores secrets (connection strings, API keys), encryption keys, and SSL certificates. Supports RBAC access control, audit logging, and soft delete. Every app should use Key Vault instead of storing secrets in config files.",
    tips:["Enable RBAC authorization (not access policies) for fine-grained control.","Enable soft delete and purge protection on every Key Vault. This prevents accidental permanent deletion.","Use Managed Identity to access Key Vault from apps and VMs - no need to store credentials anywhere.","Set up diagnostic logging to monitor who accessed which secrets and when.","Rotate secrets regularly. Use Key Vault's expiry notifications to remind you."],
    bugs:["403 Forbidden? Check: 1) Your account has the right RBAC role (Key Vault Secrets User/Officer), 2) Network rules allow your IP/VNet, 3) Firewall is not blocking you.","Cannot delete Key Vault? It is soft-deleted. Check Manage Deleted Vaults in the portal. Purge it or wait for retention to expire.","Key Vault name is globally unique and reserved even after deletion. If creation fails with 'name taken', check deleted vaults.","Certificate renewal not working? Auto-renewal only works with integrated CAs (DigiCert, GlobalSign). For others, use alerts and manual renewal.","Secret references in App Service not resolving? The syntax must be exactly: @Microsoft.KeyVault(SecretUri=https://...) with the right permissions."]
  },
  // ----- Monitoring -----
  { cat:"Monitoring & DevOps", name:"Azure Monitor", tags:["monitoring","alerts","logs","metrics"],
    path:"Portal > Monitor",
    short:"Full-stack monitoring with metrics, logs, alerts, and dashboards.",
    desc:"Azure Monitor collects metrics and logs from all Azure resources. It includes Log Analytics (KQL queries), Metric Explorer (charts), Alerts, Dashboards, and Workbooks. The central hub for observability in Azure.",
    tips:["Enable diagnostic settings on EVERY resource to send logs to Log Analytics.","Learn basic KQL (Kusto Query Language) - it is essential for querying logs.","Use Action Groups to define WHO gets notified and HOW (email, SMS, webhook).","Create Azure Dashboards for at-a-glance views of your environment.","Use Workbooks for interactive, shareable reports with parameters."],
    bugs:["Alert not firing? Check: 1) Action group is configured, 2) Alert condition threshold is correct, 3) The resource is actually sending metrics.","Log Analytics query returns no results? Check the time range and that diagnostic settings are actually enabled on the resource.","Metrics have 1-3 minute delay. Do not expect real-time data.","Alert storms (too many alerts)? Configure alert processing rules to suppress or aggregate during maintenance windows.","Costs can spike if you log too much data. Use Log Analytics daily cap and data collection rules to control ingestion."]
  },
  { cat:"Monitoring & DevOps", name:"Azure DevOps", tags:["CI/CD","pipelines","repos","boards"],
    path:"dev.azure.com > + New Project",
    short:"Complete DevOps platform with repos, pipelines, boards, and artifacts.",
    desc:"Azure DevOps includes Azure Repos (Git), Pipelines (CI/CD), Boards (work tracking), Test Plans, and Artifacts (package management). It is a full ALM (Application Lifecycle Management) platform.",
    tips:["Use YAML pipelines (not classic editor) for version-controlled CI/CD definitions.","Set up branch policies: require PR reviews, build validation, and linked work items.","Use Service Connections for Azure authentication in pipelines instead of storing credentials.","Use Variable Groups and Key Vault integration for secrets in pipelines.","Implement environments with approval gates for production deployments."],
    bugs:["Pipeline fails with permission errors? Check the Service Connection permissions and the Project Settings > Pipelines > Service Connections.","Self-hosted agent offline? Check that the agent service is running on the VM.","YAML pipeline syntax error? Use the YAML editor in DevOps with the 'Validate' button before committing.","Build takes too long? Use pipeline caching for dependencies (npm, pip, NuGet).","Cannot see repos/boards? Check project visibility (Public vs Private) and user permissions in Project Settings."]
  }
];

function renderAzureList(filter) {
  var list = document.getElementById('az-list');
  var detail = document.getElementById('az-detail');
  list.style.display = '';
  detail.style.display = 'none';

  var cats = {};
  AZURE_SERVICES.forEach(function(s) {
    if (filter) {
      var q = filter.toLowerCase();
      var match = s.name.toLowerCase().indexOf(q) !== -1 ||
        s.short.toLowerCase().indexOf(q) !== -1 ||
        s.cat.toLowerCase().indexOf(q) !== -1 ||
        s.tags.some(function(t) { return t.toLowerCase().indexOf(q) !== -1; });
      if (!match) return;
    }
    if (!cats[s.cat]) cats[s.cat] = [];
    cats[s.cat].push(s);
  });

  var html = '';
  var catOrder = ["Compute","Networking","Identity & Access","Management & Governance","Data & Storage","Monitoring & DevOps"];
  catOrder.forEach(function(cat) {
    if (!cats[cat]) return;
    html += '<div class="az-cat-title">' + cat + '</div>';
    html += '<div class="az-grid">';
    cats[cat].forEach(function(s, idx) {
      html += '<div class="az-card" onclick="showAzureDetail(\'' + s.name.replace(/'/g,"\\'") + '\')">';
      html += '<div class="az-card-name">' + s.name + '</div>';
      html += '<div class="az-card-short">' + s.short + '</div>';
      html += '<div class="az-card-tags">';
      s.tags.forEach(function(t) { html += '<span class="tag tag-blue">' + t + '</span>'; });
      html += '</div></div>';
    });
    html += '</div>';
  });

  if (!html) html = '<div style="color:var(--text3);padding:2rem;text-align:center">No services match your search.</div>';
  list.innerHTML = html;
}

function showAzureDetail(name) {
  var s = AZURE_SERVICES.find(function(svc) { return svc.name === name; });
  if (!s) return;

  document.getElementById('az-list').style.display = 'none';
  var detail = document.getElementById('az-detail');
  detail.style.display = '';

  var html = '<div class="az-detail">';
  html += '<div class="az-detail-header"><div><div class="az-detail-name">' + s.name + '</div>';
  html += '<div style="margin-top:0.3rem">';
  s.tags.forEach(function(t) { html += '<span class="tag tag-blue">' + t + '</span>'; });
  html += '</div></div>';
  html += '<button class="az-detail-back" onclick="renderAzureList(document.getElementById(\'az-search\').value)">Back to list</button>';
  html += '</div>';

  html += '<div class="az-path">' + s.path + '</div>';
  html += '<div class="az-detail-desc">' + s.desc + '</div>';

  html += '<h4>Best Practices & Tips</h4>';
  s.tips.forEach(function(tip) {
    html += '<div class="az-tip">' + tip + '</div>';
  });

  html += '<h4>Common Issues & Gotchas</h4>';
  s.bugs.forEach(function(bug) {
    html += '<div class="az-bug">' + bug + '</div>';
  });

  html += '</div>';
  detail.innerHTML = html;
}

function filterAzure() {
  renderAzureList(document.getElementById('az-search').value);
}

renderAzureList();