import { Injectable } from '@nestjs/common';
import { HashingService } from './hashing.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService extends HashingService {
  async hash(passwordOrToken: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(passwordOrToken, saltRounds);
  }

  async compare(passwordOrToken: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(passwordOrToken, hash);
  }
}
