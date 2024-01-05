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

### Audit / Purge Orphaned Objects

There are now a few arguments that can be passed to the command.

To get a report of existing orphaned objects use the following:

```bash
node.js index.js --audit-orphans
```

* --audit-orphans is required to audit / purge objects that are not currently referenced by any other objects.

Objects will not purge unless the value has been changed in the script variables.

* PURGE_ORPHANS allows you to report on objects or remove them.  If you just want to report on objects ensure the value is false.  If you want to remove objects, set to true.

* SHOW_ALL_NAMESPACE allows you to report results even when there are no orphaned objects, useful to report on Load Balancers and Routes.  If you are not interested in Load Balancer and Route Count, then set to false to only show orphaned objects.

### Cleans up

* App Firewalls
* Service Policies
* App Settings
* Origin Pools

### Reports

* Load Balancers
  * Route Count

### Search for Request ID

To query all namespaces and load balancers for a Request ID use the following:

```bash
node.js index.js --query-req-id=<request ID> (OPTIONAL) --time=xxh/xxd
```

* --query-req-id is required, specify the request id.
* --time allows you to specify a time frame in hours or days in xxh or xxd format.  You can specify up to 24h or 30d. if no time is specified the script will default to the past 1 hour.

## To Do

* add option to show events for --query-req-id
* add argument to set purge value
* clean up code and outputs
