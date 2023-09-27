import { ApiProperty } from "@nestjs/swagger"

export class TokenDto {
    @ApiProperty({type: 'number'})
    uId: number
    @ApiProperty({type: 'string'})
    email: string
    @ApiProperty({type: 'string'})
    pass: string
    @ApiProperty({type: 'string'})
    fullName: string
    @ApiProperty({type: 'string'})
    phone: string
    @ApiProperty({type: 'string'})
    company: string
    @ApiProperty({type: 'string'})
    address: string
    @ApiProperty({type: 'string'})
    tax: string
    @ApiProperty({type: 'boolean'})
    sta: boolean

}

export class DangKyDto {
    @ApiProperty({type: 'string'})
    email: string
    @ApiProperty({type: 'string'})
    pass: string
    @ApiProperty({type: 'string'})
    fullName: string
    @ApiProperty({type: 'string'})
    phone: string
    @ApiProperty({type: 'string'})
    company: string
    @ApiProperty({type: 'string'})
    address: string
    @ApiProperty({type: 'string'})
    tax: string
}

export class DangNhapDto {
    @ApiProperty({type: 'string'})
    email: string
    @ApiProperty({type: 'string'})
    pass: string
}

export class SanPhamDto {
    @ApiProperty({type: 'string'})
    danhMuc: string
    @ApiProperty({type: 'string'})
    maSp: string
    @ApiProperty({type: 'string'})
    tenSp: string
    @ApiProperty({type: 'string', required: false})
    dvt: string
    @ApiProperty({type: 'string', required: false})
    chiTiet: string
    @ApiProperty({type: 'number', required: false})
    baoHanh: number
    @ApiProperty({type: 'number'})
    giaNhap: number
    @ApiProperty({type: 'number'})
    giaBan: number
    // @ApiProperty({type: 'string', format: 'binary', required: false})
    @ApiProperty({type: 'array', items: {type: 'string', format: 'binary'}, required: false })
    hinhAnh?: any[]
}

export class DoiTacDto {
    @ApiProperty({type: 'string'})
    maDt: string
    @ApiProperty({type: 'string'})
    tenDt: string
    @ApiProperty({type: 'string'})
    address: string
    @ApiProperty({type: 'string'})
    tax: string
    @ApiProperty({type: 'string'})
    phone: string
    @ApiProperty({type: 'string'})
    lienHe: string
    @ApiProperty({type: 'string'})
    loaiDt: string
}

export class EditDoiTacDto {
    @ApiProperty({type: 'string'})
    maDt: string
    @ApiProperty({type: 'string'})
    tenDt: string
    @ApiProperty({type: 'string'})
    address: string
    @ApiProperty({type: 'string'})
    tax: string
    @ApiProperty({type: 'string'})
    phone: string
    @ApiProperty({type: 'string'})
    lienHe: string
}

export class SearchDto {
    @ApiProperty({type: 'string'})
    keyword: string
}

export class PhieuDto {
    @ApiProperty({type: 'string', format: 'date-time'})
    ngay: Date
    @ApiProperty({type: 'string'})
    loaiPhieu: string
    @ApiProperty({type: 'number'})
    dtId: number
    @ApiProperty({type: 'string'})
    ghiChu: string
}

export class EditPhieuDto {
    @ApiProperty({type: 'string', format: 'date-time'})
    ngay: Date
    @ApiProperty({type: 'number'})
    dtId: number
    @ApiProperty({type: 'number'})
    thanhToan: number
    @ApiProperty({type: 'string'})
    ghiChu: string
}

export class SavePhieuDto {
    @ApiProperty({type: 'number'})
    pId: number
    @ApiProperty({type: 'number'})
    thanhToan: number
}

export class ChiTietDto {
    @ApiProperty({type: 'number'})
    pId: number
    @ApiProperty({type: 'number'})
    spId: number
    @ApiProperty({type: 'string'})
    tenSp: string
    @ApiProperty({type: 'number'})
    soLuong: number
    @ApiProperty({type: 'number'})
    donGia: number
}

export class EditChiTietDto {
    @ApiProperty({type: 'number'})
    spId: number
    @ApiProperty({type: 'string'})
    tenSp: string
    @ApiProperty({type: 'number'})
    soLuong: number
    @ApiProperty({type: 'number'})
    donGia: number
}

