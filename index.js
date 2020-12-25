const Discord=require("discord.js");
const Sequelize=require("sequelize");

const client=new Discord.Client();
const TOKEN =  process.env.BOT_TOKEN;
client.login(TOKEN);

const cikralayici=require("./cikralayici.js");
const cna = require("./cna.js")
const ehb=require("./ehb.js");
const maxcontenders = 128;

let channel = null;

const DATABASE_NAME = process.env.DATABASE_NAME || "testdatabase";
const DATABASE_USERNAME = process.env.DATABASE_USERNAME || "postgres";
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || "123";
const DATABASE_HOST = process.env.DATABASE_HOST || "localhost";
const DATABASE_PORT = process.env.DATABASE_PORT || 5432;
const sequelize = new Sequelize(DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD, {
    host: DATABASE_HOST,
    dialect: "postgres",
    port: DATABASE_PORT,
});

const Contenders = sequelize.define("contenders",{
    name: {
        type: Sequelize.STRING,
        unique: true,
    },
    health:{   
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    strength:{   
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    intelligence:{  
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    agility:{   
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    charisma:{   
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    item:{   
        type: Sequelize.STRING,
    }
});
const Items = sequelize.define("items", {
    key: {
        type: Sequelize.STRING,
        unique: true
    },
    name: {
        type: Sequelize.STRING,
        unique: true,
    },
    strength:{   
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    intelligence:{  
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    agility:{   
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    charisma:{   
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    health:{   
        type: Sequelize.INTEGER,
        allowNull: false,
    }
})

client.once("ready", ()=>{
    sequelize.sync({alter: true});
});

client.on("message", async mess=>{
    channel = mess.channel;
    const message = mess.content;
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
        if(words.length==1)
        {
            let contender1 = await Contenders.findOne({ order: sequelize.random(), limit: 5 });
            let contender2 = await Contenders.findOne({ order: sequelize.random(), limit: 5 });
            while(contender2.name == contender1.name)
                contender2 = await Contenders.findOne({ order: sequelize.random(), limit: 5 });
            sentMessage = await MakeVersus(contender1, contender2);
        }
        else if(afterCommand.toLowerCase() == "istek")
        {
            sentMessage = "İstek katılımcı/eşyalar için: https://mrtrncbr-dumbbot-requests.herokuapp.com/istek";
        }
        else
        {
            if(contenders.length < 2)
                return;
            else if(contenders.length > maxcontenders)
                sentMessage="Çok fazla katılımcı var! _(Maksimum katılımcı sayısı: "+maxcontenders+")_";
            else
            {
                let databaseUsed=false;
                if(contenders.length == 2)
                {
                    let contender1 = await Contenders.findOne({where: {name: contenders[0]} });
                    let contender2 = await Contenders.findOne({where: {name: contenders[1]} });
                    if(contender1 != null && contender2 != null)
                    {
                        databaseUsed = true;
                        if(contender1.name == contender2.name)
                            sentMessage="Aynı kişileri niye savaştırıyorsun?";
                        else
                            sentMessage = await MakeVersus(contender1, contender2);
                    }
                }
                if(!databaseUsed)
                {
                    let winnerIndex = Math.floor(Math.random()*contenders.length);
                    let winner = contenders[winnerIndex];
                    sentMessage="Kazanan: "+winner;
                }
            }
        }
    }
    else if(command=="ws")
    {
        let items = afterCommand.split(";");
        if(items.length != 4)
        {
            sentMessage = "Hatalı girdi!";
        }
        else
        {
            console.log(items[0]);
            console.log(items[1]);
            console.log(items[2]);
            console.log(items[3]);
            let contender1 = await Contenders.findOne({where: {name: items[0]}});
            let contender2 = await Contenders.findOne({where: {name: items[3]}});
            let item1 = await Items.findOne({where: {name: items[1]}});
            if(item1 == null)
                item1 = await Items.findOne({where: {key: items[1]}});
            let item2 = await Items.findOne({where: {name: items[2]}});
            if(item2 == null)
                item2 = await Items.findOne({where: {key: items[2]}});
            console.log(contender1);
            console.log(contender2);
            console.log(item1);
            console.log(item2);
            if(item1 != null && item2 != null && contender1 != null && contender2 != null)
            {
                sentMessage = await MakeVersus(contender1, contender2, item1, item2);
            }
            else
            {
                sentMessage="Belirtilen eşya/savaşçılardan biri veya birkaçı bulunamadı!";
            }
        }
    }
    else if(command=="savaşçılar")
    {
        const contList = await Contenders.findAll({attributes: ["name"]});
        sentMessage = ("SAVAŞÇILAR\n"+ contList.map(c=>c.name).join("\n")) || "Savaşçı yok.";
    }
    else if(command=="ayrıntılar")
    {
        let targetContender = await Contenders.findOne({where: {name: afterCommand}});
        if(targetContender != null)
        {
            let targetItem = await Items.findOne({where: {key: targetContender.item}});
            let itemName = targetItem != null ? targetItem.name : "Yok";
            sentMessage="İsim: "+targetContender.name+"\n"+
            "Güç: "+targetContender.strength+(targetItem!=null?(", Ek ile: "+(targetContender.strength+targetItem.strength)):"")+"\n"+
            "Zeka: "+targetContender.intelligence+(targetItem!=null?(", Ek ile: "+(targetContender.intelligence+targetItem.intelligence)):"")+"\n"+
            "Çeviklik: "+targetContender.agility+(targetItem!=null?(", Ek ile: "+(targetContender.agility+targetItem.agility)):"")+"\n"+
            "Karizma: "+targetContender.charisma+(targetItem!=null?(", Ek ile: "+(targetContender.charisma+targetItem.charisma)):"")+"\n"+
            "Sağlık: "+targetContender.health+(targetItem!=null?(", Ek ile: "+(targetContender.health+targetItem.health)):"")+"\n"+
            "Eşya: "+itemName;
        }
        else
        {
            let targetItem = await Items.findOne({where: {name: afterCommand}});
            if(targetItem == null)
            {
                targetItem = await Items.findOne({where: {key: afterCommand}});
                if(targetItem==null)
                {
                    sentMessage = "Obje bulunamadı!";
                }
                else
                {
                    sentMessage="Key: "+targetItem.key+"\n"+
                    "İsim: "+targetItem.name+"\n"+
                    "Güç eklemesi: "+targetItem.strength+"\n"+
                    "Zeka eklemesi: "+targetItem.intelligence+"\n"+
                    "Çeviklik eklemesi: "+targetItem.agility+"\n"+
                    "Karizma eklemesi: "+targetItem.charisma+"\n"+
                    "Sağlık eklemesi: "+targetItem.health+"\n";
                }
            }
            else
            {
                sentMessage="Key: "+targetItem.key+"\n"+
                "İsim: "+targetItem.name+"\n"+
                "Güç eklemesi: "+targetItem.strength+"\n"+
                "Zeka eklemesi: "+targetItem.intelligence+"\n"+
                "Çeviklik eklemesi: "+targetItem.agility+"\n"+
                "Karizma eklemesi: "+targetItem.charisma+"\n"+
                "Sağlık eklemesi: "+targetItem.health+"\n";
            }
        }
    }
    else if(command=="eşyalar")
    {
        const contList = await Items.findAll({attributes: ["name", "key"]});
        sentMessage = ("EŞYALAR\n"+ contList.map(c=>(c.name+" _"+c.key+"_")).join("\n")) || "Eşya yok.";
    }
    else if(command=="eşyaata" && mess.member.hasPermission("ADMINISTRATOR"))
    {
        let itemList = await Items.findAll({attributes: ["key"]});
        shuffledArray = itemList;
        for (var i = shuffledArray.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = shuffledArray[i];
            shuffledArray[i] = shuffledArray[j];
            shuffledArray[j] = temp;
        }
        let contenderList = await Contenders.findAll({attributes: ["name"]});
        for(let i =0; i < Math.min(contenderList.length, itemList.length); i++)
        {
            let contenderName = contenderList[i].name;
            let itemKey=itemList[i].key;
            await Contenders.update({item:itemKey}, {where: {name: contenderName}});
        }
        sentMessage="İşlem bitti.";
    }
    else if(command=="eşyaekle"&& mess.member.hasPermission("ADMINISTRATOR"))
    {
        let args1 = afterCommand.split('" ');
        console.log(args1.length);
        if(args1.length==3)
        {
            let keyName = args1[0].replace('"',"").replace(" ","");
            let existingItem = await Items.findOne({where: {key: keyName}});
            if(existingItem)
            {
                sentMessage = "Böyle bir eşya zaten var!";
            }
            else
            {
                let itemName = args1[1].replace('"',"");
                let otherArgs = args1[2].split(" ");
                if(otherArgs.length == 5)
                {
                    try
                    {
                        let strength = parseInt(otherArgs[0]);
                        let intelligence = parseInt(otherArgs[1]);
                        let agility = parseInt(otherArgs[2]);
                        let charisma = parseInt(otherArgs[3]);
                        let health = parseInt(otherArgs[4]);

                        await Items.create(
                            {
                                key: keyName,
                                name: itemName,
                                strength: strength,
                                intelligence: intelligence,
                                agility: agility,
                                charisma: charisma,
                                health: health,
                            }
                        );
                        sentMessage="Eşya başarıyla oluşturuldu :partying_face:"
                    }
                    catch(e){sentMessage="Bir şeyler yanlış gitti :("}
                }
                else
                {
                    sentMessage="Bir sıkıntı çıktı! Girdilerinde hata olabilir."
                }
            }
        }
        else
        {
            sentMessage=":thinking: Komutu yarım bırakmış gibisin, girdilerini kontrol et."
        }
        
    }
    else if(command=="savaşçıekle"&& mess.member.hasPermission("ADMINISTRATOR"))
    {
        let args1 = afterCommand.split('" ');
        if(args1.length==2)
        {
            let contenderName = args1[0].replace('"',"");
            let existingContender=await Contenders.findOne({where: {name: contenderName}});
            if(existingContender)
            {
                sentMessage = "Böyle bir savaşçı zaten var!";
            }
            else
            {
                let otherArgs = args1[1].split(" ");
                if(otherArgs.length == 5)
                {
                    console.log("otherargslengths...");
                    try
                    {
                        let strength = parseInt(otherArgs[0]);
                        let intelligence = parseInt(otherArgs[1]);
                        let agility = parseInt(otherArgs[2]);
                        let charisma = parseInt(otherArgs[3]);
                        let health = parseInt(otherArgs[4]);

                        await  Contenders.create(
                            {
                                name: contenderName,
                                strength: strength,
                                intelligence: intelligence,
                                agility: agility,
                                charisma: charisma,
                                health: health,
                            }
                        );
                        sentMessage="Savaşçı başarıyla oluşturuldu :partying_face:"
                    }
                    catch(e){sentMessage="Bir şeyler yanlış gitti :("}
                }
                else
                {
                    sentMessage="Bir sıkıntı çıktı! Girdilerinde hata olabilir."
                }
            }
        }
        else
        {
            sentMessage=":thinking: Komutu yarım bırakmış gibisin, girdilerini kontrol et."
        }
        
    }
    else if(command=="sil"&& mess.member.hasPermission("ADMINISTRATOR"))
    {
        let rowCount = await Contenders.destroy({ where: { name: afterCommand } });
        if (!rowCount)
        {
            rowCount = await Items.destroy({ where: { key: afterCommand } });
            if(!rowCount)
                sentMessage="Böyle bir obje yok!"
            else
                sentMessage="Eşya başarıyla silindi."
        }
        else
        {
            sentMessage="Savaşçı başarıyla silindi."
        }
    }
    if(sentMessage!="")
        SendMessage(sentMessage, channel);
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
function ReassembleWords(wordArray, startIndex = 0)
{
    let str = "";
    for(let i = startIndex; i<wordArray.length; i++)
    {
        str += wordArray[i];
        if(i < wordArray.length-1)
            str+=" ";
    }
    return str;
}
function ShowHelp()
{
    return helpText = '```!yardım -> Yardım\n!ehb <soru> -> Sorulan soruya "Evet, hayır, belki" diye cevap verir.\n!çıkrala <metin> -> Çıkralar.\n!can -> Can.\n!puanla <şey> -> Puanlar.\n!vs <rakip1>;<rakip2>;<rakip3>;......;<rakipn> -> Versus.\n!vs -> Veritabanındaki karakterlerle versus.\n!vs istek -> İstek sitesine yönlendirir.\n!ws <savaşçı1>;<eşya1>;<savaşçı2>;<eşya2> -> Belirtilen savaşçılar ve eşyalar ile versus.\n!savaşçılar -> Veritabanındaki versus katılımcılarını gösterir.\n!eşyalar -> Veritabanındaki eşyaları gösterir.\n!ayrıntılar <objeismi> -> Savaşçı/Eşyayla ilgili ayrıntılı bilgiler.\n\n\nYÖNETİCİLER TARAFINDAN UYGULANABİLİR KOMUTLAR\n!eşyaata -> Veritabanındaki eşyaları rastgele savaşçılara dağıtır.\n!eşyaekle "<eşyaanahtarı>" "<eşyaismi>" <güçeki> <zekaeki> <çeviklikeki> <karizmaeki> <sağlıkeki> -> Eşya oluşturur.\n!savaşçıekle "<savaşçıismi>" <güç> <zeka> <çeviklik> <karizma> <sağlık> -> Savaşçı oluşturur\n!sil <savaşçıismi/eşyaanahtarı> -> Belirtilen eşya/savaşçıyı siler.```';
}
function SendMessage(message, channel)
{
    channel.startTyping(1);
    setTimeout(() => {
        channel.send(message);
        channel.stopTyping(true);
    }, (1+(Math.random()*0.5))*1000);
}

async function MakeVersus(contender1, contender2, item1=null, item2=null)
{
    let message = contender1.name+" vs "+contender2.name +"\n";
    let stats1 ={str: 0, agi:0, int:0, char:0, hp:0};
    stats1.str = contender1.strength;
    stats1.agi = contender1.agility;
    stats1.int = contender1.intelligence;
    stats1.char = contender1.charisma;
    stats1.hp = contender1.health;
    if(item1==null)
        item1 = await Items.findOne({where: {key: contender1.item}});
    if(item1 != null)
    {
        stats1.str += item1.strength;
        stats1.agi += item1.agility;
        stats1.int += item1.intelligence;
        stats1.char += item1.charisma;
        stats1.hp += item1.health;
    }
    let stats2 ={str: 0, agi:0, int:0, char:0, hp:0};
    stats2.str = contender2.strength;
    stats2.agi = contender2.agility;
    stats2.int = contender2.intelligence;
    stats2.char = contender2.charisma;
    stats2.hp = contender2.health;
    if(item2==null)
        item2 = await Items.findOne({where: {key: contender2.item}});
    if(item2 != null)
    {
        stats2.str += item2.strength;
        stats2.agi += item2.agility;
        stats2.int += item2.intelligence;
        stats2.char += item2.charisma;
        stats2.hp += item2.health;
    }
    let turn = Math.floor(Math.random()*2);
    while(stats1.hp > 0 && stats2.hp > 0)
    {
        turn = turn%2;
        if(turn == 0)
        {
            let damage = stats1.strength + Math.floor(Math.random()*13);
            let defence = Math.max(0, Math.ceil((Math.sign(stats2.agi)*stats2.agi*stats2.agi+Math.sign(stats2.char)*stats2.char*stats2.char+Math.sign(stats2.int)*stats2.int*stats2.int)/(Math.abs(stats2.agi)+Math.abs(stats2.char)+Math.abs(stats2.int))));
            damage = Math.max(damage-defence, 0);
            stats2.hp -= damage;
        }
        else
        {
            let damage = stats2.strength + Math.floor(Math.random()*13);
            let defence = Math.max(0, Math.ceil((Math.sign(stats1.agi)*stats1.agi*stats1.agi+Math.sign(stats1.char)*stats1.char*stats1.char+Math.sign(stats1.int)*stats1.int*stats1.int)/(Math.abs(stats1.agi)+Math.abs(stats1.char)+Math.abs(stats1.int))));
            damage = Math.max(damage-defence, 0);
            stats1.hp -= damage;
        }
        turn++;
    }
    if(stats1.hp <=0 && stats2.hp <= 0)
    {
        message+="SONUÇ: Berabere :(";
        return message;
    }
    let winner = stats1.hp > 0 ? contender1 : contender2;
    let loser = stats1.hp > 0 ? contender2 : contender1;
    let winItem = stats1.hp > 0 ? item1 : item2;
    let itemDesc = winItem != null ? winItem.name + " ile " : "";
    message += "SONUÇ: "+loser.name+", rakibi "+winner.name+" tarafından "+itemDesc+"öldürüldü.";
    return message;
}