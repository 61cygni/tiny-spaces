// -----
// To add a prompt:
//  
// https://www.braintrust.dev/app/casado/p/spaces/prompts
//  
// -----


import { initLogger } from "braintrust";
import { BraintrustStream } from "braintrust";


// Use this to get around a node.js dependency in BT
import { Buffer } from "buffer";
// @ts-ignore
window.Buffer = Buffer;

const BRAINTRUST_API_KEY = import.meta.env.VITE_BRAINTRUST_API_KEY;
const url = 'https://api.braintrust.dev/function/invoke';

const logger = initLogger({
  projectName: "spaces",
  apiKey: BRAINTRUST_API_KEY 
});
let logdata = await logger.export();

export function bt(slugin, msgin, visits, callme) {
    const data = {
    input: {
        visits: visits,
        msg: msgin,
    },
    parent: logdata, 
    stream: false,
    project_name: "spaces",
    slug: slugin 
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer sk-HCWgy4xVdaaxAw0a9LAX0Ji0cxORkIpvfbCN35VsuyGvALF0`,
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
        console.log('Response:', text);
        // Try to parse as JSON if possible
        try {
            const data = JSON.parse(text);
            console.log('Parsed data:', data);
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
    project_name: "spaces",
    slug: slugin 
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer sk-HCWgy4xVdaaxAw0a9LAX0Ji0cxORkIpvfbCN35VsuyGvALF0`,
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
    project_name: "spaces",
    slug: slugin 
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer sk-HCWgy4xVdaaxAw0a9LAX0Ji0cxORkIpvfbCN35VsuyGvALF0`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    console.log('Status:', response.status);
    console.log('StatusText:', response.statusText);
    return new BraintrustStream(response.body)
}