<!DOCTYPE html>
<html>
    <head>
        <title> Test </title>
        <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
        <style>
            body{
                font-size: 1.5em;
                padding: 0 10% 0 10%;
                font-family: 'Roboto', sans-serif;
            }
            table{
            border:0.1em solid black;
            border-spacing: 0;
            border-collapse:separate;
            }
            td, th
            {
                border: 1pt solid black;
                margin: 0;
                padding: 1em;
                text-align: center;
            }
            input[type=text], select {
            width: 100%;
            padding: 12px 20px;
            margin: 8px 0;
            display: inline-block;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
            }       
    
            input[type=submit] {
              width: 100%;
              background-color: #4c66af;
              color: white;
              padding: 14px 20px;
              margin: 8px 0;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }       
    
            input[type=submit]:hover:not(:disabled) {
              background-color: #4c66af;
            }

            input[type=submit]:disabled {
              background-color:gray;
              cursor:default;
            }         
    
            div {
              border-radius: 5px;
              background-color: #f2f2f2;
              padding: 20px;
            }
            input[type=range] {
      height: auto;
      -webkit-appearance: none;
      margin: 3em;
      width: 80%;
    }
    input[type=range]:focus {
      outline: none;
    }
    input[type=range]::-webkit-slider-runnable-track {
      width: 100%;
      height: 5px;
      cursor: pointer;
      animate: 0.2s;
      box-shadow: 0px 0px 0px #000000;
      background: #4c66af;
      border-radius: 1px;
      border: 0px solid #000000;
    }
    input[type=range]::-webkit-slider-thumb {
      box-shadow: 0px 0px 0px #000000;
      border: 1px solid #4c66af;
      height: 18px;
      width: 18px;
      border-radius: 25px;
      background: #FFFFFF;
      cursor: pointer;
      -webkit-appearance: none;
      margin-top: -7px;
    }
    input[type=range]:focus::-webkit-slider-runnable-track {
      background: #4c66af;
    }
    input[type=range]::-moz-range-track {
      width: 80%;
      height: 5px;
      cursor: pointer;
      animate: 0.2s;
      box-shadow: 0px 0px 0px #000000;
      background: #4c66af;
      border-radius: 1px;
      border: 0px solid #000000;
    }
    input[type=range]::-moz-range-thumb {
      box-shadow: 0px 0px 0px #000000;
      border: 1px solid #4c66af;
      height: 18px;
      width: 18px;
      border-radius: 25px;
      background: #FFFFFF;
      cursor: pointer;
    }
    input[type=range]::-ms-track {
      width: 80%;
      height: 5px;
      cursor: pointer;
      animate: 0.2s;
      background: transparent;
      border-color: transparent;
      color: transparent;
    }
    input[type=range]::-ms-fill-lower {
      background: #4c66af;
      border: 0px solid #000000;
      border-radius: 2px;
      box-shadow: 0px 0px 0px #000000;
    }
    input[type=range]::-ms-fill-upper {
      background: #4c66af;
      border: 0px solid #000000;
      border-radius: 2px;
      box-shadow: 0px 0px 0px #000000;
    }
    input[type=range]::-ms-thumb {
      margin-top: 1px;
      box-shadow: 0px 0px 0px #000000;
      border: 1px solid #4c66af;
      height: 18px;
      width: 18px;
      border-radius: 25px;
      background: #FFFFFF;
      cursor: pointer;
    }
    input[type=range]:focus::-ms-fill-lower {
      background: #4c66af;
    }
    input[type=range]:focus::-ms-fill-upper {
      background: #4c66af;
    }
    div.warning
    {
        width: 100%;
        border: 0.1em solid  #4c66af;
        border-radius: 0.1em;
        background-color: white;
        box-shadow: 0.05em 0.05em 0.1em 0.5  #4c66af;
        text-align: center;
        display: inline-block;
    }
    div.warning button
    {
        background-color: white;
        border: 0.1em solid  #4c66af;
        border-radius: 0.3em;
        padding: 0.8em;
        transition: 0.2s ease-in-out;
        color:  #4c66af;
    }
    div.warning button:hover
    {
        color: white;
        background-color:  #4c66af;
        cursor: pointer;
    }
    
        </style>
    </head>
    <body><script type="text/javascript">
    function Clear()
    {
        
        var uri = window.location.toString();
        if (uri.indexOf("?") > 0) {
            var clean_uri = uri.substring(0, uri.indexOf("?"));
            window.history.replaceState({}, document.title, clean_uri);
            document.getElementById("warning").outerHTML="";
        }
    }
        </script>
        % if data["submit"]:
            <div class="warning" id="warning">
                <h3>Talebiniz iletildi!</h3>
                <button onclick="Clear()">Tamam.</button>
            </div>
        % end
        <h1>dumb-bot Versus Savaşçı/Eşya Başvuru Formu</h1>
        <form action="/ilet" method="post">
        <label for="name"> İsim:</label><br>
        <input type="text" id="name" name="name" placeholder="Örn: THL4STHOPE" value="" oninput="refresh()"><br>
        <label for="str"> Güç:</label>
        <input type="range" min="-20" max="20" value="0" id="str" name="str" oninput="refresh()"><label id="strshow"></label><br>
        <label for="int"> Zekâ:</label>
        <input type="range" min="-20" max="20" value="0" id="int" name="int" oninput="refresh()"><label id="intshow"></label><br>
        <label for="agi"> Çeviklik:</label>
        <input type="range" min="-20" max="20" value="0" id="agi" name="agi" oninput="refresh()"><label id="agishow"></label><br>
        <label for="chr"> Karizma:</label>
        <input type="range" min="-20" max="20" value="0" id="chr" name="chr" oninput="refresh()"><label id="chrshow"></label><br>
        <label for="hp"> Sağlık:</label>
        <input type="range" min="0" max="200" value="100" id="hp" name="hp" oninput="refresh()"><label id="hpshow"></label><br>
        <label for="image"> Resminin linki:</label><br>
        <input type="text" id="image" placeholder="URL girin" value="" name="image" oninput="refresh()"><br><br>
        <label for="type">Tür:</label><br>
        <input type="radio" id="contender" value="contender" name="type" checked><label for="contender">Savaşçı</label>
        <input type="radio" id="item" value="item" name="type"><label for="item">Eşya</label>
        <input type="submit" disabled id="submitbutton">
        </form>
        <h1>Son İstekler:</h1>
        <table>
            <tr>
                <th>İsim</th>
                <th>Güç</th>
                <th>Zekâ</th>
                <th>Çeviklik</th>
                <th>Karizma</th>
                <th>Sağlık</th>
                <th>Resim Linki</th>
                <th>Tür</th>
            </tr>
            % for row in reversed(data["rows"]):
            <tr>
                <td>{{row[0]}}</td>
                <td>{{row[1]}}</td>
                <td>{{row[2]}}</td>
                <td>{{row[3]}}</td>
                <td>{{row[4]}}</td>
                <td>{{row[5]}}</td>
                <td>{{row[6]}}</td>
                <td>{{row[7]}}</td>
            </tr>
            % end
        </table>
    </body>
    <script>
        refresh();
        function refresh()
        {
            let strshow = document.getElementById("strshow");
            let str = document.getElementById("str");
            strshow.innerHTML = str.value;
            let intshow = document.getElementById("intshow");
            let int = document.getElementById("int");
            intshow.innerHTML = int.value;
            let agishow = document.getElementById("agishow");
            let agi = document.getElementById("agi");
            agishow.innerHTML = agi.value;
            let chrshow = document.getElementById("chrshow");
            let chr = document.getElementById("chr");
            chrshow.innerHTML = chr.value;
            let hpshow = document.getElementById("hpshow");
            let hp = document.getElementById("hp");
            hpshow.innerHTML = hp.value;
            let disabled = document.getElementById("name").value == "" || document.getElementById("image").value == "";
            if(disabled)
                document.getElementById("submitbutton").outerHTML='<input type="submit" disabled id="submitbutton">';
            else
                document.getElementById("submitbutton").outerHTML='<input type="submit" id="submitbutton">';

        }
    </script>
</html>