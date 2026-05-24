#!/bin/sh
export DATABASE_URL="postgresql://postgres:PpikgDVOWVaklOKUIjHBjfVQMBbNmvve@postgres.railway.internal:5432/railway"
exec node backend/server.js
