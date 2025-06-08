#
# Build stage
#
FROM maven:3.9.9-amazoncorretto-21-alpine AS build
COPY src /home/src
COPY pom.xml /home
RUN mvn -f /home/pom.xml clean package -Dmaven.test.skip=true
#
# Package stage
#
FROM amazoncorretto:21-alpine3.21-jdk
COPY --from=build /home/target/battleshipgame-0.0.1-SNAPSHOT.jar /usr/local/lib/battleshipgame.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/usr/local/lib/battleshipgame.jar"]