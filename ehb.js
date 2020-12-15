module.exports=
{
    EHB: function()
    {
        let n = Math.random()*101;
        let type = Math.floor(n/33.3);
        let message = type == 0 ? "Evet." : type == 1 ? "Hayır." : "Belki.";
        return message;
    }
}