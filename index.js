const axios = require('axios');

// Define API endpoint and token
const ORIGIN_URL = "https://<tenant_name>.console.ves.volterra.io/api"
const API_TOKEN = "REPLACE WITH TOKEN" // https://docs.cloud.f5.com/docs/how-to/volterra-automation-tools/apis

// Configuration flags
const PURGE_ORPHANS = false
const SHOW_ALL_NAMESPACE = true

// Create an Axios instance for HTTP requests with headers
const axiosInstance = axios.create({
    headers: {
        'Authorization': 'APIToken ' + API_TOKEN,
        'Content-Type': 'application/json'
    }
});

function getCurrentTimes() {
    // Get the current date and time
    let currentDate = new Date();

    // Convert current date to ISO 8601 format with static milliseconds
    let currentIsoDate = currentDate.toISOString();
    let formattedCurrentDate = currentIsoDate.substring(0, currentIsoDate.indexOf('.')) + '.000Z';

    // Subtract one hour
    currentDate.setHours(currentDate.getHours() - 1);

    // Convert date minus one hour to ISO 8601 format with static milliseconds
    let minusOneHourIsoDate = currentDate.toISOString();
    let formattedMinusOneHourDate = minusOneHourIsoDate.substring(0, minusOneHourIsoDate.indexOf('.')) + '.000Z';

    return {
        currentTime: formattedCurrentDate,
        oneHourAgo: formattedMinusOneHourDate
    };
}

// Function to fetch namespaces
const fetchNamespaces = async () => {
    try {
        const response = await axiosInstance.get(ORIGIN_URL + '/web/namespaces');
        const data = response.data;
        // Extract the namespace names from the items array
        return data.items.map(item => item.name);
    } catch (error) {
        console.error(`Error fetching namespaces: ${error.message}`);
        throw error;
    }
};

const fetchLoadBalancers = async (namespace) => {
    try {
        const response = await axiosInstance.get(ORIGIN_URL + `/config/namespaces/${namespace}/http_loadbalancers`);
        return response.data.items.map(item => item.name);
    } catch (error) {
        console.error(`Error fetching load balancers for namespace ${namespace}: ${error.message}`);
        throw error;
    }
};

const fetchLoadBalancerDetails = async (namespace, loadBalancerName) => {
    try {
        const response = await axiosInstance.get(ORIGIN_URL + `/config/namespaces/${namespace}/http_loadbalancers/${loadBalancerName}`);
        const loadBalancerDetails = response.data;

        let routeCount = 0;
        let name = '';

        // Accessing the 'name' attribute
        if (loadBalancerDetails.object && loadBalancerDetails.object.metadata) {
            name = loadBalancerDetails.object.metadata.name;
        }

        // Accessing the 'routes' array at the top level spec
        if (loadBalancerDetails.spec && Array.isArray(loadBalancerDetails.spec.routes)) {
            routeCount = loadBalancerDetails.spec.routes.length;
        }

        return {
            ...loadBalancerDetails,
            name, // Including the name in the details
            routeCount // Adding routeCount to the details
        };
    } catch (error) {
        console.error(`Error fetching details for load balancer ${loadBalancerName} in namespace ${namespace}: ${error.message}`);
        throw error;
    }
};


const fetchAppSettings = async (namespace) => {
    try {
        const response = await axiosInstance.get(ORIGIN_URL + `/config/namespaces/${namespace}/app_settings`);
        const appSettings = response.data.items;

        // Filter out policies where namespace is 'shared'
        // and exclude policies where owner_view.kind is 'forward_proxy_policy' or 'http_loadbalancer'
        const filteredAppSettings = appSettings.filter(appSetting =>
            appSetting.namespace === namespace &&
            appSetting.namespace !== "shared" &&
            (!appSetting.owner_view || (appSetting.owner_view.kind !== 'forward_proxy_policy' && appSetting.owner_view.kind !== 'http_loadbalancer' && appSetting.owner_view.kind !== 'rate_limiter_policy'))
        );

        return filteredAppSettings.map(appSetting => appSetting.name);
    } catch (error) {
        console.error(`Error fetching service policies for namespace ${namespace}: ${error.message}`);
        throw error;
    }
};

