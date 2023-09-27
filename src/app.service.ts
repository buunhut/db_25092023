import { Injectable } from '@nestjs/common';
import { ExtraService } from './app.extra';
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
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import * as moment from 'moment';

const prisma = new PrismaClient();

//bảng user
@Injectable()
export class UserService {
  //kết thừa extraService để dùng
  constructor(
    private readonly extraService: ExtraService,

  ) {}

  async create(body: DangKyDto) {
    try {
      const { email } = body;
      const checkEmail = await prisma.users.findFirst({
        where: {
          email,
          sta: true,
        },
      });
      if (checkEmail) {
        return this.extraService.response(409, 'tài khoản đã tồn tại', email);
      } else {
        // const hashPass = await bcrypt.hash(body.pass, 12);
        const data = {
          ...body,
          // pass: hashPass,
        };
        const create = await prisma.users.create({
          data,
        });
        if (create) {
          const { email, pass, fullName, phone, company, address, tax } =
            create;
          const res = {
            email,
            pass,
            fullName,
            phone,
            company,
            address,
            tax,
          };
          return this.extraService.response(200, 'đăng ký thành công', res);
        } else {
          return this.extraService.response(500, 'lỗi BE', null);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  //viết chức năng đăng nhập
  async read(body: DangNhapDto) {
    try {
      const { email, pass } = body;
      const checkEmail = await prisma.users.findFirst({
        where: {
          email,
          sta: true,
        },
      });
      if (checkEmail) {
        // const checkPass = await bcrypt.compare(pass, checkEmail.pass);
        const checkPass = await prisma.users.findFirst({
          where: {
            email,
            pass,
            sta: true,
          }
        })
        if (checkPass) {
          const token = await this.extraService.signToken(checkEmail);
          const { email, fullName, phone, company, address, tax } = checkEmail;
          const res = {
            email,
            fullName,
            phone,
            company,
            address,
            tax,
            token,
          };
          return this.extraService.response(200, 'đăng nhập thành công', res);
        } else {
          return this.extraService.response(404, 'mật khẩu không đúng', pass)
        }
      } else {
        return this.extraService.response(404, 'tài khoản không đúng', email);
      }
    } catch (error) {
      throw error;
    }
  }
}

//bảng sanPham
@Injectable()
export class SanPhamService {
  //kết thừa extraService để dùng
  constructor(private readonly extraService: ExtraService) {}

  //viết cho chức năng tạo sản phẩm
  async create(token: string, body: SanPhamDto, files: Express.Multer.File[]) {
    try {
      const uId = await this.extraService.getUId(token);
      const { maSp, tenSp, baoHanh, giaNhap, giaBan } = body;
      const hinhAnh = files.map((item) => item.filename);
      const checkMa = await prisma.sanPham.findFirst({
        where: {
          maSp,
          uId,
          sta: true,
        },
      });
      if (checkMa) {
        return this.extraService.response(409, 'mã sản phẩm đã tồn tại', maSp);
      } else {
        const checkTen = await prisma.sanPham.findFirst({
          where: {
            tenSp,
            uId,
            sta: true,
          },
        });
        if (checkTen) {
          return this.extraService.response(
            409,
            'tên sản phẩm đã tồn tại',
            tenSp,
          );
        } else {
          const data = {
            ...body,
            baoHanh: Number(baoHanh),
            hinhAnh,
            uId,
          };
          const create = await prisma.sanPham.create({
            data,
          });
          if (create) {
            const {
              danhMuc,
              maSp,
              tenSp,
              dvt,
              chiTiet,
              baoHanh,
              tonKho,
              giaNhap,
              giaBan,
              hinhAnh,
            } = create;
            const res = {
              danhMuc,
              maSp,
              tenSp,
              dvt,
              chiTiet,
              baoHanh: Number(baoHanh),
              tonKho: Number(tonKho),
              giaNhap: Number(giaNhap),
              giaBan: Number(giaBan),
              hinhAnh,
            };
            return this.extraService.response(
              200,
              'tạo sản phẩm thành công',
              res,
            );
          } else {
            return this.extraService.response(500, 'lỗi BE', null);
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }
  //viết chức năng get tất cả sản phẩm
  async readAll(token: string) {
    try {
      const uId = await this.extraService.getUId(token);
      const sanPham = await prisma.sanPham.findMany({
        where: {
          uId,
          sta: true,
        },
      });
      if (sanPham.length > 0) {
        const res = sanPham.map((item) => {
          const {
            spId,
            danhMuc,
            maSp,
            tenSp,
            dvt,
            chiTiet,
            baoHanh,
            tonKho,
            giaNhap,
            giaBan,
            hinhAnh,
          } = item;
          return {
            spId,
            danhMuc,
            maSp,
            tenSp,
            dvt,
            chiTiet,
            baoHanh,
            tonKho,
            giaNhap: Number(giaNhap),
            giaBan: Number(giaBan),
            hinhAnh,
          };
        });
        return this.extraService.response(200, 'danh sách sản phẩm', res);
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }
  //viết chức năng get chi tiết 1 sản phẩm
  async readOne(token: string, spId: number) {
    try {
      const uId = await this.extraService.getUId(token);
      const detail = await prisma.sanPham.findFirst({
        where: {
          spId,
          uId,
          sta: true,
        },
      });
      if (detail) {
        const {
          spId,
          danhMuc,
          maSp,
          tenSp,
          dvt,
          chiTiet,
          baoHanh,
          tonKho,
          giaNhap,
          giaBan,
          hinhAnh,
        } = detail;
        const res = {
          spId,
          danhMuc,
          maSp,
          tenSp,
          dvt,
          chiTiet,
          baoHanh: Number(baoHanh),
          tonKho: Number(tonKho),
          giaNhap: Number(giaNhap),
          giaBan: Number(giaBan),
          hinhAnh,
        };
        return this.extraService.response(200, 'chi tiết sản phẩm', res);
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }
  //viết chức năng sửa sản phẩm
  async update(
    token: string,
    spId: number,
    body: SanPhamDto,
    files: Express.Multer.File[],
  ) {
    try {
      const uId = await this.extraService.getUId(token);
      const { danhMuc, maSp, tenSp, dvt, chiTiet, baoHanh, giaNhap, giaBan } =
        body;

      const checkMa = await prisma.sanPham.findFirst({
        where: {
          maSp,
          uId,
          sta: true,
          NOT: {
            spId,
          },
        },
      });
      if (checkMa) {
        return this.extraService.response(409, 'mã sản phẩm đã tồn tại', maSp);
      } else {
        const checkTen = await prisma.sanPham.findFirst({
          where: {
            tenSp,
            uId,
            sta: true,
            NOT: {
              spId,
            },
          },
        });
        if (checkTen) {
          return this.extraService.response(
            409,
            'tên sản phẩm đã tồn tại',
            tenSp,
          );
        } else {
          if (files.length > 0) {
            const hinhAnh = files.map((item) => item.filename);
            const update = await prisma.sanPham.updateMany({
              data: {
                danhMuc,
                maSp,
                tenSp,
                dvt,
                chiTiet,
                baoHanh: Number(baoHanh),
                giaNhap,
                giaBan,
                hinhAnh,
              },
              where: {
                spId,
                uId,
                sta: true,
              },
            });
            if (update) {
              const res = {
                danhMuc,
                maSp,
                tenSp,
                dvt,
                chiTiet,
                baoHanh: Number(baoHanh),
                giaNhap: Number(giaNhap),
                giaBan: Number(giaBan),
                hinhAnh,
              };
              return this.extraService.response(
                200,
                'đã cập nhật sản phẩm',
                res,
              );
            } else {
              return this.extraService.response(500, 'lỗi BE', null);
            }
          } else {
            const update = await prisma.sanPham.updateMany({
              data: {
                danhMuc,
                maSp,
                tenSp,
                dvt,
                chiTiet,
                baoHanh: Number(baoHanh),
                giaNhap,
                giaBan,
              },
              where: {
                spId,
                uId,
                sta: true,
              },
            });
            if (update) {
              const res = {
                danhMuc,
                maSp,
                tenSp,
                dvt,
                chiTiet,
                baoHanh: Number(baoHanh),
                giaNhap: Number(giaNhap),
                giaBan: Number(giaBan),
              };
              return this.extraService.response(
                200,
                'đã cập nhật sản phẩm',
                res,
              );
            } else {
              return this.extraService.response(500, 'lỗi BE', null);
            }
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }
  //viết chức năng xoá sản phẩm
  async delete(token: string, spId: number) {
    try {
      const uId = await this.extraService.getUId(token);
      const check = await prisma.sanPham.findFirst({
        where: {
          spId,
          uId,
          sta: true,
        },
      });
      if (check) {
        //xoá
        const xoa = await prisma.sanPham.updateMany({
          data: {
            sta: false,
          },
          where: {
            spId,
            uId,
            sta: true,
          },
        });
        if (xoa) {
          const {
            spId,
            danhMuc,
            maSp,
            tenSp,
            dvt,
            chiTiet,
            baoHanh,
            tonKho,
            giaNhap,
            giaBan,
            hinhAnh,
          } = check;
          const res = {
            spId,
            danhMuc,
            maSp,
            tenSp,
            dvt,
            chiTiet,
            baoHanh: Number(baoHanh),
            tonKho: Number(tonKho),
            giaNhap: Number(giaNhap),
            giaBan: Number(giaBan),
            hinhAnh,
          };
          return this.extraService.response(200, 'đã xoá sản phẩm', res);
        } else {
          return this.extraService.response(500, 'lỗi BE', null);
        }
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }
  //viết chức năng tìm kiếm sản phẩm
  async search(token: string, body: SearchDto) {
    try {
      const uId = await this.extraService.getUId(token);
      const { keyword } = body;
      const result = await prisma.sanPham.findMany({
        where: {
          uId,
          sta: true,
          OR: [
            {
              danhMuc: {
                contains: keyword,
              },
            },
            {
              maSp: {
                contains: keyword,
              },
            },
            {
              tenSp: {
                contains: keyword,
              },
            },
          ],
        },
      });
      if (result.length > 0) {
        const res = result.map((item) => {
          const {
            spId,
            danhMuc,
            maSp,
            tenSp,
            dvt,
            chiTiet,
            baoHanh,
            tonKho,
            giaNhap,
            giaBan,
            hinhAnh,
          } = item;
          return {
            spId,
            danhMuc,
            maSp,
            tenSp,
            dvt,
            chiTiet,
            baoHanh: Number(baoHanh),
            tonKho: Number(tonKho),
            giaNhap: Number(giaNhap),
            giaBan: Number(giaBan),
            hinhAnh,
          };
        });
        return this.extraService.response(200, 'kết quả tìm kiếm', res);
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }
}

//bảng doiTac
@Injectable()
export class DoiTacService {
  //kết thừa extraService để dùng
  constructor(private readonly extraService: ExtraService) {}

  //viết cho chức năng tạo đối tác
  async create(token: string, body: DoiTacDto) {
    try {
      const uId = await this.extraService.getUId(token);
      const { maDt, tenDt, loaiDt } = body;
      const checkMa = await prisma.doiTac.findFirst({
        where: {
          maDt,
          uId,
          loaiDt,
          sta: true,
        },
      });
      if (checkMa) {
        return this.extraService.response(409, 'mã đối tác đã tồn tại', maDt);
      } else {
        const checkTen = await prisma.doiTac.findFirst({
          where: {
            tenDt,
            uId,
            loaiDt,
            sta: true,
          },
        });
        if (checkTen) {
          return this.extraService.response(
            409,
            'tên đối tác đã tồn tại',
            tenDt,
          );
        } else {
          const data = {
            ...body,
            uId,
          };
          const create = await prisma.doiTac.create({
            data,
          });
          if (create) {
            const { maDt, tenDt, address, tax, phone, lienHe } = create;
            const res = {
              maDt,
              tenDt,
              address,
              tax,
              phone,
              lienHe,
            };
            return this.extraService.response(
              200,
              'tạo đối tác thành công',
              res,
            );
          } else {
            return this.extraService.response(500, 'lỗi BE', null);
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }
  //viết chức năng get tất cả npp
  async readAllNpp(token: string) {
    try {
      const uId = await this.extraService.getUId(token);
      const list = await prisma.doiTac.findMany({
        where: {
          loaiDt: 'npp',
          uId,
          sta: true,
        },
        select: {
          dtId: true,
          maDt: true,
          tenDt: true,
          address: true,
          tax: true,
          phone: true,
          lienHe: true,
        },
      });
      if (list.length > 0) {
        return this.extraService.response(200, 'danh sách npp', list);
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }
  //viết chức năng get tất cả kh
  async readAllKh(token: string) {
    try {
      const uId = await this.extraService.getUId(token);
      const list = await prisma.doiTac.findMany({
        where: {
          loaiDt: 'kh',
          uId,
          sta: true,
        },
        select: {
          dtId: true,
          maDt: true,
          tenDt: true,
          address: true,
          tax: true,
          phone: true,
          lienHe: true,
        },
      });
      if (list.length > 0) {
        return this.extraService.response(200, 'danh sách npp', list);
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }
  //viết chức năng get chi tiết 1 đối tác
  async readOne(token: string, dtId: number) {
    try {
      const uId = await this.extraService.getUId(token);
      const detail = await prisma.doiTac.findFirst({
        where: {
          dtId,
          uId,
          sta: true,
        },
        select: {
          dtId: true,
          maDt: true,
          tenDt: true,
          address: true,
          tax: true,
          phone: true,
          lienHe: true,
          loaiDt: true,
        },
      });
      if (detail) {
        return this.extraService.response(200, 'chi tiết đối tác', detail);
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }
  //viết chức năng sửa đối tác
  async update(token: string, dtId: number, body: EditDoiTacDto) {
    try {
      const uId = await this.extraService.getUId(token);
      const { maDt, tenDt, address, tax, phone, lienHe } = body;
      const check = await prisma.doiTac.findFirst({
        where: {
          dtId,
          uId,
          sta: true,
        },
      });
      if (check) {
        const { loaiDt } = check;
        const checkMa = await prisma.doiTac.findFirst({
          where: {
            maDt,
            loaiDt,
            uId,
            sta: true,
            NOT: {
              dtId,
            },
          },
        });
        if (checkMa) {
          return this.extraService.response(409, 'mã đối tác đã tồn tại', maDt);
        } else {
          const checkTen = await prisma.doiTac.findFirst({
            where: {
              tenDt,
              loaiDt,
              uId,
              sta: true,
              NOT: {
                dtId,
              },
            },
          });
          if (checkTen) {
            return this.extraService.response(
              409,
              'tên đối tác đã tồn tại',
              tenDt,
            );
          } else {
            const update = await prisma.doiTac.updateMany({
              data: {
                maDt,
                tenDt,
                address,
                tax,
                phone,
                lienHe,
              },
              where: {
                dtId,
                sta: true,
              },
            });
            if (update) {
              return this.extraService.response(
                200,
                'đã cập nhật đối tác',
                body,
              );
            } else {
              return this.extraService.response(500, 'lỗi BE', null);
            }
          }
        }
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }
  //viết chức năng xoá đối tác
  async delete(token: string, dtId: number) {
    try {
      const uId = await this.extraService.getUId(token);
      const check = await prisma.doiTac.findFirst({
        where: {
          dtId,
          uId,
          sta: true,
        },
      });
      if (check) {
        //xoá
        const xoa = await prisma.doiTac.updateMany({
          data: {
            sta: false,
          },
          where: {
            dtId,
          },
        });
        if (xoa) {
          return this.extraService.response(200, 'đã xoá đối tác', check.tenDt);
        } else {
          return this.extraService.response(500, 'lỗi BE', null);
        }
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }
  //viết chức năng tìm kiếm Npp
  async searchNpp(token: string, body: SearchDto) {
    try {
      const uId = await this.extraService.getUId(token);
      const { keyword } = body;
      const result = await prisma.doiTac.findMany({
        where: {
          uId,
          loaiDt: 'npp',
          sta: true,
          OR: [
            {
              maDt: {
                contains: keyword,
              },
            },
            {
              tenDt: {
                contains: keyword,
              },
            },
            {
              lienHe: {
                contains: keyword,
              },
            },
            {
              phone: {
                contains: keyword,
              },
            },
          ],
        },
      });
      if (result.length > 0) {
        const res = result.map((item) => {
          const { dtId, maDt, tenDt, address, tax, phone, lienHe } = item;
          return {
            dtId,
            maDt,
            tenDt,
            address,
            tax,
            phone,
            lienHe,
          };
        });
        return this.extraService.response(200, 'kết quả tìm kiếm', res);
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }
  //viết chức năng tìm kiếm Kh
  async searchKh(token: string, body: SearchDto) {
    try {
      const uId = await this.extraService.getUId(token);
      const { keyword } = body;
      const result = await prisma.doiTac.findMany({
        where: {
          uId,
          loaiDt: 'kh',
          sta: true,
          OR: [
            {
              maDt: {
                contains: keyword,
              },
            },
            {
              tenDt: {
                contains: keyword,
              },
            },
            {
              lienHe: {
                contains: keyword,
              },
            },
            {
              phone: {
                contains: keyword,
              },
            },
          ],
        },
      });
      if (result.length > 0) {
        const res = result.map((item) => {
          const { dtId, maDt, tenDt, address, tax, phone, lienHe } = item;
          return {
            dtId,
            maDt,
            tenDt,
            address,
            tax,
            phone,
            lienHe,
          };
        });
        return this.extraService.response(200, 'kết quả tìm kiếm', res);
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }
}

//bảng phieu
@Injectable()
export class PhieuService {
  //kết thừa extraService để dùng
  constructor(private readonly extraService: ExtraService) {}

  //viết cho chức năng tạo phiếu mới
  async create(token: string, body: PhieuDto) {
    try {
      const uId = await this.extraService.getUId(token);
      const { loaiPhieu } = body;
      //đi tìm số phiếu
      const count = await prisma.phieu.count({
        where: {
          loaiPhieu,
          uId,
        },
      });
      const data = {
        ...body,
        soPhieu: count + 1,
        uId,
      };
      const create = await prisma.phieu.create({
        data,
      });
      if (create) {
        const { pId, ngay, loaiPhieu, soPhieu, ghiChu } = create;
        const res = {
          pId,
          ngay: moment(ngay).format('DD/MM/YYYY'),
          loaiPhieu,
          soPhieu,
          ghiChu,
        };
        return this.extraService.response(200, 'đã tạo phiếu', res);
      } else {
        return this.extraService.response(500, 'lỗi BE', null);
      }
    } catch (error) {
      throw error;
    }
  }

  //viết cho chức năng tạo phiếu mới
  async save(token: string, body: SavePhieuDto) {
    try {
      const uId = await this.extraService.getUId(token);
      const { pId, thanhToan } = body;
      const check = await prisma.phieu.findFirst({
        where: {
          pId,
          uId,
          sta: 'mới tạo',
        },
      });
      if (check) {
        const conNo = Number(check.tongTien) - thanhToan;

        // Lấy thông tin từ bảng bangChiTiet
        const getInfo = await prisma.bangChiTiet.findMany({
          select: {
            spId: true,
            soLuong: true,
          },
          where: {
            pId,
            uId,
            sta: 'mới tạo',
          },
        });

        // Cộng số lượng sản phẩm vào kho hoặc trừ tùy theo loại phiếu
        for (const item of getInfo) {
          const { spId, soLuong } = item;
          if (check.loaiPhieu === 'pn') {
            // Cộng số lượng sản phẩm vào kho
            await prisma.sanPham.updateMany({
              data: {
                tonKho: {
                  increment: soLuong,
                },
              },
              where: {
                spId,
              },
            });
          } else {
            // Trừ số lượng sản phẩm
            await prisma.sanPham.updateMany({
              data: {
                tonKho: {
                  decrement: soLuong,
                },
              },
              where: {
                spId,
              },
            });
          }
        }
        //cập nhật chi tiết
        await prisma.bangChiTiet.updateMany({
          data: {
            sta: 'lưu',
          },
          where: {
            pId,
            uId,
            sta: 'mới tạo',
          },
        });

        // Cập nhật phiếu
        await prisma.phieu.updateMany({
          data: {
            thanhToan,
            conNo,
            sta: 'lưu',
          },
          where: {
            pId,
            uId,
            sta: 'mới tạo',
          },
        });

        return this.extraService.response(200, 'đã lưu phiếu', check.soPhieu);
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }

  //viết chức năng sửa phiếu
  async update(token: string, pId: number, body: EditPhieuDto) {
    try {
      const uId = await this.extraService.getUId(token);
      const { ngay, dtId, thanhToan, ghiChu } = body;
      const check = await prisma.phieu.findFirst({
        where: {
          pId,
          uId,
          sta: {
            not: 'xoá',
          },
        },
      });
      const conNo = Number(check.tongTien) - thanhToan;
      if (check) {
        await prisma.phieu.updateMany({
          data: {
            ngay,
            dtId,
            thanhToan,
            conNo,
            ghiChu,
          },
          where: {
            pId,
            uId,
          },
        });
        const res = {
          ngay,
          dtId,
          thanhToan,
          conNo,
          ghiChu,
        };
        return this.extraService.response(200, 'đã cập nhật', res);
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }

  //viết chức năng xoá phiếu
  async delete(token: string, pId: number) {
    try {
      const uId = await this.extraService.getUId(token);
      const check = await prisma.phieu.findFirst({
        where: {
          pId,
          uId,
          sta: {
            not: 'xoá',
          },
        },
      });
      const getInfo = await prisma.bangChiTiet.findMany({
        select: {
          spId: true,
          soLuong: true,
        },
        where: {
          pId,
          uId,
          sta: {
            not: 'xoá',
          },
        },
      });
      if (check) {
        if (check.sta === 'mới tạo') {
          //xử lý phiếu mới tạo
          await prisma.bangChiTiet.updateMany({
            data: {
              sta: 'xoá',
            },
            where: {
              pId,
              uId,
              sta: 'mới tạo',
            },
          });
          await prisma.phieu.updateMany({
            data: {
              sta: 'xoá',
            },
            where: {
              pId,
              uId,
              sta: 'mới tạo',
            },
          });
        } else if (check.sta === 'lưu') {
          for (const item of getInfo) {
            const { spId, soLuong } = item;
            if (check.loaiPhieu === 'pn') {
              await prisma.sanPham.updateMany({
                data: {
                  tonKho: {
                    decrement: soLuong, //trừ kho
                  },
                },
                where: {
                  spId,
                },
              });
            } else {
              await prisma.sanPham.updateMany({
                data: {
                  tonKho: {
                    increment: soLuong, //cộng kho
                  },
                },
                where: {
                  spId,
                },
              });
            }
          }
          //xoá chi tiết
          await prisma.bangChiTiet.updateMany({
            data: {
              sta: 'xoá',
            },
            where: {
              pId,
              uId,
              sta: 'lưu',
            },
          });

          //xoá phiếu
          await prisma.phieu.updateMany({
            data: {
              sta: 'xoá',
            },
            where: {
              pId,
              uId,
              sta: 'lưu',
            },
          });
        }
        return this.extraService.response(200, 'đã xoá phiếu', check.soPhieu);
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }

  //viết chức năng get tất cả phiếu nhập mới tạo
  async readPhieuNhapMoi(token: string) {
    try {
      const uId = await this.extraService.getUId(token);
      const phieuMoi = await prisma.phieu.findMany({
        where: {
          loaiPhieu: 'pn',
          uId,
          sta: 'mới tạo',
          doiTac: {
            uId,
            sta: true,
          },
        },
        select: {
          pId: true,
          ngay: true,
          loaiPhieu: true,
          soPhieu: true,
          ghiChu: true,
          tongTien: true,
          thanhToan: true,
          conNo: true,
          doiTac: {
            select: {
              tenDt: true,
              address: true,
              tax: true,
              phone: true,
              lienHe: true,
            },
          },
          bangChiTiet: {
            where: {
              uId,
              sta: 'mới tạo',
            },
            select: {
              ctId: true,
              tenSp: true,
              soLuong: true,
              donGia: true,
              thanhTien: true,
              sanPham: {
                select: {
                  dvt: true,
                },
              },
            },
          },
        },
      });
      if (phieuMoi.length > 0) {
        const res = phieuMoi.map((item) => {
          const {
            pId,
            ngay,
            loaiPhieu,
            soPhieu,
            ghiChu,
            tongTien,
            thanhToan,
            conNo,
          } = item;
          const { tenDt, address, tax, phone, lienHe } = item.doiTac;
          const mapChiTiet = item.bangChiTiet.map((item) => {
            const { ctId, tenSp, soLuong, donGia, thanhTien } = item;
            const { dvt } = item.sanPham;
            return {
              ctId,
              tenSp,
              dvt,
              soLuong: Number(soLuong),
              donGia: Number(donGia),
              thanhTien: Number(thanhTien),
            };
          });
          return {
            pId,
            ngay: moment(ngay).format('DD/MM/YYYY'),
            loaiPhieu,
            soPhieu,
            ghiChu,
            tenDt,
            address,
            tax,
            phone,
            lienHe,
            chiTiet: mapChiTiet,
            tongTien: Number(tongTien),
            thanhToan: Number(thanhToan),
            conNo: Number(conNo),
          };
        });
        return this.extraService.response(200, 'phiếu nhập mới tạo', res);
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }

  //viết chức năng get tất cả phiếu xuất mới tạo
  async readPhieuXuatMoi(token: string) {
    try {
      const uId = await this.extraService.getUId(token);
      const phieuMoi = await prisma.phieu.findMany({
        where: {
          loaiPhieu: 'px',
          uId,
          sta: 'mới tạo',
          doiTac: {
            uId,
            sta: true,
          },
        },
        select: {
          pId: true,
          ngay: true,
          loaiPhieu: true,
          soPhieu: true,
          tongTien: true,
          thanhToan: true,
          conNo: true,
          doiTac: {
            select: {
              tenDt: true,
              address: true,
              tax: true,
              phone: true,
              lienHe: true,
            },
          },
          bangChiTiet: {
            where: {
              uId,
              sta: 'mới tạo',
            },
            select: {
              ctId: true,
              tenSp: true,
              soLuong: true,
              donGia: true,
              thanhTien: true,
            },
          },
        },
      });
      if (phieuMoi.length > 0) {
        return this.extraService.response(200, 'phiếu nhập mới tạo', phieuMoi);
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }

  //viết chức năng get tất cả phiếu nhập nợ
  async readPhieuNhapNo(token: string) {
    try {
      const uId = await this.extraService.getUId(token);
      const phieuNo = await prisma.phieu.findMany({
        where: {
          loaiPhieu: 'pn',
          uId,
          sta: 'lưu',
          conNo: {
            gt: 0,
          },
        },
        select: {
          doiTac: {
            select: {
              maDt: true,
              tenDt: true,
            },
          },
          pId: true,
          ngay: true,
          loaiPhieu: true,
          soPhieu: true,
          tongTien: true,
          thanhToan: true,
          conNo: true,
          ghiChu: true,
        },
      });
      if (phieuNo.length > 0) {
        const res = phieuNo.map((item) => {
          const {
            pId,
            ngay,
            loaiPhieu,
            soPhieu,
            tongTien,
            thanhToan,
            conNo,
            ghiChu,
            doiTac,
          } = item;
          const { maDt, tenDt } = doiTac;
          return {
            pId,
            ngay: moment(ngay).format('DD/MM/YYYY'),
            loaiPhieu,
            soPhieu,
            maDt,
            tenDt,
            tongTien: Number(tongTien),
            thanhToan: Number(thanhToan),
            conNo: Number(conNo),
            ghiChu,
          };
        });
        return this.extraService.response(200, 'danh sách phiếu nhập nợ', res);
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }

  //viết chức năng get tất cả phiếu xuất nợ
  async readPhieuXuatNo(token: string) {
    try {
      const uId = await this.extraService.getUId(token);
      const phieuNo = await prisma.phieu.findMany({
        where: {
          loaiPhieu: 'px',
          sta: 'lưu',
          conNo: {
            gt: 0,
          },
        },
      });
      if (phieuNo.length > 0) {
        return this.extraService.response(
          200,
          'danh sách phiếu xuất nợ',
          phieuNo,
        );
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }
}

//bảng chiTiet
@Injectable()
export class ChiTietService {
  //kết thừa extraService để dùng
  constructor(private readonly extraService: ExtraService) {}

  //viết chức năng tạo chi tiết
  async create(token: string, body: ChiTietDto) {
    try {
      const uId = await this.extraService.getUId(token);
      const { pId, spId, soLuong, donGia } = body;
      const thanhTien = soLuong * donGia;

      //cộng tiền vào phiếu
      const update = await prisma.phieu.update({
        data: {
          tongTien: {
            increment: thanhTien, // Tăng tổng tiền
          },
          conNo: {
            increment: thanhTien, // Tăng còn nợ
          },
        },
        where: {
          pId,
          uId,
        },
      });

      //check sản phẩm + giá có chưa
      const check = await prisma.bangChiTiet.findFirst({
        where: {
          spId,
          donGia,
          pId,
          uId,
          sta: 'mới tạo',
        },
      });

      if (check) {
        //cộng dồn
        const data = {
          ...body,
          soLuong: soLuong + check.soLuong,
          thanhTien: thanhTien + Number(check.thanhTien),
          uId,
        };
        const update = await prisma.bangChiTiet.updateMany({
          data,
          where: {
            spId,
            donGia,
            pId,
            uId,
            sta: 'mới tạo',
          },
        });
        if (update) {
          const res = {
            ...body,
            thanhTien,
          };
          return this.extraService.response(200, 'đã thêm chi tiết', res);
        } else {
          return this.extraService.response(500, 'lỗi BE', null);
        }
      } else {
        const data = {
          ...body,
          soLuong,
          thanhTien,
          uId,
        };
        const create = await prisma.bangChiTiet.create({
          data,
        });
        if (create) {
          const { pId, spId, tenSp, soLuong, donGia, thanhTien } = create;
          const res = {
            pId,
            spId,
            tenSp,
            soLuong,
            donGia: Number(donGia),
            thanhTien: Number(thanhTien),
          };
          return this.extraService.response(200, 'đã thêm chi tiết', res);
        } else {
          return this.extraService.response(500, 'lỗi BE', null);
        }
      }
    } catch (error) {
      throw error;
    }
  }
  //viết chưcs năng get all chi tiết nhập
  async reallAllChiTietNhap(token: string) {
    try {
      const uId = await this.extraService.getUId(token);
      const detail = await prisma.bangChiTiet.findMany({
        where: {
          sta: 'lưu',
          uId,
          phieu: {
            loaiPhieu: 'pn',
          },
        },
        orderBy: {
          phieu: {
            soPhieu: 'desc', // Sắp xếp theo cột soPhieu giảm dần
          },
        },
        select: {
          ctId: true,
          spId: true,
          tenSp: true,
          soLuong: true,
          donGia: true,
          thanhTien: true,
          phieu: {
            select: {
              ngay: true,
              loaiPhieu: true,
              soPhieu: true,
              doiTac: {
                select: {
                  maDt: true,
                  tenDt: true,
                },
              },
            },
          },
          sanPham: {
            select: {
              dvt: true,
            },
          },
        },
      });
      if (detail.length > 0) {
        const res = detail.map((item) => {
          const { ctId, tenSp, soLuong, donGia, thanhTien, phieu, sanPham } =
            item;
          const { ngay, loaiPhieu, soPhieu, doiTac } = phieu;
          const { maDt, tenDt } = doiTac;
          const { dvt } = sanPham;
          return {
            ctId,
            ngay: moment(ngay).format('DD/MM/YYYY'),
            loaiPhieu,
            soPhieu: Number(soPhieu),
            maDt,
            tenDt,
            tenSp,
            dvt,
            soLuong: Number(soLuong),
            donGia: Number(donGia),
            thanhTien: Number(thanhTien),
          };
        });
        return this.extraService.response(200, 'chi tiết nhập', res);
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }
  //viết chưcs năng get all chi tiết xuất
  async reallAllChiTietXuat(token: string) {
    try {
      const uId = await this.extraService.getUId(token);
      const detail = await prisma.bangChiTiet.findMany({
        where: {
          sta: 'lưu',
          uId,
          phieu: {
            loaiPhieu: 'px',
          },
        },
        orderBy: {
          phieu: {
            soPhieu: 'desc', // Sắp xếp theo cột soPhieu giảm dần
          },
        },
        select: {
          ctId: true,
          spId: true,
          tenSp: true,
          soLuong: true,
          donGia: true,
          thanhTien: true,
          phieu: {
            select: {
              ngay: true,
              loaiPhieu: true,
              soPhieu: true,
              doiTac: {
                select: {
                  maDt: true,
                  tenDt: true,
                },
              },
            },
          },
          sanPham: {
            select: {
              dvt: true,
            },
          },
        },
      });
      if (detail.length > 0) {
        const res = detail.map((item) => {
          const { ctId, tenSp, soLuong, donGia, thanhTien, phieu, sanPham } =
            item;
          const { ngay, loaiPhieu, soPhieu, doiTac } = phieu;
          const { maDt, tenDt } = doiTac;
          const { dvt } = sanPham;
          return {
            ctId,
            ngay: moment(ngay).format('DD/MM/YYYY'),
            loaiPhieu,
            soPhieu: Number(soPhieu),
            maDt,
            tenDt,
            tenSp,
            dvt,
            soLuong: Number(soLuong),
            donGia: Number(donGia),
            thanhTien: Number(thanhTien),
          };
        });
        return this.extraService.response(200, 'chi tiết nhập', res);
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }
  //viết chức năng sửa chi tiết
  async update(token: string, ctId: number, body: EditChiTietDto) {
    try {
      const uId = await this.extraService.getUId(token);
      const check = await prisma.bangChiTiet.findFirst({
        where: {
          ctId,
          uId,
          sta: {
            not: 'xoá',
          },
        },
        select: {
          phieu: {
            select: {
              pId: true,
              loaiPhieu: true,
              tongTien: true,
              thanhToan: true,
              conNo: true,
            },
          },
          spId: true,
          soLuong: true,
          thanhTien: true,
          sta: true,
        },
      });
      if (check) {
        const { spId, soLuong, donGia } = body;
        const thanhTien = soLuong * donGia;

        //tính lại tổng tiền, thanh toán và còn nợ
        const tongTien =
          Number(check.phieu.tongTien) - Number(check.thanhTien) + thanhTien;
        const thanhToan = Number(check.phieu.thanhToan);
        const conNo = tongTien - thanhToan;
        await prisma.phieu.updateMany({
          data: {
            tongTien,
            thanhToan,
            conNo,
          },
          where: {
            pId: check.phieu.pId,
          },
        });
        //phiếu đã lưu
        if (check.phieu.loaiPhieu === 'pn') {
          //phiếu nhập
          //trừ bỏ kho
          await prisma.sanPham.updateMany({
            data: {
              tonKho: {
                decrement: check.soLuong,
              },
            },
            where: {
              spId: check.spId,
              uId,
              sta: true,
            },
          });
          //cộng kho sản phẩm mới sửa
          await prisma.sanPham.updateMany({
            data: {
              tonKho: {
                increment: soLuong,
              },
            },
            where: {
              spId: spId,
              uId,
              sta: true,
            },
          });
        } else {
          //phiếu xuất
          //cộng lại kho
          await prisma.sanPham.updateMany({
            data: {
              tonKho: {
                increment: check.soLuong,
              },
            },
            where: {
              spId: check.spId,
              uId,
              sta: true,
            },
          });
          //trừ kho sản phẩm mới sửa
          await prisma.sanPham.updateMany({
            data: {
              tonKho: {
                decrement: soLuong,
              },
            },
            where: {
              spId: spId,
              uId,
              sta: true,
            },
          });
        }
        //cập nhật chi tiết
        const data = {
          ...body,
          thanhTien,
        };
        const update = await prisma.bangChiTiet.updateMany({
          data,
          where: {
            ctId,
            uId,
            sta: {
              not: 'xoá',
            },
          },
        });
        if (update) {
          const res = {
            ...body,
          };
          return this.extraService.response(200, 'đã cập nhât', res);
        } else {
          return this.extraService.response(500, 'lỗi BE', null);
        }
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }
  //viết chức năng xoá chi tiết
  async delete(token: string, ctId: number) {
    try {
      const uId = await this.extraService.getUId(token);
      const check = await prisma.bangChiTiet.findFirst({
        where: {
          ctId,
          uId,
          sta: {
            not: 'xoá',
          },
        },
        select: {
          phieu: {
            select: {
              pId: true,
              loaiPhieu: true,
              tongTien: true,
              thanhToan: true,
              conNo: true,
            },
          },
          spId: true,
          soLuong: true,
          thanhTien: true,
          sta: true,
        },
      });
      if (check) {
        //tính lại tổng tiền, thanh toán và còn nợ
        const tongTien = Number(check.phieu.tongTien) - Number(check.thanhTien);
        const thanhToan = Number(check.phieu.thanhToan);
        const conNo = tongTien - thanhToan;
        await prisma.phieu.updateMany({
          data: {
            tongTien,
            thanhToan,
            conNo,
          },
          where: {
            pId: check.phieu.pId,
          },
        });

        //phiếu đã lưu
        if (check.sta === 'lưu') {
          if (check.phieu.loaiPhieu === 'pn') {
            //phiếu nhập
            //trừ bỏ kho
            await prisma.sanPham.updateMany({
              data: {
                tonKho: {
                  decrement: check.soLuong,
                },
              },
              where: {
                spId: check.spId,
                uId,
                sta: true,
              },
            });
          } else {
            //phiếu xuất
            //cộng lại kho
            await prisma.sanPham.updateMany({
              data: {
                tonKho: {
                  increment: check.soLuong,
                },
              },
              where: {
                spId: check.spId,
                uId,
                sta: true,
              },
            });
          }
        }
        //cập nhật chi tiết
        const update = await prisma.bangChiTiet.updateMany({
          data: {
            sta: 'xoá',
          },
          where: {
            ctId,
            uId,
            sta: {
              not: 'xoá',
            },
          },
        });
        if (update) {
          return this.extraService.response(200, 'đã xoá chi tiết', ctId);
        } else {
          return this.extraService.response(500, 'lỗi BE', null);
        }
      } else {
        return this.extraService.response(404, 'not found', null);
      }
    } catch (error) {
      throw error;
    }
  }
}
