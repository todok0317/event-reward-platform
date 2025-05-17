FROM node:18

WORKDIR /usr/src/app

# 빌드 도구 설치
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 패키지 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# 애플리케이션 빌드
RUN npm run build auth-server

# 애플리케이션 실행
CMD ["node", "dist/apps/auth-server/main"]