const fetchAppSettingDetails = async (namespace, appSettingName) => {
    try {
        const response = await axiosInstance.get(ORIGIN_URL + `/config/namespaces/${namespace}/app_settings/${appSettingName}?response_format=5`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching details for app type ${appSettingName} in namespace ${namespace}: ${error.message}`);
        throw error;
    }
};

const fetchServicePolicies = async (namespace) => {
    try {
        const response = await axiosInstance.get(ORIGIN_URL + `/config/namespaces/${namespace}/service_policys`);
        const policies = response.data.items;

        // Filter out policies where namespace is 'shared'
        // and exclude policies where owner_view.kind is 'forward_proxy_policy' or 'http_loadbalancer'
        const filteredPolicy = policies.filter(policy =>
            policy.namespace === namespace &&
            policy.namespace !== "shared" &&
            (!policy.owner_view || (policy.owner_view.kind !== 'forward_proxy_policy' && policy.owner_view.kind !== 'http_loadbalancer' && policy.owner_view.kind !== 'rate_limiter_policy'))
        );

        return filteredPolicy.map(policy => policy.name);
    } catch (error) {
        console.error(`Error fetching service policies for namespace ${namespace}: ${error.message}`);
        throw error;
    }
};

const fetchServicePolicyDetails = async (namespace, policyName) => {
    try {
        const response = await axiosInstance.get(ORIGIN_URL + `/config/namespaces/${namespace}/service_policys/${policyName}?response_format=5`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching details for service policy ${policyName} in namespace ${namespace}: ${error.message}`);
        throw error;
    }
};

const fetchAppFirewalls = async (namespace) => {
    try {
        const response = await axiosInstance.get(ORIGIN_URL + `/config/namespaces/${namespace}/app_firewalls`);
        const Waaps = response.data.items;

        // Filter out pools where namespace is 'shared'
        const filteredWaaps = Waaps.filter(firewall => firewall.namespace !== 'shared');

        return filteredWaaps.map(firewall => firewall.name);
    } catch (error) {
        console.error(`Error fetching app firewalls for namespace ${namespace}: ${error.message}`);
        throw error;
    }
};

const fetchAppFirewallDetails = async (namespace, firewallName) => {
    try {
        const response = await axiosInstance.get(ORIGIN_URL + `/config/namespaces/${namespace}/app_firewalls/${firewallName}?response_format=5`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching details for app firewall ${firewallName} in namespace ${namespace}: ${error.message}`);
        throw error;
    }
};

const fetchOriginPools = async (namespace) => {
    try {
        const response = await axiosInstance.get(ORIGIN_URL + `/config/namespaces/${namespace}/origin_pools`);
        return response.data.items.map(item => item.name);
    } catch (error) {
        console.error(`Error fetching origin pools for namespace ${namespace}: ${error.message}`);
        throw error;
    }
};

const fetchOriginPoolDetails = async (namespace, poolName) => {
    try {
        const response = await axiosInstance.get(ORIGIN_URL + `/config/namespaces/${namespace}/origin_pools/${poolName}?response_format=5`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching details for origin pool ${poolName} in namespace ${namespace}: ${error.message}`);
        throw error;
    }
};

const deleteOrphanedOrigin = async (namespace, poolName) => {
    try {
        const response = await axiosInstance.delete(ORIGIN_URL + `/config/namespaces/${namespace}/origin_pools/${poolName}`, {
            data: { fail_if_referred: true, name: poolName, namespace: namespace }
        });

        console.log(`Deleted origin pool ${poolName} in namespace ${namespace}:`, response.data);
        return response.data;
    }
    catch (error) {
        console.error(`Error deleting origin pool ${poolName} in namespace ${namespace}: ${error.message}`);
        throw error;
    }
};

const deleteOrphanedFirewall = async (namespace, firewallName) => {
    try {
        const response = await axiosInstance.delete(ORIGIN_URL + `/config/namespaces/${namespace}/app_firewalls/${firewallName}`, {
            data: { fail_if_referred: true, name: firewallName, namespace: namespace }
        });

        console.log(`Deleted app_firewall ${firewallName} in namespace ${namespace}:`, response.data);
        return response.data;
    }
    catch (error) {
        console.error(`Error deleting app_firewall ${firewallName} in namespace ${namespace}: ${error.message}`);
        throw error;
    }
};

