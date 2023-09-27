import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: '*' });

  //code của swager
  const config = new DocumentBuilder()
    .setTitle('Thuan-Phat')
    .setVersion('v0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(8080);
}
bootstrap();

//nest new my-backend, chọn yarn trong lúc khởi tạo
//yarn add @nestjs/swagger swagger-ui-express, lệnh cài đặt swagger
// //code của swager
// const config = new DocumentBuilder().setTitle("NODEJS 33").setVersion("v1.1").build();
// const document = SwaggerModule.createDocument(app, config);
// SwaggerModule.setup("swagger", app, document)

//yarn add @nestjs/jwt, lệnh cài jwt
// //code config trong app.module.ts
// JwtModule.register({
//   secret: process.env.JWT_SECRET, // Thay thế bằng secret key của bạn
//   signOptions: { expiresIn: '1h' }, // Thời gian hết hạn của token
// }),

//yarn add bcryptjs, lệnh cài đặt bcryptjs để mã hoá password
//yarn add prisma @prisma/client, lệnh cài đặt prisma
//yarn prisma init, lệnh tạo schema.prisma và .env

//cấu hình chuỗi kết nối csdl
//vào .env sửa thông tin kết nối csdl DATABASE_URL="mysql://root:1234@localhost:3306/db_demo?schema=public"
//vào schema.prisma sửa provider = "mysql"
// yarn prisma db pull, map các bảng về
// yarn prisma generate, đẩy các bảng vào prisma/client để dùng

//nest g resource nguoiDung --no-spec, lệnh tạo cấu trúc thư mục chuẩn của nest, (mình ít dùng vì viết hết vào app)

//mình quan tâm 2 file app.controller và app.service
//app.controller viết các routes api
//app.service viết các xử lý logic

//tự tạo file app.dto.ts, để địnnh dạng các cấu trúc dto

//upload hình bằng multer
//yarn add multer @nestjs/platform-express
//yarn add @types/multer

//phần server
// # cài đặt các ứng dụng cần thiết cho vps như: git, nodejs, docker
// # dùng dịch vụ mysql của docker: lệnh phía dưới
// # sudo apt update
// # sudo apt upgrade
// # apt install git
// # curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
// # apt install docker.io

// # docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=123456 -p 3306:3306 mysql:latest

// # docker build . -t img-backend
// # docker run -d -p 8080:8080 --name cons-backend img-backend
// # docker run -d -p 8080:8080 -e DATABASE_URL=mysql://root:123456@61.14.233.80:3306/db_app?schema=public -e USER_NAME=root -e PASS=123456 --name cons-backend img-backend


// # cách bỏ port
// # apt install docker-compose
// # docker-compose -f docker-compose-nginx.yml up -d
// # DOMAIN:81 => ĐỂ TRUY CẬP VÀO SETUP
// # Email:    admin@example.com
// # Password: changeme
// # CHỌN host => proxy host => add proxy host

// #ssh-keygen -R "61.14.233.80"
// #ssh-keyscan -p 2018 61.14.233.80 >> ~/.ssh/known_hosts
// #curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
