# Node.js 18 버전 이미지 사용
FROM node:18

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# 빌드 도구 설치
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# package.json 및 package-lock.json 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# Auth Server 빌드
RUN npm run build auth-server

# 서버 실행
CMD ["node", "dist/apps/auth-server/main"]
