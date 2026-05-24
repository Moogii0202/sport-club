#!/bin/sh
export DATABASE_URL="postgresql://postgres:PpikgDVOWVaklOKUIjHBjfVQMBbNmvve@postgres.railway.internal:5432/railway"
export EMAIL_USER="volleyballclub408@gmail.com"
export EMAIL_PASS="fumcddtyjogsorsn"
export JWT_SECRET="43577cf276c010a83f32074bd42f08544b97e780f3f21a932fabf3188dfe4d24"
exec node backend/server.js
