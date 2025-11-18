import sys
import os
from flask import Flask

# Ruta de la aplicaciÃ³n
sys.path.insert(0, '/var/www/sistema_mantenimientos_tecnologia')

# Importar la app Flask
from app import app as application