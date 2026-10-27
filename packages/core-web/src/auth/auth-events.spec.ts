import { createAuthEvents, AuthEvents } from "./auth-events";

describe('createAuthEvents', () => {
    it('phát tới mọi listener đã đăng ký', () => {
        const events = createAuthEvents();
        const listener1 = jest.fn();
        const listener2 = jest.fn();

        events.subscribe(listener1);
        events.subscribe(listener2);

        events.emitUnauthorized();

        expect(listener1).toHaveBeenCalledTimes(1);
        expect(listener2).toHaveBeenCalledTimes(1);
    });
    it('Hủy đăng ký thì không nhận nữa', () => {
        const events = createAuthEvents();
        const listener1 = jest.fn();
        const unsubscribe = events.subscribe(listener1);

        unsubscribe();
        events.emitUnauthorized();

        expect(listener1).not.toHaveBeenCalled();
    });
    it('listener tự hủy đăng ký trong lúc chạy không làm hỏng listener khác', () => {
        const events = createAuthEvents();
        const listener1 = jest.fn();
        const unsubscribe = events.subscribe(() => { })

        events.subscribe(listener1);
        events.emitUnauthorized();

        expect(listener1).toHaveBeenCalledTimes(1);
    });
});