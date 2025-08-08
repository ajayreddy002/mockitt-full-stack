import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('WASABI_BUCKET');

    this.s3Client = new S3Client({
      region: this.configService.get<string>('WASABI_REGION'),
      endpoint: this.configService.get<string>('WASABI_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('WASABI_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'WASABI_SECRET_ACCESS_KEY',
        ),
      },
      forcePathStyle: true, // Required for Wasabi compatibility
    });
  }

  async uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: {
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      const fileUrl = `${this.configService.get<string>('WASABI_ENDPOINT')}/${this.bucketName}/${key}`;
      this.logger.log(`File uploaded successfully: ${fileUrl}`);

      return fileUrl;
    } catch (error) {
      this.logger.error(`File upload failed: ${error.message}`);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async getFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const chunks: Uint8Array[] = [];

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error(`File retrieval failed: ${error.message}`);
      throw new Error(`Failed to retrieve file: ${error.message}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`File deletion failed: ${error.message}`);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async getSignedDownloadUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return signedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${error.message}`);
      throw new Error(`Failed to generate download URL: ${error.message}`);
    }
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  generateFileKey(userId: string, originalFileName: string): string {
    const timestamp = Date.now();
    const sanitizedFileName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `resumes/${userId}/${timestamp}_${sanitizedFileName}`;
  }
}
