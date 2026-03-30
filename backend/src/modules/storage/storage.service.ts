import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { extname } from 'path';
import { mkdirSync, writeFileSync, unlinkSync, existsSync } from 'fs';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3: S3Client | null = null;
  private bucket: string;
  private region: string;
  private useS3: boolean;

  constructor(private readonly config: ConfigService) {
    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');
    this.bucket = this.config.get<string>('AWS_BUCKET_NAME', 'lensia-files');
    this.region = this.config.get<string>('AWS_REGION', 'us-east-1');

    if (accessKeyId && secretAccessKey) {
      this.s3 = new S3Client({
        region: this.region,
        credentials: { accessKeyId, secretAccessKey },
      });
      this.useS3 = true;
      this.logger.log('S3 storage enabled');
    } else {
      this.useS3 = false;
      this.logger.log('S3 credentials not set — using local disk storage');
    }
  }

  /**
   * Upload a file and return the public URL.
   * @param folder  Sub-folder name (e.g. 'catalog', 'prescriptions', 'disputes')
   * @param file    Multer file object (buffer or path)
   * @param originalName  Original filename for extension detection
   */
  async upload(
    folder: string,
    fileBuffer: Buffer,
    originalName: string,
  ): Promise<string> {
    const ext = extname(originalName);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    const key = `${folder}/${uniqueName}`;

    if (this.useS3 && this.s3) {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: fileBuffer,
          ContentType: this.getMimeType(ext),
        }),
      );
      const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
      this.logger.log(`Uploaded to S3: ${url}`);
      return url;
    }

    // Local fallback
    const dir = `./uploads/${folder}`;
    mkdirSync(dir, { recursive: true });
    const localPath = `${dir}/${uniqueName}`;
    writeFileSync(localPath, fileBuffer);
    const url = `/uploads/${folder}/${uniqueName}`;
    this.logger.log(`Saved locally: ${url}`);
    return url;
  }

  /**
   * Delete a file by its URL (works for both S3 and local).
   */
  async delete(fileUrl: string): Promise<void> {
    try {
      if (this.useS3 && this.s3 && fileUrl.includes('.amazonaws.com/')) {
        const key = fileUrl.split('.amazonaws.com/')[1];
        if (key) {
          await this.s3.send(
            new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
          );
          this.logger.log(`Deleted from S3: ${key}`);
        }
      } else if (fileUrl.startsWith('/uploads/')) {
        const localPath = `.${fileUrl}`;
        if (existsSync(localPath)) {
          unlinkSync(localPath);
          this.logger.log(`Deleted locally: ${localPath}`);
        }
      }
    } catch (err) {
      this.logger.warn(`Failed to delete file: ${fileUrl}`, err);
    }
  }

  private getMimeType(ext: string): string {
    const map: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
    };
    return map[ext.toLowerCase()] || 'application/octet-stream';
  }
}
