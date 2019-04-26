/// <reference path="../node_modules/botbuilder/lib/botbuilder.d.ts" />
/// <reference path="../node_modules/@types/restify/index.d.ts" />

import * as builder from "botbuilder";
import * as restify from "restify";

require("dotenv-extended").load();

function normalizeAndStoreData(sess: builder.Session, args: any): void {
    sess.dialogData.name = builder.EntityRecognizer.findEntity(args.intent.entities, "Name");
    sess.dialogData.product = builder.EntityRecognizer.findEntity(args.intent.entities, "Product");
    sess.dialogData.number = builder.EntityRecognizer.findEntity(args.intent.entities, "builtin.number");
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
    sess.send(`You need the "${args.intent.intent}" intent ${sess.dialogData.number === null ? '' : 'met entity ' + sess.dialogData.number.entity}`);
}).triggerAction({
    matches: "AddMore"
});

bot.dialog("/clearBasket", (sess, args) => {
    logIntents(args);
    sess.send("Your cart is now empty");
    //sess.send(`You need the "${args.intent.intent}" intent`);
}).triggerAction({
    matches: "ClearBasket"
});

bot.dialog("/curse", (sess, args) => {
    logIntents(args);
    sess.send(`You need the "${args.intent.intent}" intent`);
}).triggerAction({
    matches: "Curse"
});

bot.dialog("/deleteItem", (sess, args) => {
    logIntents(args);
    sess.send(`You need the "${args.intent.intent}" intent`);
}).triggerAction({
    matches: "DeleteItem"
});

bot.dialog("/findItem", (sess, args) => {
    normalizeAndStoreData(sess, args);
    sess.send(`You need the "${args.intent.intent}" intent ${sess.dialogData.product === null ? '' : 'with entity ' + '"' + sess.dialogData.product.entity + '"'} ${sess.dialogData.number === null ? '' : 'and amount ' + '"' + sess.dialogData.number.entity + '"'}`);
}).triggerAction({
    matches: "FindItem"
});

bot.dialog("/greeting", (sess, args) => {
    normalizeAndStoreData(sess, args);
    sess.send(`Hello ${sess.dialogData.name === null ? '' : '"' + sess.dialogData.name.entity + '"'}`)
    //sess.send(`You need the "${args.intent.intent}" intent`);
}).triggerAction({
    matches: "Greeting"
});

bot.dialog("/help", (sess, args) => {
    sess.send("I will send help!")
    //sess.send(`You need the "${args.intent.intent}" intent`);
}).triggerAction({
    matches: "Help"
});

bot.dialog("/joke", (sess, args) => {
    logIntents(args);
    sess.send("This might make you laugh. How do robots eat guacamole? With computer chips.")
    //sess.send(`You need the "${args.intent.intent}" intent`);
}).triggerAction({
    matches: "Joke"
});

bot.dialog("/none", (sess, args) => {
    logIntents(args);
    sess.send(`You need the "${args.intent.intent}" intent`);
}).triggerAction({
    matches: "None"
});

bot.dialog("/removeMore", (sess, args) => {
    logIntents(args);
    normalizeAndStoreData(sess, args);
    sess.send(`This item will be deleted ${sess.dialogData.number === null ? '' : '"' + sess.dialogData.number.entity + '"' + " times"}`);
    //sess.send(`You need the "${args.intent.intent}" intent ${sess.dialogData.number === null ? '' : 'with entity ' + '"' + sess.dialogData.number.entity + '"'}`);
}).triggerAction({
    matches: "RemoveMore"
});

bot.dialog("/showBasket", (sess, args) => {
    logIntents(args);
    sess.send("I will show you your basket")
    //sess.send(`You need the "${args.intent.intent}" intent`);
}).triggerAction({
    matches: "ShowBasket"
});

bot.dialog("/showProfile", (sess, args) => {
    logIntents(args);
    sess.send("I will show you your profile")
    //sess.send(`You need the "${args.intent.intent}" intent`);
}).triggerAction({
    matches: "ShowProfile"
});

bot.dialog("/stop", (sess, args) => {
    logIntents(args);
    sess.send("Ok, I'll quit")
    //sess.send(`You need the "${args.intent.intent}" intent`);
}).triggerAction({
    matches: "Stop"
});

bot.dialog("/updateProfile", (sess, args) => {
    logIntents(args);
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

bot.dialog("/departure", [
    (sess, args, next) => {
        builder.Prompts.text(sess, "What is your departure city?");
    },
    (sess, result) => {
        sess.userData.departure = result.reponse;
        sess.endDialog();
    }
]);

bot.dialog("/arrival", [
    (sess, args, next) => {
        builder.Prompts.text(sess, "What is your arrival city?");
    },
    (sess, result) => {
        sess.userData.arrival = result.reponse;
        sess.endDialog();
    }
]);

bot.dialog("/profile", [
    (sess, args, next) => {
        builder.Prompts.text(sess, "Hello, user! What is your name");
    },
    (sess, result) => {
        sess.userData.name = result.response;
        sess.endDialog();
    }
]);

bot.dialog("/noresults", [
    (sess, args, next) => {
        if (args && args.entry && args.entry === "dialog") {
            builder.Prompts.choice(sess, "Sorry. No results were found. :( Would you like to try again?", [
                "Yes"
                , "No"
            ]);
        }
        else {
            sess.send("Oh hey! You're back! Let's start this over.");
            sess.replaceDialog("/");
        }
    },
    (sess, result) => {
        if (result.response.entity === "Yes") {
            sess.replaceDialog("/");
        }
        else {
            sess.send("Okay, bye!");
        }
    }
]);
