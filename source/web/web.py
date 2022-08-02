"""

    Web application with Flask

"""

from flask import Flask, redirect, render_template, request
import numpy as np
import sqlite3
import json

config = None
with open('source/server/config.json') as config_file:
    config = json.load(config_file)

labels = []
for parameter in config['device']['parameters']:
    labels.append(parameter['name'])

con = sqlite3.connect('databases/machine.db', check_same_thread=False)
cur = con.cursor()


app = Flask(__name__, static_folder="static")
app.config['TEMPLATES_AUTO_RELOAD'] = True

@app.route('/')
def root():
    return redirect("/index", code=302)

@app.route('/index')
def index():
    arr = None

    if ('max' in request.args):
        max_row = 100
        try:
            max_row = int(request.args["max"])
        except:
            pass
        arr = np.array([row for row in cur.execute(f'SELECT * FROM machine ORDER BY date DESC LIMIT {max_row}')])
    else:
        arr = np.array([row for row in cur.execute('SELECT * FROM machine ORDER BY date DESC')])

    autorefresh_script = ''

    if 'autorefresh' in request.args:
        if request.args['autorefresh'] == 'true':
            autorefresh_script = 'setTimeout(function () {location.reload();}, 5000)'

    y = {}
    for i, label in zip(range(0, len(labels)), labels):
        orr = arr[:, i + 1].tolist()
        orr.reverse()
        y[label] = orr

    x = arr[:, 0].tolist()
    x.reverse()

    last_data = {'x':x, 'y':y, 'labels':labels}
    return render_template('index.html', data=last_data, autorefresh_script=autorefresh_script)

@app.route('/index/<last_n>')
def index_n(last_n):
    arr = np.array([row for row in cur.execute(f'SELECT * FROM machine ORDER BY date DESC LIMIT {last_n}')])
    y = {}
    for i, label in zip(range(0, len(labels)), labels):
        orr = arr[:, i + 1].tolist()
        orr.reverse()
        y[label] = orr

    x = arr[:, 0].tolist()
    x.reverse()

    last_data = {'x':x, 'y':y, 'labels':labels}
    return render_template('index.html', data=last_data)

app.run(debug=True)