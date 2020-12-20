const Discord=require("discord.js");
const client=new Discord.Client();
const cikralayici=require("./cikralayici.js");
const cna = require("./cna.js")
const ehb=require("./ehb.js");
const maxcontenders = 128;
const umut_id=process.env.UMUT_ID;

let channel = null;

client.login(process.env.BOT_TOKEN);
client.on("message", message=>{
    channel = message.channel;
    CheckForCommands(message.content, message.channel);
})
client.on("ready", ()=>{
    client.user.setPresence({status:"online"});
    client.user.setActivity('!yardım', {type:"PLAYING"});
});
/*client.on("guildMemberUpdate", (oldMember, newMember)=>
{
    console.log(oldMember.id);
    if(oldMember.id==umut_id&& oldMember.displayName != newMember.displayName && newMember.nickname != null)
    {
        let targetChannel = oldMember.guild.channels.cache.filter(chx => chx.type === "text").find(x => x.name =="dumb-bot");
        if(targetChannel==null)
            targetChannel = oldMember.guild.channels.cache.filter(chx => chx.type === "text").find(x => x.position === 0);
		SendMessage("mal umut", targetChannel);
    }
})*/
function CheckForCommands(message)
{
    if(message.charAt(0) != "!")
        return;
    let cleanMessage = message.substring(1);
    let words = cleanMessage.split(" ");
    if(words.length == 0)
        return;
    let command = words[0].toLowerCase();
    let afterCommand = ReassembleWords(words, 1);
    let sentMessage = "";
    if(command == "ehb" && words.length > 1){
        sentMessage=ehb.EHB();
    }
    else if(command == "çıkrala" && words.length > 1){
        sentMessage=cikralayici.Cikrala(afterCommand);
    }
    else if(command == "yardım" && words.length == 1){
        sentMessage=ShowHelp();
    }
    else if(command == "can" && words.length==1){
        sentMessage=cna.GetImageLink();
    }
    else if(command == "puanla"){
        sentMessage=(Math.floor(Math.random()*10)+1)+"/10";
    }
    else if(command=="vs"){
        let contenders = afterCommand.split(";");
        if(contenders.length < 2)
            return;
        else if(contenders.length > maxcontenders)
            sentMessage="Çok fazla katılımcı var! _(Maksimum katılımcı sayısı: "+maxcontenders+")_";
        else
        {
            let winnerIndex = Math.floor(Math.random()*contenders.length);
            let winner = contenders[winnerIndex];
            sentMessage="Kazanan: "+winner;
        }
    }
    if(sentMessage!="")
        SendMessage(sentMessage, channel);
}
function ReassembleWords(wordArray, startIndex = 0)
{
    let str = "";
    for(let i = startIndex; i<wordArray.length; i++)
    {
        str += wordArray[i];
        if(startIndex < wordArray.length-1)
            str+=" ";
    }
    return str;
}
function ShowHelp()
{
    return helpText = "```!yardım -> Yardım\n!ehb <soru> -> Sorulan soruya 'Evet, hayır, belki' diye cevap verir.\n!çıkrala <metin> -> Çıkralar.\n!can -> Can.\n!puanla <şey> -> Puanlar.\n!vs <rakip1>;<rakip2>;<rakip3>;......;<rakipn> -> Versus.```";
}
function SendMessage(message, channel)
{
    channel.startTyping(1);
    setTimeout(() => {
        channel.send(message);
        channel.stopTyping(true);
    }, (1+(Math.random()*0.5))*1000);
}