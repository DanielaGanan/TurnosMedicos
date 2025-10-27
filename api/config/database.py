from databases import Database

DATABASE_URL = "mysql+pymysql://root:root@localhost:3306/turno_medico"

db = Database(DATABASE_URL)
