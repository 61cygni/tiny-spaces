// --
// penta_stream.js
// 
// Handled stream responses from Braintrust for Penta including all object and action parsing
// 
// --

import * as BT  from '@spaced/bt.js';


export async function invoke_prompt_input_stream(impl, slug, sysinput){

    // const sysinput = {
    //     history: this.history,
    //     visits: this.visits,
    //     msg: val,
    // };

    // let usrinput = this.user_input();
    let usrinput = {};
    let promptinput = {...sysinput, ...usrinput};

    console.log("Prompt: "+promptinput);

    let result = await BT.asyncbtStream(slug, promptinput);
    let preamble = "";
    let session = "";

    let afterstopword = false;
    if (impl.is_chatting) {
        impl.gameevents.dialog_stream(preamble, 'character', {character: impl.chatting_with_villager});
        for await (const chunk of result) {
            if (!impl.is_chatting){
                break;
            }

            if(chunk.data.includes("###")){
                impl.gameevents.dialog_stream(chunk.data.split("###")[0], 'character', {character: impl.chatting_with_villager});
                afterstopword = true;
            }
            if(!afterstopword){
                impl.gameevents.dialog_stream(chunk.data, 'character', {character: impl.chatting_with_villager});
            }
            session = session + chunk.data;
        }
    }

    // detect any actions. They should be the end of the message, delimintated by '###'
    // and written in JSON
    console.log("Session: "+session);
    let actions = session.split("###");

    impl.gameevents.mainchar.conversationCanvas.addDialog(impl.chatting_with_villager.name, actions[0]);

    if(actions.length > 1){
        // TODO! Try / catch block here
        let act = JSON.parse(actions[actions.length - 1]);
        console.log("Action: ");
        console.log(act);
        if(Object.prototype.hasOwnProperty.call(act, 'action')){
            console.log("Dispatching action: "+act.action);
            this.dispatch_action(act);
        }else{
            console.log("No action found in JSON object");
        }
    }

    // TODO add to history
    // this.history = this.history + "\n" + preamble + this.session;

    if (!impl.is_chatting){
      impl.gameevents.dialog_stream_done();
    }
}