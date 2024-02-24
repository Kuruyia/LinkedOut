# Build stage
FROM amazoncorretto:17-alpine AS build
ARG SERVICE_NAME
WORKDIR /app

COPY ./$SERVICE_NAME ./$SERVICE_NAME
COPY ./common ./common
COPY ./protobuf ./protobuf
COPY ./gradle ./gradle
COPY ./gradle.properties .
COPY ./gradlew .
COPY ./settings.gradle.kts .

RUN --mount=type=cache,target=/root/.gradle ./gradlew clean bootJar

# Run stage
FROM amazoncorretto:17-alpine AS run
ARG SERVICE_NAME
RUN addgroup -S linkedout && adduser -u 1001 -S linkedout -G linkedout
WORKDIR /app

COPY --from=build /app/$SERVICE_NAME/build/libs/$SERVICE_NAME.jar ./app.jar

USER 1001
ENTRYPOINT ["java", "-jar", "./app.jar"]
