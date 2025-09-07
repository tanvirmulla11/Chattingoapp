#!/bin/sh
echo "⏳ Waiting for MySQL to be ready..."
until nc -z db 3306; do
  sleep 2
done
echo "✅ MySQL is up - starting backend"
exec java -jar app.jar
