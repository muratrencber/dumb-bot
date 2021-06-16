const url = process.env.URL || "https://sunstruck.games/dumb";
const urlExist = require("url-exist-sync");
const dict = {
    "troll1": "troll1.png",
    "troll2": "troll5.png",
    "amongbitches": "359.jpg",
    "fboi": "fboi.png",
    "fcat": "fcat.png",
    "ege1": "ege1.png",
    "ege2": "ege2.png",
    "cumut": "cumut.gif",
    "ekşi": "eksi.png",
}

module.exports=
{
    
    GetImageLink: function(key)
    {
        let imgStr = "";
        try
        {
            console.log("trying...");
            imgStr = dict[key];
            console.log("imgStr is: "+imgStr);
            if(imgStr == null  || imgStr == "" || imgStr == undefined)
            {
                imgStr = key;
            }
            else if (DoesURLExist(url+"/emoji_media/"+imgStr))
            {
                return url+"/emoji_media/"+imgStr;
            }
        }
        catch
        {
            imgStr = key;
        }
        if(DoesURLExist(url+"/emoji_media/"+imgStr))
        {
            return url+"/emoji_media/"+imgStr;
        }
        else if(DoesURLExist(url+"/emoji_media/"+imgStr+".jpg"))
        {
            return url+"/emoji_media/"+imgStr+".jpg";
        }
        else if(DoesURLExist(url+"/emoji_media/"+imgStr+".jpeg"))
        {
            return url+"/emoji_media/"+imgStr+".jpeg";
        }
        else if(DoesURLExist(url+"/emoji_media/"+imgStr+".png"))
        {
            return url+"/emoji_media/"+imgStr+".png";
        }
        else if(DoesURLExist(url+"/emoji_media/"+imgStr+".gif"))
        {
            return url+"/emoji_media/"+imgStr+".gif";
        }
        return "";
    },
    ListEmojis : function()
    {
        let str = "Kayıtlı kısaltmalar: \n";
        for (var key in dict) {
            // check if the property/key is defined in the object itself, not in parent
            if (dict.hasOwnProperty(key)) {           
                str += key + "\n";
            }
        }
        return str;
    }
}

function DoesURLExist(url)
{
    const exists = urlExist(url);
    return exists;
}