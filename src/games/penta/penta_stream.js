// --
// penta_stream.js
// 
// Handled stream responses from Braintrust for Penta including all object and action parsing
// 
// --

import * as BT  from '@spaced/bt.js';
import * as PROTO from './pentaproto.js';


export async function invoke_prompt_input_stream(impl, slug, sysinput, send_to_dialog, log_response){

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
    impl.gameevents.dialog_stream_msg_end();

    let parsed = PROTO.parse_response(session);

    log_response(parsed.msg);

    if(parsed.action){
        // TODO! Try / catch block here
        // let act = JSON.parse(actions[actions.length - 1]);
        console.log("Action: "+parsed.action);
        impl.gameevents.mainchar.conversationCanvas.addAction(parsed.action.trim());
        if(parsed.action.trim() == "keep talking"){
            return;
        }else{
            console.log("Dispatching action: "+parsed);
            impl.dispatch_action(parsed);
        }
    }else{
        console.log("No action found in JSON object");
    }

    if (!impl.is_chatting){
      impl.gameevents.dialog_stream_done();
    }
}