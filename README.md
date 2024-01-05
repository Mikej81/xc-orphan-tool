# F5 Orphaned Object Cleaner

Delete all orphaned objects across all Application Namespaces.  To use, install, configure API URL, populate token, run code.

Getting set up to use F5 Distributed Cloud APIs:  <https://docs.cloud.f5.com/docs/how-to/volterra-automation-tools/apis>

## Install

```bash
npm install
node index.js
```

## Configure

```node
const ORIGIN_URL = "https://<tenant_name>.console.ves.volterra.io/api"
const API_TOKEN = "REPLACE WITH TOKEN"

// Configuration flags
const PURGE_ORPHANS = false
const SHOW_ALL_NAMESPACE = true
```

## Usage

There are now a few arguments that can be passed to the command.

To get a report of existing orphaned objects use the following:

```
node.js index.js --audit-orphans
```

Objects will not purge unless the value has been changed in the script.

To query all namespaces and load balancers for a Request ID use the following:

```
node.js index.js --query-req-id=<request ID>
```

* PURGE_ORPHANS allows you to report on objects or remove them.  If you just want to report on objects ensure the value is false.  If you want to remove objects, set to true.

* SHOW_ALL_NAMESPACE allows you to report results even when there are no orphaned objects, useful to report on Load Balancers and Routes.  If you are not interested in Load Balancer and Route Count, then set to false to only show orphaned objects.

Cleans up:

* App Firewalls
* Service Policies
* App Settings
* Origin Pools

Reports:

* Load Balancers
  * Route Count

### To Do

* add option to show events for --query-req-id
* add argument to set purge value
* clean up code and outputs
