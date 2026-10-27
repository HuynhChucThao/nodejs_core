import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { TokenStorage } from "../api/token-storage";
import { AuthEvents } from "./auth-events";
import { ApiError } from "../api/api-error";

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface SignInResult<TUser> {
    user: TUser;
    accessToken: string;
}

export interface AuthContextValue<TUser> {
    status: AuthStatus;
    user: TUser | null;
    isAuthenticated: boolean;

    // Chạy hàm đăng nhập/đăng ký của app, lưu token và user nếu thành công. Lỗi được ném lại cho form hiển thị
    signIn(perform: () => Promise<SignInResult<TUser>>): Promise<SignInResult<TUser>>;
    signOut: () => void;

    // Tải lại hồ sơ (ví dụ sau khi cập nhật thông tin cá nhân)
    refresh(): Promise<void>;

    // Cập nhật user cục bộ, không gọi API
    setUser(user: TUser): void;
}

export interface AuthProviderProps<TUser> {
    tokenStorage: TokenStorage;
    // Hàm lấy hồ sơ người dùng hiện tại (app truyền vào, ví dụ authApi.getProfile)
    fetchProfile: () => Promise<TUser>;
    // Kênh nhận tín hiệu hết phiên từ API client
    events: AuthEvents;
    children: ReactNode;
}

const AuthContext = createContext<AuthContextValue<any> | null>(null);

export function AuthProvider<TUser>(props: AuthProviderProps<TUser>) {
    const { tokenStorage, events, children } = props;

    // Giữ bản chất mới nhất của props trong ref để các hàm bên dưới không dổi danh tính mỗi lần render
    const propsRef = useRef(props);
    propsRef.current = props;

    const version = useRef(0);
    const [status, setStatus] = useState<AuthStatus>(() => tokenStorage.get() ? 'loading' : 'unauthenticated');
    const userRef = useRef<TUser | null>(null);
    const [user, setUserState] = useState<TUser | null>(null);
    userRef.current = user;

    const signOut = useCallback(() => {
        version.current++;
        propsRef.current.tokenStorage.set(null);
        setStatus('unauthenticated');
        setUserState(null);
    }, []);

    const loadProfile = useCallback(async () => {
        const run = ++version.current;
        try {
            const profile = await propsRef.current.fetchProfile();
            if (run !== version.current) return;
            setUserState(profile);
            setStatus('authenticated');
        } catch (err) {
            if (run !== version.current) return;
            // Chỉ 401 mới chứng tỏ token vô giá trị. Lỗi mạng hay 500 thì giữ token để thử lại sau
            if (err instanceof ApiError && err.status === 401) {
                propsRef.current.tokenStorage.set(null);
                setUserState(null);
                setStatus('unauthenticated');
                return;
            }
            // Lỗi tạm thời (mạng, 500): nếu đang có phiên thì giữ nguyên
            if (userRef.current) return;
            setUserState(null);
            setStatus('unauthenticated');
        }
    }, []);

    // Mở trang có token thì xác nhận lại với server
    useEffect(() => {
        if (!propsRef.current.tokenStorage.get()) {
            setStatus('unauthenticated');
            return;
        }
        setStatus('loading');
        void loadProfile();
        return () => {
            version.current++; // Hủy phản hồi đang chờ khi provider bị gỡ
        };
    }, [loadProfile]);

    // Hết phiên (401 khi đã có token) -> Tự đăng xuất
    useEffect(() => {
        if (!events) return;
        return events.subscribe(signOut);
    }, [events, signOut]);

    const signIn = useCallback(
        async (perform: () => Promise<SignInResult<TUser>>) => {
            const result = await perform(); // Lỗi ném thẳng ra, trạng thái cũ giữ nguyên
            version.current++;
            propsRef.current.tokenStorage.set(result.accessToken);
            setUserState(result.user);
            setStatus('authenticated');
            return result;
        },
        [],
    );

    const setUser = useCallback((user: TUser) => {
        setUserState(user);
        // Không thay đổi status, không lưu token
    }, []);

    const value = useMemo<AuthContextValue<TUser>>(
        () => ({
            status,
            user,
            isAuthenticated: status === 'authenticated',
            signIn,
            signOut,
            refresh: loadProfile,
            setUser,
        }),
        [status, user, signIn, signOut, loadProfile, setUser],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth<TUser = unknown>(): AuthContextValue<TUser> {
    const ctx = useContext(AuthContext);
    // Cast để TUser được áp dụng cho cả value và các hàm
    if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
    return ctx as AuthContextValue<TUser>;
}