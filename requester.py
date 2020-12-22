import os, sqlite3

from bottle import Bottle, route, template, redirect, static_file, error, run, post, request, get
from bottle.ext import sqlite

app = Bottle()
plugin = sqlite.Plugin(dbfile='/bro.db')
app.install(plugin)

@route('/istek')
def show_home():
    conn = sqlite3.connect("requests.sqlite")
    c = conn.cursor()
    c.execute("SELECT * FROM requests")
    rows = c.fetchall()
    conn.close()
    fromsubmit = request.query.fromsubmit
    tempval = fromsubmit
    all_data = {'rows': rows, "submit": tempval}
    return template("form", data=all_data)

@route("/")
    redirect("/istek")

@route("/ilet", method="POST")
def post():
    name = request.forms.get("name")
    print(name)
    strength = request.forms.get("str")
    print(strength)
    intelligence = request.forms.get("int")
    agility = request.forms.get("agi")
    charisma = request.forms.get("chr")
    health = request.forms.get("hp")
    imagelink = request.forms.get("image")
    typeofobject = request.forms.get("type")

    conn = sqlite3.connect("requests.sqlite")
    c = conn.cursor()
    c.execute("INSERT INTO requests (name, strength, intelligence, agility, charisma, health, imagelink, type) values (?,?,?,?,?,?,?,?)",(name, strength, intelligence, agility, charisma, health, imagelink, typeofobject))
    conn.commit()
    conn.close()

    redirect("/istek?fromsubmit=false")


if os.environ.get('APP_LOCATION') == 'heroku':
    run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
else:
    run(host='localhost', port=8080, debug=True)