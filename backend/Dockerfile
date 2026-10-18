FROM jelastic/maven:3.9.5-openjdk-21 AS build

WORKDIR /build

COPY pom.xml .
COPY src ./src

RUN mvn clean packeage -DSkipTests

FROM alpine/java:21-jre

WORKDIR /app

COPY --from=build ./build/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java" , "-jar", "app.jar"]