const deleteOrphanedPolicy = async (namespace, policyName) => {
    try {
        const response = await axiosInstance.delete(ORIGIN_URL + `/config/namespaces/${namespace}/service_policys/${policyName}`, {
            data: { fail_if_referred: true, name: policyName, namespace: namespace }
        });

        console.log(`Deleted service_policy ${policyName} in namespace ${namespace}:`, response.data);
        return response.data;
    }
    catch (error) {
        console.error(`Error deleting service_policy ${policyName} in namespace ${namespace}: ${error.message}`);
        throw error;
    }
};

const deleteOrphanedAppSetting = async (namespace, appSettingName) => {
    try {
        const response = await axiosInstance.delete(ORIGIN_URL + `/config/namespaces/${namespace}/app_settings/${appSettingName}`, {
            data: { fail_if_referred: true, name: appSettingName, namespace: namespace }
        });

        console.log(`Deleted app_setting ${appSettingName} in namespace ${namespace}:`, response.data);
        return response.data;
    }
    catch (error) {
        console.error(`Error deleting app_setting ${policyName} in namespace ${namespace}: ${error.message}`);
        throw error;
    }
};

// Add in Health Checks maybe?

// Function to process command line arguments
async function processArguments() {
    const args = process.argv.slice(2);
    let req_id = null;
    let req_id_provided = false;
    let audit_orphans = false;

    // Check if specific arguments are provided and extract values
    args.forEach(arg => {
        if (arg.startsWith('--query-req-id=')) {
            const splitArg = arg.split('=');
            if (splitArg.length === 2 && splitArg[1]) {
                req_id = splitArg[1];
                req_id_provided = true;
            }
        } else if (arg === '--audit-orphans') {
            audit_orphans = true;
        }
    });

    // Run main audit application logic if --audit-orphans is provided
    if (audit_orphans) {
        try {
            await main();
        } catch (error) {
            console.error("Error in main function:", error);
        }
    }

    // Additional logic for req_id, if provided and valid
    if (req_id_provided && req_id) {
        try {
            const data = await queryReqId(req_id);
            console.log(data);
        } catch (error) {
            console.error('Error querying req_id:', req_id, error);
        }
    } else if (req_id_provided && !req_id) {
        console.error("No value provided for --query-req-id. Please specify a req_id.");
    }

    if (!audit_orphans && !req_id_provided) {
        console.log("No valid arguments provided. Use --audit-orphans or --query-req-id=<req_id>.");
    }
}


