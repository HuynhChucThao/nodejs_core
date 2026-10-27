import { useEffect, useRef, type ReactNode } from 'react';
import { useAuth } from './auth-provider'

export interface RequireAuthProps {
    children: ReactNode;
    // Role được phép. Bỏ trống = chỉ cần đăng nhập
    roles?: string[];
    // Cách lấy role từ user; mặc định user.role
    getRole?: (user: any) => string | undefined;
    // Hiển thị khi đang xác nhận phiên (tránh chuyển sang trang nhầm F5
    loading?: ReactNode;
    // Hiển thị khi chưa đăng nhập
    fallback?: ReactNode;
    // Hiển thị khi đã đăng nhập nhưng không đủ Role
    forbidden?: ReactNode;
    // Chạy một lần khi phát hiện chưa đăng nhập (ví dụ mở modal)
    onUnauthenticated?: () => void;
    // Chạy một lần khi phát hiện không đủ quyền (ví dụ không phải admin)
    onForbidden?: () => void;
}

export function RequireAuth(props: RequireAuthProps) {
    const { children, roles, loading = null, fallback = null, forbidden = null } = props;

    const getRole = props.getRole ?? ((user: any) => user?.role);

    const { user, status } = useAuth();

    // Ref để effect không chạy lại chỉ vì app truyền hàm mới mỗi lần render
    const propsRef = useRef(props);
    propsRef.current = props;

    const needsRole = !!roles && roles.length > 0;
    const hasRole = !needsRole || (user && roles.includes(getRole(user) ?? '')); // Không có role -> từ chối
    const isForbidden = status === 'authenticated' && !hasRole;
    
    useEffect(() => {
        if(status === 'unauthenticated') propsRef.current.onUnauthenticated?.();
    }, [status]);

    useEffect(() => {
        if (isForbidden) propsRef.current.onForbidden?.();
    }, [isForbidden]);

    // Đang xử lý (loading)
    if (status === 'loading') return <>{loading}</>;
    // Đã xác nhận chưa đăng nhập
    if (status === 'unauthenticated') return <>{fallback}</>;
    // Đã đăng nhập nhưng không đủ quyền
    if (isForbidden) return <>{forbidden}</>;
    // Đủ điều kiện
    return children;
}