import { createParamDecorator, ExecutionContext } from "@nestjs/common";

// Lấy thông tin user từ request.user (đã được attach bởi JwtAuthGuard)
export const CurrentUser = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user;
    return field ? user?.[field] : user;
  },
);