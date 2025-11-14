from flask_wtf.csrf import CSRFProtect
from flask_mysqldb import MySQL
from flask_login import LoginManager

# Inicializo las extenciones
csrf = CSRFProtect()
db = MySQL()
login_manager = LoginManager()