// Function to query specific req_id across all namespaces
async function queryReqId(req_id) {
    try {
        const namespaces = await fetchNamespaces();
        let results = [];

        const times = getCurrentTimes();

        for (let namespace of namespaces) {
            if (namespace != 'system') {

                const loadBalancerNames = await fetchLoadBalancers(namespace); // Fetch load balancer names for the namespace

                for (let loadBalancerName of loadBalancerNames) {

                    // Build the query including the load balancer name
                    //let query = `'{vh_name=\\"${loadBalancerName}\\",req_id=\\"${req_id}\\",sec_event_type=~\\"waf_sec_event|bot_defense_sec_event|api_sec_event|svc_policy_sec_event\\"}'`;


                    // Construct data object
                    let data = {
                        ags: {},
                        namespace: namespace,
                        query: '{ req_id=\"' + req_id + '\" }',
                        start_time: times.oneHourAgo,
                        end_time: times.currentTime
                    };

                    // Manually serialize object to JSON
                    let jsonData = JSON.stringify(data);
                    //console.log(jsonData);

                    const response = await axiosInstance.post(ORIGIN_URL + `/data/namespaces/${namespace}/app_security/events`, jsonData, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    // const response = await fetch(ORIGIN_URL + `/data/namespaces/${namespace}/app_security/events`, {
                    //     method: "POST",
                    //     body: jsonData
                    // })

                    //console.log({ namespace: namespace, data: response.data });

                    if (response.data.total_hits != '0') {
                        results.push({ namespace: namespace, loadBalancer: loadBalancerName, data: response.data });
                    }

                }

            }
        }
        //console.log(times.oneHourAgo);
        //console.log(times.currentTime);
        return results;

    } catch (error) {
        console.error('Error querying req_id:', req_id, 'error:', error);
        throw error;
    }
}

async function main() {
    try {
        const namespaces = await fetchNamespaces();

        for (let namespace of namespaces) {
            const originPoolNames = await fetchOriginPools(namespace);
            const firewallNames = await fetchAppFirewalls(namespace);
            const policyNames = await fetchServicePolicies(namespace);
            const appSettingNames = await fetchAppSettings(namespace);
            const loadBalancerNames = await fetchLoadBalancers(namespace);

            const poolsWithNoReferringObjects = [];
            const firewallsWithNoReferringObjects = [];
            const policiesWithNoReferringObjects = [];
            const appSettingsWithNoReferringObjects = [];
            const loadBalancersWithNoReferringObjects = []; // just sticking with naming convention...

            for (let loadBalancerName of loadBalancerNames) {
                const loadBalancerDetails = await fetchLoadBalancerDetails(namespace, loadBalancerName);
                if (loadBalancerDetails.referring_objects && loadBalancerDetails.referring_objects.length === 0) {
                    loadBalancersWithNoReferringObjects.push({ name: loadBalancerName, routeCount: loadBalancerDetails.routeCount });
                }
            }

            for (let poolName of originPoolNames) {
                const poolDetails = await fetchOriginPoolDetails(namespace, poolName);
                if (poolDetails.referring_objects && poolDetails.referring_objects.length === 0) {
                    poolsWithNoReferringObjects.push(poolName);
                }
            }

            for (let firewallName of firewallNames) {
                const firewallDetails = await fetchAppFirewallDetails(namespace, firewallName);
                if (firewallDetails.referring_objects && firewallDetails.referring_objects.length === 0) {
                    firewallsWithNoReferringObjects.push(firewallName);
                }
            }

            for (let policyName of policyNames) {
                const policyDetails = await fetchServicePolicyDetails(namespace, policyName);
                if (policyDetails.referring_objects && policyDetails.referring_objects.length === 0) {
                    policiesWithNoReferringObjects.push(policyName);
                }
            }

            for (let appSettingName of appSettingNames) {
                const appSettingDetails = await fetchAppSettingDetails(namespace, appSettingName);
                if (appSettingDetails.referring_objects && appSettingDetails.referring_objects.length === 0) {
                    appSettingsWithNoReferringObjects.push(appSettingName);
                }
            }
            if (
                SHOW_ALL_NAMESPACE ||
                poolsWithNoReferringObjects.length > 0 ||
                firewallsWithNoReferringObjects.length > 0 ||
                policiesWithNoReferringObjects.length > 0 ||
                appSettingsWithNoReferringObjects.length > 0 ||
                loadBalancersWithNoReferringObjects.length > 0
            ) {
                console.log(`Namespace: ${namespace}, \n Origin Pools with no referring objects:`,
                    poolsWithNoReferringObjects, `\n Firewalls with no referring objects:`,
                    firewallsWithNoReferringObjects, `\n Service Policies with no referring objects:`,
                    policiesWithNoReferringObjects, `\n App Settings with no referring objects:`,
                    appSettingsWithNoReferringObjects, `\n Load Balancers Report:`,
                    loadBalancersWithNoReferringObjects.map(lb => ({ name: lb.name, routeCount: lb.routeCount }))
                );
            }

            // If PURGE_ORPHANS = false, just report on objects
            if (PURGE_ORPHANS == true) {
                // Delete orphaned origin pools
                for (let poolName of poolsWithNoReferringObjects) {
                    await deleteOrphanedOrigin(namespace, poolName);
                }

                // Delete orphaned App Firewalls
                for (let firewallName of firewallsWithNoReferringObjects) {
                    await deleteOrphanedFirewall(namespace, firewallName);
                }
                // Delete orphaned Service Policies
                for (let policyName of policiesWithNoReferringObjects) {
                    await deleteOrphanedPolicy(namespace, policyName);
                }
                // Delete orphaned App Settings
                for (let appSettingName of appSettingsWithNoReferringObjects) {
                    await deleteOrphanedAppSetting(namespace, appSettingName);
                }
            }

        }
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
    }
};

// Run the script based on the command line arguments
processArguments();
