"""

    Web application with Flask

"""

from flask import Flask, render_template

# Todo - Add web application implementation

app = Flask(__name__)

@app.route('/')
def hello():
    return render_template('index.html')

app.run()