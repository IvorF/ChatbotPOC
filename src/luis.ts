/// <reference path="../node_modules/botbuilder/lib/botbuilder.d.ts" />
/// <reference path="../node_modules/@types/restify/index.d.ts" />

import * as builder from "botbuilder";
import * as restify from "restify";

const fetch = require("node-fetch");

require("dotenv-extended").load();

function normalizeAndStoreData(sess: builder.Session, args: any): void {
    sess.dialogData.name = builder.EntityRecognizer.findEntity(args.intent.entities, "Name");
    sess.dialogData.product = builder.EntityRecognizer.findEntity(args.intent.entities, "Product");
    sess.dialogData.number = builder.EntityRecognizer.findEntity(args.intent.entities, "builtin.number");
}

function postNewUtterance(text, intent) {
    let intent1 = intent.intents[0].score
    let intent2 = intent.intents[1].score
    let extract = intent1 - intent2
    console.log("----intent1-------")
    console.log(intent1, "name:", intent.intents[0].intent)
    console.log("------intent2-----")
    console.log(intent2, "name:", intent.intents[1].intent)
    console.log("------extract-----")
    console.log(extract)

    console.log("------put new utterance?-----")
    if (extract > 0.5) {
        console.log("YES")
        fetch('https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/3480e277-67b8-4cb9-af10-f7db6ce55d63/versions/0.1/example', {
            method: 'POST',
            body: JSON.stringify({
                "text": text,
                "intentName": intent.intents[0].intent,
                "entityLabels": [
                    getEntities(intent.entities),
                ]
            }),
            headers: {
                'Content-type': 'application/json',
                'Ocp-Apim-Subscription-Key': '269d75ce64994b56974a933db9b0eade'
            }
        })
            .then((res: Response) => {
                return res.json();
            })
            .then((json) => {
                console.log('#############################')
                console.log('Result fetch', json);
                console.log('#############################')
            })
            .catch(() => console.log('Calling POST example has crashed'));
    } else {
        console.log("NO")
    }

    // console.log("----text-------")
    // console.log(text)
    // console.log("------intentname-----")
    // console.log(intent.intents[0].intent)
    // console.log("-----entities------")
    // console.log(intent.entities)
    // console.log("-----type------3")
    // console.log(intent.entities[0].type)
    // console.log("-------startIndex----3")
    // console.log(intent.entities[0].startIndex)
    // console.log("-----endIndex------3")
    // console.log(intent.entities[0].endIndex)

    // console.log("-----entities------3")
    // for (let entity of intent.entities) {
    //     console.log({
    //         "entityName": entity.type.replace("builtin.", ""),
    //         "startCharIndex": entity.startIndex,
    //         "endCharIndex": entity.endIndex
    //     })
    // }
}

function getEntities(entities) {
    let res
    for (let entity of entities) {
        res += {
            "entityName": entity.type.replace("builtin.", ""),
            "startCharIndex": entity.startIndex,
            "endCharIndex": entity.endIndex
        }
        res += ","
    }
    res += ""
    console.log("RES", res)
    return res
}

function logIntents(args: any): void {
    console.log(args);
    console.log("INTENT", args.intent.intent);
    console.log("ENTITIES", args.intent.entities);
}

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`Listening... ${server.name}... ${server.url}`);
});

var conn = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID
    , appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(conn);
bot.recognizer(new builder.LuisRecognizer(process.env.LUIS_MODEL_URL));
server.post("/api/messages", conn.listen());

bot.dialog("/addMore", (sess, args) => {
    normalizeAndStoreData(sess, args);
    postNewUtterance(sess.message.text, args.intent)
    sess.send(`You need the "${args.intent.intent}" intent ${sess.dialogData.number === null ? '' : 'met entity ' + sess.dialogData.number.entity}`);
}).triggerAction({
    matches: "AddMore"
});

bot.dialog("/clearBasket", (sess, args) => {
    postNewUtterance(sess.message.text, args.intent)
    sess.send("Your cart is now empty");
    //sess.send(`You need the "${args.intent.intent}" intent`);
}).triggerAction({
    matches: "ClearBasket"
});

bot.dialog("/curse", (sess, args) => {
    postNewUtterance(sess.message.text, args.intent)
    sess.send(`You need the "${args.intent.intent}" intent`);
}).triggerAction({
    matches: "Curse"
});

bot.dialog("/deleteItem", (sess, args) => {
    postNewUtterance(sess.message.text, args.intent)
    sess.send(`You need the "${args.intent.intent}" intent`);
}).triggerAction({
    matches: "DeleteItem"
});

bot.dialog("/findItem", (sess, args) => {
    postNewUtterance(sess.message.text, args.intent)
    normalizeAndStoreData(sess, args);
    sess.send(`You need the "${args.intent.intent}" intent ${sess.dialogData.product === null ? '' : 'with entity ' + '"' + sess.dialogData.product.entity + '"'} ${sess.dialogData.number === null ? '' : 'and amount ' + '"' + sess.dialogData.number.entity + '"'}`);
}).triggerAction({
    matches: "FindItem"
});

