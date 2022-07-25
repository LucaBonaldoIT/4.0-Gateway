"""

    Web application with Flask

"""

from flask import Flask, render_template

# Todo - Add web application implementation

app = Flask(__name__, static_folder="static")

@app.route('/')
def hello():
    return render_template('index.html')

app.run()