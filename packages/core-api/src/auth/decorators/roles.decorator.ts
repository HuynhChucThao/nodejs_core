// role là chuỗi, core không biết enum của app

import { SetMetadata } from "@nestjs/common";
import { ROLES_KEY } from "../auth.constants";

// Đánh dấu route bắt buộc phải có role
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);