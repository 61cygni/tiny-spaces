// --
// penta_stream.js
// 
// Handled stream responses from Braintrust for Penta including all object and action parsing
// 
// --

import * as BT  from '@spaced/bt.js';


export async function invoke_prompt_input_stream(impl, slug, sysinput, append_callback, send_to_dialog){

    // const sysinput = {
    //     history: this.history,
    //     visits: this.visits,
    //     msg: val,
    // };

    // let usrinput = this.user_input();
    let usrinput = {};
    let promptinput = {...sysinput, ...usrinput};

    // console.log("Prompt: "+promptinput);

    let result = await BT.asyncbtStream(slug, promptinput);
    let preamble = "";
    let session = "";

    let afterstopword = false;
    if (impl.is_chatting) {
        send_to_dialog(preamble);
        for await (const chunk of result) {
            if (!impl.is_chatting){
                break;
            }

            if(chunk.data.includes("###")){
                let msg = chunk.data.split("###")[0].trim();
                if(msg.length > 0){
                    console.log("Msg: \'"+msg+"\'");
                    send_to_dialog(msg);
                }
                afterstopword = true;
            }
            if(!afterstopword){
                send_to_dialog(chunk.data);
            }
            session = session + chunk.data;
        }
    }
    // must let the dialog know the message is done
    console.log("penta_stream.js: dialog_stream_msg_end");
    impl.gameevents.dialog_stream_msg_end();

    // detect any actions. They should be the end of the message, delimintated by '###'
    // and written in JSON
    console.log("Session: "+session);
    let actions = session.split("###");

    impl.gameevents.mainchar.conversationCanvas.addDialog(impl.chatting_with_villager.name, actions[0].trim());

    if(actions.length > 1){
        // TODO! Try / catch block here
        let act = JSON.parse(actions[actions.length - 1]);
        console.log("Action: ");
        impl.gameevents.mainchar.conversationCanvas.addAction(act.action.trim());
        console.log(act);
        if(Object.prototype.hasOwnProperty.call(act, 'action')){
            if(act.action.trim() == "keep talking"){
                return;
            }
            console.log("Dispatching action: "+act.action);
            impl.dispatch_action(act);
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