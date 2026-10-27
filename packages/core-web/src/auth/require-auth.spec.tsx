/** @jest-environment jsdom */
import { render, screen, waitFor } from '@testing-library/react';
import type { TokenStorage } from '../api/token-storage';
import { createAuthEvents } from './auth-events';
import { AuthProvider as CoreAuthProvider } from './auth-provider';
import { RequireAuth, type RequireAuthProps } from './require-auth';

interface User {
  id: string;
  role?: string;
}

function tokens(initial: string | null): TokenStorage {
  let v = initial;
  return { get: () => v, set: (t) => void (v = t) };
}

function renderGate(opts: {
  token: string | null;
  profile?: () => Promise<User>;
  gate?: Partial<RequireAuthProps>;
}) {
  const profile = opts.profile ?? (async () => ({ id: '1', role: 'STUDENT' }));
  return render(
    <CoreAuthProvider tokenStorage={tokens(opts.token)} fetchProfile={profile} events={createAuthEvents()}>
      <RequireAuth
        loading={<span>dang tai</span>}
        fallback={<span>chua dang nhap</span>}
        forbidden={<span>khong du quyen</span>}
        {...opts.gate}
      >
        <span>noi dung</span>
      </RequireAuth>
    </CoreAuthProvider>,
  );
}

const has = (t: string) => screen.queryByText(t) !== null;

describe('RequireAuth', () => {
  it('đang xác nhận phiên → hiện loading, KHÔNG hiện fallback hay nội dung', () => {
    renderGate({ token: 'tok', profile: () => new Promise(() => undefined) });
    expect(has('dang tai')).toBe(true);
    expect(has('chua dang nhap')).toBe(false);
    expect(has('noi dung')).toBe(false);
  });

  it('chưa đăng nhập → fallback và gọi onUnauthenticated đúng một lần', async () => {
    const onUnauthenticated = jest.fn();
    renderGate({ token: null, gate: { onUnauthenticated } });
    await waitFor(() => expect(has('chua dang nhap')).toBe(true));
    expect(has('noi dung')).toBe(false);
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });

  it('đã đăng nhập, không yêu cầu role → hiện nội dung', async () => {
    renderGate({ token: 'tok' });
    await waitFor(() => expect(has('noi dung')).toBe(true));
  });

  it('đủ role → hiện nội dung', async () => {
    renderGate({
      token: 'tok',
      profile: async () => ({ id: '1', role: 'ADMIN' }),
      gate: { roles: ['ADMIN'] },
    });
    await waitFor(() => expect(has('noi dung')).toBe(true));
  });

  it('không đủ role → forbidden, gọi onForbidden, KHÔNG lộ nội dung', async () => {
    const onForbidden = jest.fn();
    renderGate({ token: 'tok', gate: { roles: ['ADMIN'], onForbidden } });
    await waitFor(() => expect(has('khong du quyen')).toBe(true));
    expect(has('noi dung')).toBe(false);
    expect(onForbidden).toHaveBeenCalledTimes(1);
  });

  it('yêu cầu role nhưng user không có role → từ chối (fail closed)', async () => {
    renderGate({
      token: 'tok',
      profile: async () => ({ id: '1' }),
      gate: { roles: ['ADMIN'] },
    });
    await waitFor(() => expect(has('khong du quyen')).toBe(true));
    expect(has('noi dung')).toBe(false);
  });

  it('getRole tùy chỉnh cho app có cấu trúc user khác', async () => {
    renderGate({
      token: 'tok',
      profile: async () => ({ id: '1', profile: { kind: 'ADMIN' } } as any),
      gate: { roles: ['ADMIN'], getRole: (u) => u.profile?.kind },
    });
    await waitFor(() => expect(has('noi dung')).toBe(true));
  });
});