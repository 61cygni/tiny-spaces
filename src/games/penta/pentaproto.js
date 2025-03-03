// Protocol for AI NPCs 

// take a message recieved from an NPC and return a JSON object with the following fields:
// - msg: the response  
// - action: the action to perform
// - <action fields>: action specific fields 


export function parse_response(response) {

    let actions = response.split("###");


    let act = {};
    if(actions.length > 1){
        // TODO! Try / catch block here
        act = JSON.parse(actions[actions.length - 1]);
        console.log(act);
    }

    let result = {
        msg: actions[0].trim(),
        ...act,
    };

    return result;
}


