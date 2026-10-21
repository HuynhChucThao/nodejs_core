import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../auth.constants';

// Đánh dấu route không cần đăng nhập
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);