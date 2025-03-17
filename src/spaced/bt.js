// -----
// To add a prompt:
//  
// https://www.braintrust.dev/app/casado/p/spaces/prompts
// https://www.braintrust.dev/app/casado/p/pentacity/prompts
//
// To pull prompts from Braintrust:
// on the CLI:
// export BRAINTRUST_API_KEY="..."
// npx braintrust pull --project-name "pentacity"
//
// -----


import { initLogger } from "braintrust";
import { BraintrustStream } from "braintrust";


// Use this to get around a node.js dependency in BT
import { Buffer } from "buffer";
// @ts-ignore
window.Buffer = Buffer;

let BRAINTRUST_API_KEY = import.meta.env.VITE_BRAINTRUST_API_KEY;
const url = 'https://api.braintrust.dev/function/invoke';

// assumed deployed in which case read BT key directly
if(!BRAINTRUST_API_KEY){ 
    // BRAINTRUST_API_KEY = process.env.BRAINTRUST_API_KEY;
}

let projectname = null;
let logdata = null;

export async function initBT(project){
    if(logdata){
        console.log("logdata already initialized");
        return;
    }
    projectname = project;
    const logger = initLogger({
    projectName: projectname,
    apiKey: BRAINTRUST_API_KEY 
    });
    logdata = await logger.export();

//    console.log("Initializing BT: "+BRAINTRUST_API_KEY);
}

export function bt(slugin, input, callme) {
    const data = {
    input: input,
    parent: logdata, 
    stream: false,
    project_name: projectname,
    slug: slugin 
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer `+BRAINTRUST_API_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        console.log('Status:', response.status);
        console.log('StatusText:', response.statusText);
        return response.text();  // Get the raw text instead of parsing JSON
    })
    .then(text => {
        // console.log('Response:', text);
        // Try to parse as JSON if possible
        try {
            const data = JSON.parse(text);
            //console.log('Parsed data:', data);
            callme(data);
        } catch (e) {
            console.log(e);
            console.log('Could not parse response as JSON');
        }
    })
    .catch(error => console.error('Error:', error));
}

export async function asyncbt(slugin, msgin, visits) {
    const data = {
    input: {
        visits: visits,
        msg: msgin,
    },
    parent: logdata, 
    stream: false,
    project_name: projectname,
    slug: slugin 
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer  `+BRAINTRUST_API_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    console.log('Status:', response.status);
    console.log('StatusText:', response.statusText);
    const text = await response.text();  // Get the raw text instead of parsing JSON
    console.log('Response:', text);
    try {
        const data = JSON.parse(text);
        console.log('Parsed data:', data);
        return data;
    } catch (e) {
        console.log('Could not parse response as JSON');
    }
}

export async function asyncbtStream(slugin, systeminput) {
    const data = {
    input: {
        ...systeminput,
    },
    parent: logdata, 
    stream: true,
    project_name: projectname,
    slug: slugin 
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer `+BRAINTRUST_API_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    console.log('Status:', response.status);
    console.log('StatusText:', response.statusText);
    return new BraintrustStream(response.body)
}