# Stage 1: Build
FROM maven:3.9.0-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jdk
WORKDIR /app

# Install netcat (for wait-for-db.sh)
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Copy built JAR
COPY --from=build /app/target/*.jar app.jar

# Copy wait-for-db script
COPY wait-for-db.sh wait-for-db.sh
RUN chmod +x wait-for-db.sh

# Expose backend port
EXPOSE 8081

# Start script instead of running jar directly
ENTRYPOINT ["./wait-for-db.sh"]

