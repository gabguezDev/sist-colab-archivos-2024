import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { join } from 'path';
import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  private uploadPath = join(__dirname, '..', 'uploads');

  @Get()
  async getHome(@Res() res) {
    const files = fs.readdirSync(this.uploadPath);
    console.log('uploadPath -->', this.uploadPath);
    res.render('index', { files });
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const fileName = `${Date.now()}-${file.originalname}`;
          cb(null, fileName);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res) {
    res.redirect('/');
  }

  @Post('delete/:filename')
  deleteFileWithPost(@Param('filename') filename: string, @Res() res) {
    try {
      const filePath = join(__dirname, '..', 'uploads', filename);
      fs.unlinkSync(filePath);
      return res
        .status(200)
        .json({ message: 'Archivo eliminado correctamente' });
    } catch (error) {
      return res
        .status(400)
        .json({ message: 'Error al eliminar el archivo', error });
    }
  }

  @Get('view/:filename')
  viewFile(@Param('filename') filename: string, @Res() res) {
    const filePath = join(this.uploadPath, filename);
    res.sendFile(filePath);
  }
}
