from werkzeug.security import check_password_hash
from flask_login import UserMixin


class User(UserMixin):

    def __init__(self, id, username, password, fullname=None, rol= None):
        self.id = id
        self.username = username
        self.password = password
        self.fullname = fullname
        self.rol = rol

    @classmethod
    def check_password(self, hashed_password, password):
        return check_password_hash(hashed_password, password)
        
# print(generate_password_hash ("Medellin2024"))

#(,generate_password_hash) Esta linea la pego en la primer linea despues de (from werkzeug.security import check_password_hash)
# LUEGO
# print(generate_password_hash ("Medellin2024")) esta linea se utiliza para crear nuevos usuarios, donde la contraseña se define dentro 
# de las comillas e iria al final del codigo
 #LUEGO
#(python .\src\models\entities\User.py) pego el comando que se encuentra dentro de los parentesis en la terminal y lo ejecuto, 
#donde arroja un password el cual pego en la tabla de usuario para la creación del nuevo perfil