bot.dialog("/greeting", (sess, args) => {
    postNewUtterance(sess.message.text, args.intent)
    normalizeAndStoreData(sess, args);
    sess.send(`Hello ${sess.dialogData.name === null ? '' : '"' + sess.dialogData.name.entity + '"'}`)
    //sess.send(`You need the "${args.intent.intent}" intent`);
}).triggerAction({
    matches: "Greeting"
});

bot.dialog("/help", (sess, args) => {
    postNewUtterance(sess.message.text, args.intent)
    sess.send("I will send help!")
    //sess.send(`You need the "${args.intent.intent}" intent`);
}).triggerAction({
    matches: "Help"
});

bot.dialog("/joke", (sess, args) => {
    postNewUtterance(sess.message.text, args.intent)
    sess.send("This might make you laugh. How do robots eat guacamole? With computer chips.")
    //sess.send(`You need the "${args.intent.intent}" intent`);
}).triggerAction({
    matches: "Joke"
});

bot.dialog("/none", (sess, args) => {
    postNewUtterance(sess.message.text, args.intent)
    sess.send(`You need the "${args.intent.intent}" intent`);
}).triggerAction({
    matches: "None"
});

bot.dialog("/removeMore", (sess, args) => {
    postNewUtterance(sess.message.text, args.intent)
    normalizeAndStoreData(sess, args);
    sess.send(`This item will be deleted ${sess.dialogData.number === null ? '' : '"' + sess.dialogData.number.entity + '"' + " times"}`);
    //sess.send(`You need the "${args.intent.intent}" intent ${sess.dialogData.number === null ? '' : 'with entity ' + '"' + sess.dialogData.number.entity + '"'}`);
}).triggerAction({
    matches: "RemoveMore"
});

bot.dialog("/showBasket", (sess, args) => {
    postNewUtterance(sess.message.text, args.intent)
    sess.send("I will show you your basket")
    //sess.send(`You need the "${args.intent.intent}" intent`);
}).triggerAction({
    matches: "ShowBasket"
});

bot.dialog("/showProfile", (sess, args) => {
    postNewUtterance(sess.message.text, args.intent)
    sess.send("I will show you your profile")
    //sess.send(`You need the "${args.intent.intent}" intent`);
}).triggerAction({
    matches: "ShowProfile"
});

bot.dialog("/stop", (sess, args) => {
    postNewUtterance(sess.message.text, args.intent)
    sess.send("Ok, I'll quit")
    //sess.send(`You need the "${args.intent.intent}" intent`);
}).triggerAction({
    matches: "Stop"
});

bot.dialog("/updateProfile", (sess, args) => {
    postNewUtterance(sess.message.text, args.intent)
    sess.send("I can update that")
    //sess.send(`You need the "${args.intent.intent}" intent`);
}).triggerAction({
    matches: "UpdateProfile"
});

// bot.dialog("/", [
//     (sess, args, next) => {
//         sess.userData.arrival = undefined;
//         sess.userData.departure = undefined;
//         if (!sess.userData.name) {
//             sess.beginDialog("/profile");
//         }
//         else {
//             next();
//         }
//     },
//     (sess, result) => {
//         sess.send(`Hello ${sess.userData.name}! What may I help you with?`);
//     }
// ]);

// bot.dialog("/departure", [
//     (sess, args, next) => {
//         builder.Prompts.text(sess, "What is your departure city?");
//     },
//     (sess, result) => {
//         sess.userData.departure = result.reponse;
//         sess.endDialog();
//     }
// ]);

// bot.dialog("/arrival", [
//     (sess, args, next) => {
//         builder.Prompts.text(sess, "What is your arrival city?");
//     },
//     (sess, result) => {
//         sess.userData.arrival = result.reponse;
//         sess.endDialog();
//     }
// ]);

// bot.dialog("/profile", [
//     (sess, args, next) => {
//         builder.Prompts.text(sess, "Hello, user! What is your name");
//     },
//     (sess, result) => {
//         sess.userData.name = result.response;
//         sess.endDialog();
//     }
// ]);

// bot.dialog("/noresults", [
//     (sess, args, next) => {
//         if (args && args.entry && args.entry === "dialog") {
//             builder.Prompts.choice(sess, "Sorry. No results were found. :( Would you like to try again?", [
//                 "Yes"
//                 , "No"
//             ]);
//         }
//         else {
//             sess.send("Oh hey! You're back! Let's start this over.");
//             sess.replaceDialog("/");
//         }
//     },
//     (sess, result) => {
//         if (result.response.entity === "Yes") {
//             sess.replaceDialog("/");
//         }
//         else {
//             sess.send("Okay, bye!");
//         }
//     }
// ]);
