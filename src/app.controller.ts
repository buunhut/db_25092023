import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ChiTietService,
  DoiTacService,
  PhieuService,
  SanPhamService,
  UserService,
} from './app.service';
import {
  ChiTietDto,
  DangKyDto,
  DangNhapDto,
  DoiTacDto,
  EditChiTietDto,
  EditDoiTacDto,
  EditPhieuDto,
  PhieuDto,
  SanPhamDto,
  SavePhieuDto,
  SearchDto,
} from './app.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@ApiTags('Users')
@Controller()
export class UserController {
  constructor(private readonly appService: UserService) {}

  @Post('api/dang-ky')
  create(@Body() body: DangKyDto) {
    return this.appService.create(body);
  }

  @Post('api/dang-nhap')
  read(@Body() body: DangNhapDto) {
    return this.appService.read(body);
  }
}

@ApiTags('San-Pham')
@Controller()
export class SanPhamController {
  constructor(private readonly appService: SanPhamService) {}

  @ApiConsumes('multipart/form-data')
  @Post('api/tao-san-pham')
  @UseInterceptors(
    FilesInterceptor(
      'hinhAnh',
      5, // Tham số 1: key FE gửi lên
      {
        // Tham số 2: định nghĩa nơi lưu, và lưu tên mới cho file
        storage: diskStorage({
          destination: process.cwd() + '/public/img',
          filename: (req, files, callback) =>
            callback(null, new Date().getTime() + '_' + files.originalname), // null: tham số báo lỗi
        }),
      },
    ),
  )
  create(
    @Headers('token') token: string,
    @Body() body: SanPhamDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.appService.create(token, body, files);
  }

  @Get('api/danh-sach-san-pham')
  readAll(@Headers('token') token: string) {
    return this.appService.readAll(token);
  }

  @Get('api/chi-tiet-san-pham/:spId')
  readOne(@Headers('token') token: string, @Param('spId') spId: number) {
    return this.appService.readOne(token, +spId);
  }

  @ApiConsumes('multipart/form-data')
  @Put('api/cap-nhat-san-pham/:spId')
  @UseInterceptors(
    FilesInterceptor(
      'hinhAnh',
      5, // Tham số 1: key FE gửi lên
      {
        // Tham số 2: định nghĩa nơi lưu, và lưu tên mới cho file
        storage: diskStorage({
          destination: process.cwd() + '/public/img',
          filename: (req, files, callback) =>
            callback(null, new Date().getTime() + '_' + files.originalname), // null: tham số báo lỗi
        }),
      },
    ),
  )
  update(
    @Headers('token') token: string,
    @Param('spId') spId: number,
    @Body() body: SanPhamDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.appService.update(token, +spId, body, files);
  }

  @Delete('api/xoa-san-pham/:spId')
  delete(@Headers('token') token: string, @Param('spId') spId: number) {
    return this.appService.delete(token, +spId);
  }

  @Post('api/tim-kiem-san-pham')
  search(@Headers('token') token: string, @Body() body: SearchDto) {
    return this.appService.search(token, body);
  }
}

@ApiTags('Doi-Tac')
@Controller()
export class DoiTacController {
  constructor(private readonly appService: DoiTacService) {}

  @Post('api/tao-doi-tac')
  create(@Headers('token') token: string, @Body() body: DoiTacDto) {
    return this.appService.create(token, body);
  }

  @Get('api/danh-sach-npp')
  readAllNpp(@Headers('token') token: string) {
    return this.appService.readAllNpp(token);
  }

  @Get('api/danh-sach-kh')
  readAllKh(@Headers('token') token: string) {
    return this.appService.readAllKh(token);
  }

  @Get('api/chi-tiet-doi-tac/:dtId')
  readOne(@Headers('token') token: string, @Param('dtId') dtId: number) {
    return this.appService.readOne(token, +dtId);
  }

  @Put('api/cap-nhat-doi-tac/:dtId')
  update(
    @Headers('token') token: string,
    @Param('dtId') dtId: number,
    @Body() body: EditDoiTacDto,
  ) {
    return this.appService.update(token, +dtId, body);
  }

  @Delete('api/xoa-doi-tac/:dtId')
  delete(@Headers('token') token: string, @Param('dtId') dtId: number) {
    return this.appService.delete(token, +dtId);
  }

  @Post('api/tim-kiem-npp')
  searchNpp(@Headers('token') token: string, @Body() body: SearchDto) {
    return this.appService.searchNpp(token, body);
  }

  @Post('api/tim-kiem-kh')
  searchKh(@Headers('token') token: string, @Body() body: SearchDto) {
    return this.appService.searchKh(token, body);
  }
}

@ApiTags('Phieu')
@Controller()
export class PhieuController {
  constructor(private readonly appService: PhieuService) {}

  @Post('api/tao-phieu')
  create(@Headers('token') token: string, @Body() body: PhieuDto) {
    return this.appService.create(token, body);
  }

  @Post('api/luu-phieu')
  save(@Headers('token') token: string, @Body() body: SavePhieuDto) {
    return this.appService.save(token, body);
  }

  @Put('api/sua-phieu/:pId')
  update(
    @Headers('token') token: string,
    @Param('pId') pId: number,
    @Body() body: EditPhieuDto,
  ) {
    return this.appService.update(token, +pId, body);
  }

  @Delete('api/xoa-phieu/:pId')
  delete(@Headers('token') token: string, @Param('pId') pId: number) {
    return this.appService.delete(token, +pId);
  }

  @Get('api/phieu-nhap-moi-tao')
  readPhieuNhapMoi(@Headers('token') token: string) {
    return this.appService.readPhieuNhapMoi(token);
  }

  @Get('api/phieu-xuat-moi-tao')
  readPhieuXuatMoi(@Headers('token') token: string) {
    return this.appService.readPhieuXuatMoi(token);
  }

  @Get('api/phieu-nhap-no')
  readPhieuNhapNo(@Headers('token') token: string) {
    return this.appService.readPhieuNhapNo(token);
  }

  @Get('api/phieu-xuat-no')
  readPhieuXuatNo(@Headers('token') token: string) {
    return this.appService.readPhieuXuatNo(token);
  }

  @Post('api/tra-tien')
  traTien(@Headers('token') token: string){
    return this.appService.traTien(token);
  }
  @Post('api/tra-cac-phieu-da-chon')
  traNoCacPhieuDaChon(@Headers('token') token: string){
    return this.appService.traNoCacPhieuDaChon(token);
  }
}

@ApiTags('Chi-Tiet')
@Controller()
export class ChiTietController {
  constructor(private readonly appService: ChiTietService) {}

  @Post('api/them-chi-tiet')
  create(@Headers('token') token: string, @Body() body: ChiTietDto) {
    return this.appService.create(token, body);
  }

  @Get('api/chi-tiet-nhap')
  reallAllChiTietNhap(@Headers('token') token: string) {
    return this.appService.reallAllChiTietNhap(token);
  }

  @Get('api/chi-tiet-xuat')
  reallAllChiTietXuat(@Headers('token') token: string) {
    return this.appService.reallAllChiTietXuat(token);
  }

  @Put('api/cap-nhat-chi-tiet/:ctId')
  update(
    @Headers('token') token: string,
    @Param('ctId') ctId: number,
    @Body() body: EditChiTietDto,
  ) {
    return this.appService.update(token, +ctId, body);
  }

  @Delete('api/xoa-chi-tiet/:ctId')
  delete(@Headers('token') token: string, @Param('ctId') ctId: number) {
    return this.appService.delete(token, +ctId);
  }
}
