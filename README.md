# IT Admin Toolkit

A browser-based toolkit with 18 tools built for IT Admins, Cloud Engineers, and DevOps professionals. Runs entirely in the browser with zero dependencies and no backend required.

**Live Demo:** [https://carosrrr.github.io/it-admin-toolkit](https://carosrrr.github.io/it-admin-toolkit)

## Tools

### Network
- **Subnet Calculator** - Enter CIDR notation, get network/broadcast address, usable range, mask in decimal and binary
- **IP Converter** - Convert IPs between decimal, binary, hex. Shows class, private/public type, and integer value
- **Port Lookup** - Search 40+ common ports by number or service name
- **DNS Reference** - All DNS record types (A, AAAA, CNAME, MX, TXT, NS, SOA, SRV, PTR, CAA) with real-world examples
- **HTTP Status Codes** - Searchable reference for all HTTP status codes grouped by category with descriptions

### Utilities
- **Password Generator** - Cryptographically secure passwords with configurable length, complexity, entropy calculation, and strength meter
- **Base64 Encode/Decode** - Convert text to and from Base64 with one-click copy
- **JSON Formatter** - Paste messy JSON, format with 2 or 4 spaces, or minify. Shows key count and size
- **Regex Tester** - Live match highlighting, capture group display, configurable flags
- **Byte Converter** - Convert between B/KB/MB/GB/TB/PB with transfer time calculator for any bandwidth speed
- **CRON Builder** - Visual CRON expression builder with presets, human-readable descriptions, and usage examples for Azure Functions, GitHub Actions, and Linux crontab

### Reference
- **CLI Cheatsheet** - 60+ commands for Azure CLI, PowerShell Graph API, Az Module, Terraform, and Docker. Searchable with click-to-copy
- **Script Snippets Library** - 15+ ready-to-use scripts for user management, device management, networking, Azure, and Docker. Click to copy
- **Remote Machine Info** - Commands to gather system info, disk space, network config, processes, and event logs from remote machines. Auto-replaces hostname
- **SLA Calculator** - Add Azure services to a dependency chain, calculate composite SLA, monthly/yearly downtime, with reference table
- **Uptime Calculator** - Convert between SLA percentage and actual downtime per day/week/month/year with common SLA tier reference
- **Text Diff** - Line-by-line comparison of two texts with added/removed/unchanged highlighting

### Azure
- **Azure Services Guide** - Interactive reference for 14 Azure services across 6 categories. Each service includes portal navigation path, description, 5 best practices, and 5 common issues with solutions. Searchable by name, tag, or keyword

## Project Structure

```
it-admin-toolkit/
|-- index.html          # Main HTML structure
|-- css/
|   +-- style.css       # All styles (dark theme, layout, components)
|-- js/
|   +-- app.js          # All tool logic, data, and interactions
|-- docs/
|   +-- adding-tools.md # Guide for adding new tools
|-- .gitignore
|-- LICENSE
+-- README.md
```

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties (variables), Grid, Flexbox, transitions
- **Vanilla JavaScript** - No frameworks, no dependencies, no build step
- **Google Fonts** - IBM Plex Mono + Outfit
- **Web Crypto API** - For cryptographically secure password generation

## Design

- Dark theme optimized for long screen sessions
- Sidebar navigation with category grouping
- Responsive layout (sidebar collapses on mobile)
- Monospace font for technical data, sans-serif for UI
- Consistent color system using CSS variables

## Run Locally

No build step needed. Just open the file:

```bash
# Clone
git clone https://github.com/carosrrr/it-admin-toolkit.git
cd it-admin-toolkit

# Open in browser
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

Or serve it locally:
```bash
python3 -m http.server 8080
# Visit http://localhost:8080
```

## Adding New Tools

See [docs/adding-tools.md](docs/adding-tools.md) for a step-by-step guide on how to add new tools to the toolkit.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

**Caio Santana** - IT Infrastructure & Cloud Engineer
- [LinkedIn](https://www.linkedin.com/in/caiosantana/)
- [GitHub](https://github.com/carosrrr)
- [Portfolio](https://carosrrr.github.io)
